"use server";

import { sql } from "@/lib/neon";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/session";

export async function createEvent(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const venue = formData.get("venue") as string;
  const location = formData.get("location") as string;
  const coverImage = formData.get("coverImage") as string;

  const packagesStr = formData.get("packages") as string;
  const packages = packagesStr ? JSON.parse(packagesStr) : [];
  
  // Combine date and time to create a proper timestamp
  const eventDate = new Date(`${dateStr}T${timeStr || '00:00'}:00`).toISOString();
  
  const eventId = randomUUID();
  const organizerName = session.role === 'ADMIN' ? 'FlashPass Admin' : session.email;

  try {
    // Insert event
    await sql`
      INSERT INTO events (id, title, description, date, venue, location, image_url, organizer, user_id)
      VALUES (${eventId}, ${title}, ${description}, ${eventDate}, ${venue}, ${location}, ${coverImage}, ${organizerName}, ${session.userId})
    `;

    // Insert ticket packages
    if (packages.length > 0) {
      for (const pkg of packages) {
        const pkgId = randomUUID();
        await sql`
          INSERT INTO ticket_packages (id, event_id, name, description, price, capacity)
          VALUES (${pkgId}, ${eventId}, ${pkg.name}, ${pkg.name}, ${pkg.price}, ${pkg.capacity})
        `;
      }
    }

  } catch (error) {
    console.error("Failed to create event:", error);
    throw new Error("Failed to create event");
  }

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/");
}

export async function deleteEvent(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  const events = await sql`SELECT user_id FROM events WHERE id = ${id}`;
  if (!events.length) throw new Error("Not found");
  if (session.role !== 'ADMIN' && events[0].user_id !== session.userId) {
    throw new Error("Forbidden");
  }

  try {
    await sql`DELETE FROM events WHERE id = ${id}`;
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw new Error("Failed to delete event");
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/dashboard");
}

export async function getEventPackages(eventId: string) {
  const pkgs = await sql`SELECT * FROM ticket_packages WHERE event_id = ${eventId}`;
  return pkgs;
}

export async function updatePackage(pkgId: string, capacity: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  // Verify ownership
  const pkgs = await sql`
    SELECT e.user_id 
    FROM ticket_packages p 
    JOIN events e ON p.event_id = e.id 
    WHERE p.id = ${pkgId}
  `;
  if (!pkgs.length) throw new Error("Not found");
  if (session.role !== 'ADMIN' && pkgs[0].user_id !== session.userId) {
    throw new Error("Forbidden");
  }

  await sql`UPDATE ticket_packages SET capacity = ${capacity} WHERE id = ${pkgId}`;
  revalidatePath("/events");
  revalidatePath("/dashboard");
}

export async function updateEventDetails(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  const events = await sql`SELECT user_id FROM events WHERE id = ${id}`;
  if (!events.length) throw new Error("Not found");
  if (session.role !== 'ADMIN' && events[0].user_id !== session.userId) {
    throw new Error("Forbidden");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const venue = formData.get("venue") as string;
  const location = formData.get("location") as string;
  const coverImage = formData.get("coverImage") as string;
  
  const eventDate = new Date(`${dateStr}T${timeStr || '00:00'}:00`).toISOString();

  await sql`
    UPDATE events
    SET title = ${title},
        description = ${description},
        date = ${eventDate},
        venue = ${venue},
        location = ${location},
        image_url = ${coverImage}
    WHERE id = ${id}
  `;

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/dashboard");
}