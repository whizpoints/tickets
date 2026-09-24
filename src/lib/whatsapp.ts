export async function sendWhatsAppTicket(phone: string, ticketData: any) {
  console.log(`[WhatsApp] Preparing ticket for ${phone}`);
  
  const formattedPhone = phone.startsWith('+') ? phone.slice(1) : phone;
  const ticketLink = `${process.env.NEXT_PUBLIC_APP_URL}/ticket?id=${ticketData.id}`;
  
  const message = `*FlashPass Ticket Confirmed!*\n\nHi ${ticketData.user.firstName},\n\n*Event:* ${ticketData.package.event.title}\n*Package:* ${ticketData.package.name}\n*Date:* ${new Date(ticketData.package.event.date).toDateString()}\n*Venue:* ${ticketData.package.event.venue}\n\n*Click here to view your digital ticket & QR Code:*\n${ticketLink}\n\nThank you for using FlashPass!`;
  const userName = encodeURIComponent(ticketData.user.firstName + ' ' + ticketData.user.lastName);
  const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://api.whizpoint.app'}/api/ticket/image?id=${ticketData.id}&event=${encodeURIComponent(ticketData.package.event.title)}&pkg=${encodeURIComponent(ticketData.package.name)}&date=${encodeURIComponent(new Date(ticketData.package.event.date).toLocaleDateString())}&venue=${encodeURIComponent(ticketData.package.event.venue)}&name=${userName}&phone=${encodeURIComponent(ticketData.user.phone)}`;

  try {
    const waServiceUrl = process.env.WHATSAPP_SERVICE_URL || 'https://api.whizpoint.app';
    const waApiKey = process.env.WHATSAPP_SERVICE_API_KEY || ''; // If using the microservice
    const headers: any = { 'Content-Type': 'application/json' };
    if (waApiKey) headers['x-api-key'] = waApiKey;

    const response = await fetch(`${waServiceUrl}/api/send-message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ to: formattedPhone, message, imageUrl })
    });

    // Also send notification to Admin Group if configured
    if (process.env.ADMIN_WHATSAPP_GROUP_ID) {
      await fetch(`${waServiceUrl}/api/send-message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          to: process.env.ADMIN_WHATSAPP_GROUP_ID, 
          message: `🎟️ *New Ticket Sold!*\n\n*Event:* ${ticketData.package.event.title}\n*Package:* ${ticketData.package.name}\n*Buyer:* ${ticketData.user.firstName} ${ticketData.user.lastName}\n*Phone:* ${formattedPhone}` 
        })
      }).catch(e => console.error("[WhatsApp] Group notification failed:", e));
    }

    const data = await response.json();
    if (data.success || response.ok) {
      console.log(`[WhatsApp] Ticket sent successfully to ${phone}`);
      return true;
    } else {
      console.error(`[WhatsApp] Failed to send: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error(`[WhatsApp] Service unreachable:`, error);
    return false;
  }
}
