"use server";

import { sql } from '@/lib/neon';
import { initiateSTKPush } from '@/lib/mpesa';
import { v4 as uuidv4 } from 'uuid'; 

export async function processCheckout(formData: FormData) {
  try {
    const packageId = formData.get('packageId') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    let phone = formData.get('phone') as string;
    phone = phone.replace(/\s+/g, ''); // Remove spaces
    if (phone.startsWith('0')) {
      phone = '254' + phone.slice(1);
    } else if (phone.startsWith('+')) {
      phone = phone.slice(1);
    } else if (phone.length === 9) { // 712345678 -> 254712345678
      phone = '254' + phone;
    }

    // 1. Get package details with the event using JOIN
    const packages = await sql`
      SELECT tp.id, tp.price, tp.capacity, e.title as event_title 
      FROM ticket_packages tp 
      JOIN events e ON tp.event_id = e.id 
      WHERE tp.id = ${packageId}
      LIMIT 1
    `;
    
    if (packages.length === 0) throw new Error("Package not found");
    const pkg = packages[0];

    // Calculate capacity and dynamic price
    const soldRes = await sql`SELECT COUNT(*) as count FROM tickets WHERE package_id = ${pkg.id} AND status IN ('ACTIVE', 'SUCCESS', 'PENDING')`;
    const soldCount = parseInt(soldRes[0].count);
    const remaining = pkg.capacity - soldCount;

    if (remaining <= 0) {
      throw new Error("This ticket package is sold out");
    }

    let currentPrice = Number(pkg.price);
    if (remaining <= 10) {
      currentPrice = Math.ceil(currentPrice * 1.15); // 15% higher
    }

    // 2. Upsert user (Postgres ON CONFLICT)
    const users = await sql`
      INSERT INTO users (id, email, first_name, last_name, phone, created_at, updated_at)
      VALUES (${uuidv4()}, ${email}, ${firstName}, ${lastName}, ${phone}, NOW(), NOW())
      ON CONFLICT (email) 
      DO UPDATE SET first_name = ${firstName}, last_name = ${lastName}, phone = ${phone}, updated_at = NOW()
      RETURNING id
    `;
    const userId = users[0].id;

    // 3. Create pending ticket
    const ticketId = uuidv4();
    await sql`
      INSERT INTO tickets (id, user_id, package_id, status, created_at, updated_at)
      VALUES (${ticketId}, ${userId}, ${pkg.id}, 'PENDING', NOW(), NOW())
    `;

    // Generate Account Reference from Event Name
    const cleanEventName = pkg.event_title.replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();
    const accountRef = cleanEventName.substring(0, 12).trim();

    // 5. Initiate M-PESA STK Push
    const stkResponse = await initiateSTKPush(phone, currentPrice, accountRef, `Ticket for ${pkg.event_title}`);
    
    if (stkResponse.ResponseCode !== "0") {
      throw new Error(`M-PESA Error: ${stkResponse.errorMessage}`);
    }

    // 4. Create pending payment
    const paymentId = uuidv4();
    await sql`
      INSERT INTO payments (id, ticket_id, amount, phone, account_reference, status, checkout_request_id, created_at, updated_at)
      VALUES (${paymentId}, ${ticketId}, ${currentPrice}, ${phone}, ${accountRef}, 'PENDING', ${stkResponse.CheckoutRequestID}, NOW(), NOW())
    `;

    return { 
      success: true, 
      ticketId: ticketId, 
      checkoutRequestId: stkResponse.CheckoutRequestID 
    };

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { success: false, error: error.message };
  }
}

export async function checkTicketStatus(ticketId: string) {
  try {
    const payments = await sql`SELECT status FROM payments WHERE ticket_id = ${ticketId} ORDER BY created_at DESC LIMIT 1`;
    if (payments.length > 0) {
      return { status: payments[0].status };
    }
    return { status: 'PENDING' };
  } catch (error) {
    return { status: 'ERROR' };
  }
}
