export async function sendWhatsAppTicket(phone: string, ticketData: any) {
  console.log(`[WhatsApp] Preparing ticket for ${phone}`);
  
  const formattedPhone = phone.startsWith('+') ? phone.slice(1) : phone;
  const ticketLink = `${process.env.NEXT_PUBLIC_APP_URL}/ticket?id=${ticketData.id}`;
  
  const message = `🎟️ *FlashPass Ticket Confirmed!*\n\n*Event:* ${ticketData.package.event.title}\n*Package:* ${ticketData.package.name}\n*Date:* ${new Date(ticketData.package.event.date).toDateString()}\n*Venue:* ${ticketData.package.event.venue}\n\n*Click here to view your digital ticket & QR Code:*\n${ticketLink}\n\nThank you for using FlashPass! ⚡`;
  const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/ticket/image?id=${ticketData.id}&event=${encodeURIComponent(ticketData.package.event.title)}&pkg=${encodeURIComponent(ticketData.package.name)}&date=${encodeURIComponent(new Date(ticketData.package.event.date).toLocaleDateString())}&venue=${encodeURIComponent(ticketData.package.event.venue)}`;

  try {
    const response = await fetch('http://localhost:3000/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone, message, imageUrl })
    });

    const data = await response.json();
    if (data.success) {
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
