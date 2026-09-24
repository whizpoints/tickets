import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { sendWhatsAppTicket } from '@/lib/whatsapp';
import { sendEmailTicket } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const callbackData = data.Body.stkCallback;
    const checkoutRequestID = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;

    // Get pending payment with relations via JOINs, now using checkout_request_id instead of phone
    const payments = await sql`
      SELECT p.id as payment_id, p.ticket_id, u.email as user_email, u.first_name, u.last_name, u.phone as user_phone, e.title as event_title, tp.name as package_name, e.date as event_date, e.venue as event_venue
      FROM payments p
      JOIN tickets t ON p.ticket_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN ticket_packages tp ON t.package_id = tp.id
      JOIN events e ON tp.event_id = e.id
      WHERE p.checkout_request_id = ${checkoutRequestID} AND p.status = 'PENDING'
      ORDER BY p.created_at DESC
      LIMIT 1
    `;

    if (payments.length === 0) {
      console.error('No pending payment found for this transaction.');
      return NextResponse.json({ status: 'not_found' }, { status: 200 });
    }

    const pendingPayment = payments[0];

    if (resultCode !== 0) {
      console.log(`Payment failed for request ${checkoutRequestID}. ResultCode: ${resultCode}`);
      // Mark as failed so UI knows
      await sql`
        UPDATE payments SET status = 'FAILED', updated_at = NOW()
        WHERE id = ${pendingPayment.payment_id}
      `;
      // Mark ticket as failed/cancelled
      await sql`
        UPDATE tickets SET status = 'CANCELLED', updated_at = NOW()
        WHERE id = ${pendingPayment.ticket_id}
      `;
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const metadata = callbackData.CallbackMetadata.Item;
    const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
    const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value?.toString();

    // Update payment
    await sql`
      UPDATE payments SET status = 'SUCCESS', mpesa_receipt = ${mpesaReceiptNumber}, updated_at = NOW()
      WHERE id = ${pendingPayment.payment_id}
    `;

    // Update ticket
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${pendingPayment.ticket_id}`;
    await sql`
      UPDATE tickets SET status = 'ACTIVE', qr_code = ${qrUrl}, updated_at = NOW()
      WHERE id = ${pendingPayment.ticket_id}
    `;

    // Prepare ticket data for delivery services
    const ticketData = {
      id: pendingPayment.ticket_id,
      package: {
        name: pendingPayment.package_name,
        event: {
          title: pendingPayment.event_title,
          date: pendingPayment.event_date,
          venue: pendingPayment.event_venue
        }
      },
      user: {
        firstName: pendingPayment.first_name,
        lastName: pendingPayment.last_name,
        phone: phoneNumber || pendingPayment.user_phone
      }
    };
    
    // 1. WhatsApp Delivery
    await sendWhatsAppTicket(phoneNumber, ticketData);
    
    // 2. Email Delivery
    await sendEmailTicket(pendingPayment.user_email, ticketData);

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
