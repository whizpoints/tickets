"use server";

import { sql } from "@/lib/neon";
import { setSession, logout } from "@/lib/session";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function sendOTPWhatsApp(phone: string, otp: string) {
  const formattedPhone = phone.startsWith('+') ? phone.slice(1) : phone;
  const message = `*FlashPass Verification*\n\nYour OTP code is: *${otp}*\n\nDo not share this code with anyone.`;
    const waServiceUrl = process.env.WHATSAPP_SERVICE_URL || 'https://api.whizpoint.app';
    const waApiKey = process.env.WHATSAPP_SERVICE_API_KEY || ''; 
    const headers: any = { 'Content-Type': 'application/json' };
    if (waApiKey) headers['x-api-key'] = waApiKey;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000); // 5 sec timeout
    await fetch(`${waServiceUrl}/api/send-message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ to: formattedPhone, message }),
      signal: controller.signal
    });
    clearTimeout(id);
  } catch (e) {
    console.error("Failed to send WhatsApp OTP", e);
  }
}

export async function loginUser(identifier: string, password?: string) {
  try {
    // format identifier if it is a phone number
    let formattedId = identifier.replace(/\s+/g, '');
    if (formattedId.startsWith('0') && formattedId.length === 10) {
      formattedId = '254' + formattedId.slice(1);
    } else if (formattedId.startsWith('+')) {
      formattedId = formattedId.slice(1);
    } else if (formattedId.length === 9 && (formattedId.startsWith('7') || formattedId.startsWith('1'))) {
      formattedId = '254' + formattedId;
    }

    // identifier can be email or formatted phone
    const users = await sql`SELECT * FROM users WHERE email = ${identifier} OR phone = ${formattedId}`;
    let user = users[0];

    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    // Verify Password
    if (password && user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return { success: false, error: "Invalid credentials" };
      }
    } else {
      return { success: false, error: "Invalid credentials" };
    }

    if (!user.is_verified) {
      // Re-send OTP if they try to log in without being verified
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60000); // 10 mins
      await sql`UPDATE users SET otp_code = ${otp}, otp_expires = ${expires} WHERE id = ${user.id}`;
      
      if (user.phone) await sendOTPWhatsApp(user.phone, otp);
      
      const { sendEmailOTP } = await import('@/lib/email');
      await sendEmailOTP(user.email, otp);

      await setSession(user.id, user.email, "UNVERIFIED");
      return { success: true, action: "verify" };
    }

    await setSession(user.id, user.email, user.role);
    revalidatePath("/dashboard");
    return { success: true, action: "dashboard" };
  } catch (error: any) {
    console.error("Login failed:", error);
    return { success: false, error: error.message };
  }
}

export async function registerUser(email: string, phone: string, password?: string) {
  try {
    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    } else if (formattedPhone.length === 9 && (formattedPhone.startsWith('7') || formattedPhone.startsWith('1'))) {
      formattedPhone = '254' + formattedPhone;
    }

    const existing = await sql`SELECT * FROM users WHERE email = ${email} OR phone = ${formattedPhone}`;
    if (existing.length > 0) {
      return { success: false, error: "Account with this email or phone already exists." };
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
    const role = adminEmails.includes(email) ? "ADMIN" : "USER";
    const userId = randomUUID();
    
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const insert = await sql`
      INSERT INTO users (id, email, phone, password, first_name, last_name, role, is_verified)
      VALUES (${userId}, ${email}, ${formattedPhone}, ${hashedPassword}, 'User', 'Name', ${role}, false)
      RETURNING *
    `;
    const user = insert[0];

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000); // 10 mins
    await sql`UPDATE users SET otp_code = ${otp}, otp_expires = ${expires} WHERE id = ${user.id}`;
    
    // Send OTP
    if (user.phone) {
      await sendOTPWhatsApp(user.phone, otp);
    }
    const { sendEmailOTP } = await import('@/lib/email');
    await sendEmailOTP(user.email, otp);

    // Set unverified session
    await setSession(user.id, user.email, "UNVERIFIED");
    return { success: true, action: "verify" };
  } catch (error: any) {
    console.error("Registration failed:", error);
    return { success: false, error: error.message };
  }
}

export async function verifyOtpAction(otp: string) {
  try {
    const { getSession } = await import("@/lib/session");
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: "Session expired" };

    const users = await sql`SELECT * FROM users WHERE id = ${session.userId}`;
    const user = users[0];

    if (!user) return { success: false, error: "User not found" };

    if (user.otp_code !== otp) {
      return { success: false, error: "Invalid OTP code" };
    }

    if (new Date(user.otp_expires) < new Date()) {
      return { success: false, error: "OTP has expired" };
    }

    await sql`UPDATE users SET is_verified = true, otp_code = null, otp_expires = null WHERE id = ${user.id}`;
    
    // Upgrade session
    await setSession(user.id, user.email, user.role);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Verify failed:", error);
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  await logout();
  revalidatePath("/");
  return { success: true };
}

export async function forgotPassword(identifier: string) {
  try {
    let formattedId = identifier.replace(/\s+/g, '');
    if (formattedId.startsWith('0') && formattedId.length === 10) {
      formattedId = '254' + formattedId.slice(1);
    } else if (formattedId.startsWith('+')) {
      formattedId = formattedId.slice(1);
    } else if (formattedId.length === 9 && (formattedId.startsWith('7') || formattedId.startsWith('1'))) {
      formattedId = '254' + formattedId;
    }

    const users = await sql`SELECT * FROM users WHERE email = ${identifier} OR phone = ${formattedId}`;
    const user = users[0];
    if (!user) return { success: false, error: "Account not found" };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000);
    await sql`UPDATE users SET otp_code = ${otp}, otp_expires = ${expires} WHERE id = ${user.id}`;

    if (user.phone) await sendOTPWhatsApp(user.phone, otp);
    const { sendEmailOTP } = await import('@/lib/email');
    await sendEmailOTP(user.email, otp);

    await setSession(user.id, user.email, "RESET_PASSWORD");
    return { success: true, action: "verify-reset" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetPassword(otp: string, newPassword: string) {
  try {
    const { getSession } = await import('@/lib/session');
    const session = await getSession();
    if (!session || session.role !== "RESET_PASSWORD") return { success: false, error: "Unauthorized" };

    const users = await sql`SELECT * FROM users WHERE id = ${session.userId}`;
    const user = users[0];
    if (!user) return { success: false, error: "User not found" };

    if (user.otp_code !== otp || new Date(user.otp_expires) < new Date()) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE users SET password = ${hashedPassword}, otp_code = NULL, is_verified = true WHERE id = ${user.id}`;
    
    await setSession(user.id, user.email, user.role);
    return { success: true, action: "dashboard" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
