export async function sendEmailTicket(email: string, ticketData: any) {
  console.log(`[Email] Sending ticket to ${email}`);
  
  const brevoApiKey = process.env.BREVO_API_KEY!;
  
  const payload = {
    sender: { 
      name: "FlashPass Tickets", 
      email: `tickets@${process.env.NEXT_PUBLIC_DOMAIN || 'whizpoint.app'}` 
    },
    to: [{ email: email }],
    subject: `🎟️ Your Ticket for ${ticketData.package.event.title} — FlashPass`,
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px 0;">⚡ FlashPass</h1>
      <p style="color:#93c5fd;font-size:14px;margin:0;">Your ticket is confirmed!</p>
    </div>
    
    <!-- Ticket Card -->
    <div style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <h2 style="color:#111827;font-size:22px;margin:0 0 24px 0;">${ticketData.package.event.title}</h2>
      
      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">📅 Date</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;text-align:right;font-weight:600;">
              ${new Date(ticketData.package.event.date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">📍 Venue</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;text-align:right;font-weight:600;">${ticketData.package.event.venue}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">🎟️ Package</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;text-align:right;font-weight:600;">${ticketData.package.name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">🔑 Ticket ID</td>
            <td style="padding:8px 0;color:#2563eb;font-size:14px;text-align:right;font-weight:600;">${ticketData.id}</td>
          </tr>
        </table>
      </div>
      
      <!-- Modern Ticket Image -->
      <div style="text-align:center;padding:12px;margin-bottom:24px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/api/ticket/image?id=${ticketData.id}&event=${encodeURIComponent(ticketData.package.event.title)}&pkg=${encodeURIComponent(ticketData.package.name)}&date=${encodeURIComponent(new Date(ticketData.package.event.date).toLocaleDateString())}&venue=${encodeURIComponent(ticketData.package.event.venue)}" 
             alt="Your Digital Ticket" width="100%" style="max-width:600px;border-radius:15px;box-shadow:0 10px 25px rgba(0,0,0,0.1);" />
      </div>
      
      <p style="color:#6b7280;font-size:13px;text-align:center;margin:0;">
        This ticket was also sent to your WhatsApp. Keep it safe!
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background:#f9fafb;border-radius:0 0 16px 16px;padding:24px;text-align:center;border:1px solid #e5e7eb;border-top:0;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        &copy; ${new Date().getFullYear()} FlashPass &bull; Powered by M-PESA<br/>
        <a href="https://${process.env.NEXT_PUBLIC_DOMAIN || 'whizpoint.app'}" style="color:#2563eb;text-decoration:none;">
          ${process.env.NEXT_PUBLIC_DOMAIN || 'whizpoint.app'}
        </a>
      </p>
    </div>
    
  </div>
</body>
</html>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Failed to send email via Brevo', await response.text());
      return false;
    }
    
    console.log(`[Email] Ticket sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email', error);
    return false;
  }
}

export async function sendEmailOTP(email: string, otp: string) {
  const brevoApiKey = process.env.BREVO_API_KEY!;
  const payload = {
    sender: { name: "FlashPass Security", email: `security@${process.env.NEXT_PUBLIC_DOMAIN || 'whizpoint.app'}` },
    to: [{ email: email }],
    subject: `🔐 Your FlashPass Verification Code: ${otp}`,
    htmlContent: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:10px;">
        <h2>FlashPass Verification</h2>
        <p>Your one-time verification code is:</p>
        <h1 style="font-size:32px;letter-spacing:5px;color:#2563eb;text-align:center;">${otp}</h1>
        <p style="color:#666;font-size:12px;">This code will expire in 10 minutes. Do not share it with anyone.</p>
      </div>
    `
  };
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': brevoApiKey },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
