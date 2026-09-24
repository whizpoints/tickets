import { sql } from '@/lib/neon';
import EventClient from './EventClient';
import { getSession } from '@/lib/session';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const events = await sql`SELECT * FROM events WHERE id = ${resolvedParams.id}`;
  const packages = await sql`SELECT * FROM ticket_packages WHERE event_id = ${resolvedParams.id}`;
  const session = await getSession();
  
  if (!events.length) return <div className="min-h-screen flex items-center justify-center text-gray-500">Event not found</div>;
  
  return <EventClient event={events[0]} packages={packages} session={session} />;
}
