import { Suspense } from "react";
import { Zap, CheckCircle2, XCircle, Calendar, MapPin, Ticket } from "lucide-react";
import { sql } from "@/lib/neon";

async function TicketContent({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const ticketId = params.id || "";

  let ticket = null;
  let eventInfo = null;

  if (ticketId) {
    try {
      const tickets = await sql`
        SELECT t.id, t.status, p.name as package_name, e.title as event_title, e.date as event_date, e.venue as event_venue
        FROM tickets t
        JOIN ticket_packages p ON t.package_id = p.id
        JOIN events e ON p.event_id = e.id
        WHERE t.id = ${ticketId}
      `;
      if (tickets.length > 0) {
        ticket = tickets[0];
      }
    } catch (e) {
      console.error("Ticket fetch error:", e);
    }
  }

  const isValid = ticket?.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/favicon.ico" className="h-8 w-8 rounded" alt="Logo" />
            <span className="font-bold text-2xl text-gray-900">FlashPass</span>
          </div>
          <p className="text-gray-500 text-sm">Digital Ticket Verification</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {ticket ? (
            <>
              {isValid ? (
                <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-semibold text-sm">Ticket Verified — Valid Entry</span>
                </div>
              ) : (
                <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-700 font-semibold text-sm">Invalid or Used Ticket</span>
                </div>
              )}

              <div className="p-8 flex justify-center bg-gray-50 relative">
                {/* Modern curved cutouts for a real ticket feel */}
                <div className="absolute -left-4 top-1/2 w-8 h-8 bg-blue-50 rounded-full transform -translate-y-1/2 border-r border-gray-100" />
                <div className="absolute -right-4 top-1/2 w-8 h-8 bg-blue-50 rounded-full transform -translate-y-1/2 border-l border-gray-100" />
                
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`https://api.whizpoint.app/ticket?id=${ticketId}`)}&color=${isValid ? '000000' : '999999'}`}
                  alt="Ticket QR Code"
                  className={`w-56 h-56 rounded-xl ${!isValid && 'opacity-50 blur-[2px]'}`}
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-xl text-gray-900">{ticket.event_title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{ticket.package_name}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Ticket className="h-4 w-4" /> Ticket ID
                  </span>
                  <span className="font-mono font-bold text-blue-600">{ticketId.slice(0, 12)}...</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Date
                  </span>
                  <span className="text-gray-900 font-medium">{new Date(ticket.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Venue
                  </span>
                  <span className="text-gray-900 font-medium">{ticket.event_venue}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h3>
              <p className="text-gray-500 text-sm">The ticket ID provided does not exist in our system.</p>
            </div>
          )}

          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 text-center">
            <p className="text-xs text-gray-400">
              Present this QR code at the venue entrance for scanning.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} FlashPass &bull; Powered by M-PESA
        </p>
      </div>
    </div>
  );
}

export default function TicketVerifyPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TicketContent searchParams={searchParams} />
    </Suspense>
  );
}
