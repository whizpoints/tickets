import DashboardClient from "./DashboardClient";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/neon";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardServerPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "UNVERIFIED") {
    redirect("/verify");
  }

  // Fetch full user data
  const users = await sql`SELECT * FROM users WHERE id = ${session.userId}`;
  const fullUser = users[0] || session;

  // Fetch real tickets for this user
  const tickets = await sql`
    SELECT t.id, t.status, e.title as event_title, p.name as package_name, e.date as event_date
    FROM tickets t
    JOIN ticket_packages p ON t.package_id = p.id
    JOIN events e ON p.event_id = e.id
    WHERE t.user_id = ${session.userId}
  `;

  let adminEvents: any[] = [];
  if (fullUser.role === "ADMIN") {
    adminEvents = await sql`
      SELECT id, title, date, location 
      FROM events 
      ORDER BY created_at DESC
    `;
  }

  return <DashboardClient user={fullUser} tickets={tickets} adminEvents={adminEvents} />;
}
