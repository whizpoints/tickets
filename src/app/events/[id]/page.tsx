import { sql } from '@/lib/neon';
import EventClient from './EventClient';
import { getSession } from '@/lib/session';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const events = await sql`SELECT * FROM events WHERE id = ${resolvedParams.id}`;
  const rawPackages = await sql`SELECT * FROM ticket_packages WHERE event_id = ${resolvedParams.id}`;
  const session = await getSession();
  
  if (!events.length) return <div className="min-h-screen flex items-center justify-center text-gray-500">Event not found</div>;
  
  // Calculate dynamic pricing and remaining capacity
  const packages = [];
  for (const pkg of rawPackages) {
    const soldRes = await sql`SELECT COUNT(*) as count FROM tickets WHERE package_id = ${pkg.id} AND status IN ('ACTIVE', 'SUCCESS', 'PENDING')`;
    const sold = parseInt(soldRes[0].count);
    const remaining = pkg.capacity - sold;
    let currentPrice = Number(pkg.price);
    
    // Last 10 tickets are 15% higher
    if (remaining > 0 && remaining <= 10) {
      currentPrice = Math.ceil(currentPrice * 1.15);
    }
    
    packages.push({ ...pkg, remaining, currentPrice, originalPrice: Number(pkg.price) });
  }

  return <EventClient event={events[0]} packages={packages} session={session} />;
}
