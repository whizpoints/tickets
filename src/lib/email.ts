export async function sendEmailTicket(email: string, ticketData: any) {
  console.log(`[Email] Sending ticket to ${email}`);
  
  const brevoApiKey = process.env.BREVO_API_KEY!;
  
  const payload = {
    sender: { 
      name: "FlashPass Tickets", 
      email: `tickets@${process.env.NEXT_PUBLIC_DOMAIN || 'whizpoint.app'}` 
    },
    to: [{ email: email }],
    subject: `Your Ticket for ${ticketData.package.event.title} — FlashPass`,
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
      <div style="margin-bottom: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 5p2 0a2 2 0 0 1 2 2v2M19 15v2a2 2 0 0 1-2 2h-2M9 19H7a2 2 0 0 1-2-2v-2M5 9V7a2 2 0 0 1 2-2h2"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px 0;">FlashPass</h1>
      <p style="color:#93c5fd;font-size:14px;margin:0;">Your ticket is confirmed!</p>
    </div>
    
    <div style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <p style="color:#4b5563;font-size:16px;margin:0 0 16px 0;">Hi ${ticketData.user.firstName},</p>
      <h2 style="color:#111827;font-size:22px;margin:0 0 24px 0;text-align:center;">${ticketData.package.event.title}</h2>
      
      <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top;width:40%;">
              <span style="display:inline-block;vertical-align:middle;margin-right:6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </span>
              Date
            </td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;font-weight:600;">
              ${new Date(ticketData.package.event.date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top;border-top:1px solid #eee;">
              <span style="display:inline-block;vertical-align:middle;margin-right:6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </span>
              Venue
            </td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;font-weight:600;border-top:1px solid #eee;">${ticketData.package.event.venue}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top;border-top:1px solid #eee;">
              <span style="display:inline-block;vertical-align:middle;margin-right:6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </span>
              Package
            </td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;font-weight:600;border-top:1px solid #eee;">${ticketData.package.name}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top;border-top:1px solid #eee;">
              <span style="display:inline-block;vertical-align:middle;margin-right:6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
              </span>
              Ticket ID
            </td>
            <td style="padding:10px 0;color:#2563eb;font-size:14px;text-align:right;font-weight:600;border-top:1px solid #eee;">${ticketData.id}</td>
          </tr>
        </table>
      </div>
      
      <!-- Modern Ticket Image -->
      <div style="text-align:center;padding:12px;margin-bottom:24px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/api/ticket/image?id=${ticketData.id}&event=${encodeURIComponent(ticketData.package.event.title)}&pkg=${encodeURIComponent(ticketData.package.name)}&date=${encodeURIComponent(new Date(ticketData.package.event.date).toLocaleDateString())}&venue=${encodeURIComponent(ticketData.package.event.venue)}&name=${encodeURIComponent(ticketData.user.firstName + ' ' + ticketData.user.lastName)}" 
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
    subject: `Your FlashPass Verification Code: ${otp}`,
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:450px;margin:40px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
    <div style="background:#111827;padding:24px;text-align:center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <h2 style="color:#ffffff;margin:12px 0 0 0;font-size:20px;font-weight:600;">Security Verification</h2>
    </div>
    <div style="padding:32px;text-align:center;">
      <p style="color:#4b5563;font-size:15px;margin-bottom:24px;">Please use the following one-time code to securely verify your account:</p>
      <div style="background:#f3f4f6;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h1 style="font-size:36px;letter-spacing:8px;color:#2563eb;margin:0;font-family:monospace;">${otp}</h1>
      </div>
      <p style="color:#9ca3af;font-size:13px;margin:0;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  </div>
</body>
</html>
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
