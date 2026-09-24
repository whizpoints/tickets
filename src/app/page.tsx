import { sql } from '@/lib/neon';
import LandingClient from '@/components/landing/LandingClient';

export default async function Home() {
  const events = await sql`SELECT * FROM events ORDER BY date ASC LIMIT 6`;
  return <LandingClient events={events} />;
}
