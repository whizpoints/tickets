"use server";

import { sql } from "@/lib/neon";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

export async function createEvent(formData: FormData) {
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

  try {
    // Insert event
    await sql`
      INSERT INTO events (id, title, description, date, venue, location, image_url, organizer)
      VALUES (${eventId}, ${title}, ${description}, ${eventDate}, ${venue}, ${location}, ${coverImage}, 'FlashPass Admin')
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
  await sql`UPDATE ticket_packages SET capacity = ${capacity} WHERE id = ${pkgId}`;
  revalidatePath("/events");
  revalidatePath("/dashboard");
}

export async function updateEventDetails(id: string, formData: FormData) {
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