import { sql } from '@/lib/neon';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import EditEventClient from './EditEventClient';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== 'ADMIN') redirect('/dashboard');
  
  const resolvedParams = await params;
  const events = await sql\SELECT * FROM events WHERE id = \\;
  if (!events.length) redirect('/dashboard');
  
  const packages = await sql\SELECT * FROM ticket_packages WHERE event_id = \\;
  
  // Calculate remaining for each package
  const enrichedPackages = [];
  for (const pkg of packages) {
    const soldRes = await sql\SELECT COUNT(*) as count FROM tickets WHERE package_id = \ AND status IN ('ACTIVE', 'SUCCESS', 'PENDING')\;
    const sold = parseInt(soldRes[0].count);
    enrichedPackages.push({ ...pkg, sold, remaining: pkg.capacity - sold });
  }

  return <EditEventClient event={events[0]} packages={enrichedPackages} />;
}
