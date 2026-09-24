export async function getMpesaToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(
    'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: 'no-store',
    }
  );

  const data = await response.json();
  return data.access_token;
}

export async function initiateSTKPush(phoneStr: string, amount: number, accountReference: string, transactionDesc: string = 'FlashPass Ticket') {
  const token = await getMpesaToken();
  
  let phone = phoneStr.trim();
  if (phone.startsWith('+')) phone = phone.slice(1);
  if (phone.startsWith('0')) phone = '254' + phone.slice(1);
  if (phone.length === 9) phone = '254' + phone;

  const shortCode = process.env.MPESA_SHORTCODE!;     // Business Shortcode (7128505)
  const partyB = process.env.MPESA_PARTY_B!;           // Till Number (3098707)
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  // Callback routed through the secure tunnel per user rules or production domain
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://api.whizpoint.app'}/api/webhooks/mpesa`;

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerBuyGoodsOnline',
    Amount: Math.ceil(amount),
    PartyA: phone,
    PartyB: partyB,          // Till Number where money lands
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference.substring(0, 12),
    TransactionDesc: transactionDesc.substring(0, 13),
  };

  console.log(`[M-PESA] STK Push → Phone: ${phone}, Amount: ${amount}, Till: ${partyB}, Ref: ${accountReference}`);

  const response = await fetch(
    'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();
  console.log(`[M-PESA] Response:`, JSON.stringify(result));
  return result;
}
