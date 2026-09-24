export async function sendWhatsAppTicket(phone: string, ticketData: any) {
  console.log(`[WhatsApp] Preparing ticket for ${phone}`);
  
  const formattedPhone = phone.startsWith('+') ? phone.slice(1) : phone;
  const ticketLink = `${process.env.NEXT_PUBLIC_APP_URL}/ticket?id=${ticketData.id}`;
  
  const message = `*FlashPass Ticket Confirmed!*\n\nHi ${ticketData.user.firstName},\n\n*Event:* ${ticketData.package.event.title}\n*Package:* ${ticketData.package.name}\n*Date:* ${new Date(ticketData.package.event.date).toDateString()}\n*Venue:* ${ticketData.package.event.venue}\n\n*Click here to view your digital ticket & QR Code:*\n${ticketLink}\n\nThank you for using FlashPass!`;

  const userName = encodeURIComponent(ticketData.user.firstName + ' ' + ticketData.user.lastName);
  const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://api.whizpoint.app'}/api/ticket/image?id=${ticketData.id}&event=${encodeURIComponent(ticketData.package.event.title)}&pkg=${encodeURIComponent(ticketData.package.name)}&date=${encodeURIComponent(new Date(ticketData.package.event.date).toLocaleDateString())}&venue=${encodeURIComponent(ticketData.package.event.venue)}&name=${userName}&phone=${encodeURIComponent(ticketData.user.phone)}`;

  const waServiceUrl = process.env.WHATSAPP_SERVICE_URL || 'https://api.whizpoint.app';
  const waApiKey = process.env.WHATSAPP_SERVICE_API_KEY || '';
  const headers: any = { 'Content-Type': 'application/json' };
  if (waApiKey) headers['x-api-key'] = waApiKey;

  try {
    // STEP 1: Send the ticket IMAGE with caption to the customer (primary delivery)
    let imageSent = false;
    try {
      const imgRes = await fetch(`${waServiceUrl}/api/send-message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ to: formattedPhone, message, imageUrl }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        imageSent = imgData.success === true;
      } else {
        console.error(`[WhatsApp] Image send HTTP ${imgRes.status}`);
      }
    } catch (imgErr) {
      console.error(`[WhatsApp] Image send failed, falling back to text:`, imgErr);
    }

    // STEP 2: If the image failed, send a plain text message so the customer ALWAYS gets their ticket
    if (!imageSent) {
      try {
        const txtRes = await fetch(`${waServiceUrl}/api/send-message`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ to: formattedPhone, message })
        });
        if (txtRes.ok) {
          console.log(`[WhatsApp] Text-only ticket sent to ${phone}`);
        } else {
          console.error(`[WhatsApp] Text fallback also failed HTTP ${txtRes.status}`);
        }
      } catch (txtErr) {
        console.error(`[WhatsApp] Text fallback error:`, txtErr);
      }
    } else {
      console.log(`[WhatsApp] Ticket with image sent successfully to ${phone}`);
    }

    // STEP 3: Send notification to Admin Group (fire-and-forget, never blocks)
    const activeGroupRes = await fetch(`${waServiceUrl}/api/status`, { headers }).catch(() => null);
    let activeGroupId = process.env.ADMIN_WHATSAPP_GROUP_ID || '';
    if (activeGroupRes && activeGroupRes.ok) {
      try {
        const statusData = await activeGroupRes.json();
        if (statusData.activeGroupId) activeGroupId = statusData.activeGroupId;
      } catch {}
    }

    if (activeGroupId) {
      fetch(`${waServiceUrl}/api/send-message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          to: activeGroupId, 
          message: `*New Ticket Sold!*\n\n*Event:* ${ticketData.package.event.title}\n*Package:* ${ticketData.package.name}\n*Buyer:* ${ticketData.user.firstName} ${ticketData.user.lastName}\n*Phone:* ${formattedPhone}` 
        })
      }).catch(e => console.error("[WhatsApp] Group notification failed:", e));
    }

    return true;
  } catch (error) {
    console.error(`[WhatsApp] Service unreachable:`, error);
    return false;
  }
}
