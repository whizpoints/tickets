import { sql } from '@/lib/neon';
import EventsClient from './EventsClient';

export default async function EventsPage() {
  const events = await sql`SELECT * FROM events ORDER BY date ASC`;
  return <EventsClient events={events} />;
}
