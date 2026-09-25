"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  QrCode,
  TrendingUp,
  Users,
  Ticket,
  Smartphone,
  Settings,
  LogOut,
  X,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Calendar
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function DashboardClient({ user, tickets = [], adminEvents = [], adminStats = {revenue:0, sold:0, active:0}, availableEvents = [], myEvents = [] }: { user: any, tickets: any[], adminEvents?: any[], adminStats?: any, availableEvents?: any[], myEvents?: any[] }) {
  const [isAdmin, setIsAdmin] = useState(user?.role === "ADMIN");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [waStatus, setWaStatus] = useState<any>({ isConnected: false, connectionState: "offline", qr: null, groups: [], activeGroupId: null });
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAdmin) {
      const checkWA = async () => {
        try {
          const res = await fetch(`/api/whatsapp/status`);
          const data = await res.json();
          setWaStatus(data);
        } catch (e) {
          console.error("WA Server offline");
        }
      };
      checkWA();
      interval = setInterval(checkWA, 3000);
    }
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleSetGroup = async (groupId: string) => {
    setIsSavingGroup(true);
    try {
      const res = await fetch('/api/whatsapp/set-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      });
      const data = await res.json();
      if(data.success) {
        setWaStatus({...waStatus, activeGroupId: data.activeGroupId});
        toast.success("Group saved");
      }
    } catch(e) {
      toast.error("Failed to save group");
      console.error(e);
    }
    setIsSavingGroup(false);
  };

  const handleWaLogout = async () => {
    await fetch(`/api/whatsapp/logout`, { method: 'POST' });
    toast.success("Logged out of WhatsApp");
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    setIsDeleting(id);
    toast.loading("Deleting event...", { id: "del" });
    try {
      const { deleteEvent } = await import('@/actions/event');
      await deleteEvent(id);
      toast.success("Deleted successfully", { id: "del" });
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event", { id: "del" });
    } finally {
      setIsDeleting(null);
    }
  };

  // Hydration safety
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      {/* Profile Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg uppercase">
              {user?.first_name?.charAt(0) || "U"}{user?.last_name?.charAt(0) || ""}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h1>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.phone || 'No Phone Added'}
                </span>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === "ADMIN" && (
              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Switch to {isAdmin ? "User" : "Admin"} Mode
              </button>
            )}
            <button onClick={async () => { await fetch('/api/auth/logout', {method: 'POST'}); window.location.href='/'; }} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!isAdmin ? (
          /* USER VIEW */
          <div className="space-y-12">
            
            {/* My Tickets Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Tickets</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.filter(t => t.status === 'ACTIVE' || t.status === 'SUCCESS').length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                    No tickets found. Browse events below to buy one!
                  </div>
                ) : (
                  tickets.filter(t => t.status === 'ACTIVE' || t.status === 'SUCCESS').map((ticket, idx) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setSelectedTicket(ticket)}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{String(ticket.id).split('-')[0].toUpperCase()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{ticket.event_title || ticket.event}</h3>
                      <p className="text-gray-500 text-sm mb-4">{new Date(ticket.event_date || ticket.date || "2024-01-01").toDateString()} • {ticket.package_name || ticket.package}</p>
                    
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.id}`} 
                          alt="QR Code" 
                          className="w-24 h-24 object-contain opacity-80 group-hover:opacity-100 transition-opacity mix-blend-multiply" 
                        />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* My Hosted Events Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Hosted Events</h2>
                <Link href="/events/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  <Calendar className="w-4 h-4" />
                  Post an Event
                </Link>
              </div>
              <div className="space-y-4">
                {myEvents.length === 0 ? (
                  <p className="text-gray-500 py-6 bg-white rounded-2xl text-center border border-gray-100">You haven't posted any events yet.</p>
                ) : (
                  myEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{event.title}</h4>
                        <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} &bull; {event.location}</p>
                      </div>
                      <div className="flex gap-3">
                        <Link 
                          href={`/events/${event.id}/edit`}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        >
                          Manage Tickets
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Browse Upcoming Events Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                <Link href="/events" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableEvents.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    No upcoming events available.
                  </div>
                ) : (
                  availableEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                        <div className="aspect-[16/9] bg-gray-200 relative overflow-hidden">
                          {event.image_url ? (
                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-500 mb-3">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
                            Get Tickets &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          /* ADMIN VIEW */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
              <Link 
                href="/admin/events/new" 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
              >
                <Ticket className="w-4 h-4" />
                Create New Event
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">KES {(adminStats?.revenue || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tickets Sold</p>
                  <p className="text-2xl font-bold text-gray-900">{(adminStats?.sold || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{(adminStats?.active || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Manage Events</h3>
              <div className="space-y-4">
                {adminEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No events found. Create your first event!</p>
                ) : (
                  adminEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          href={`/events/${event.id}/edit`}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Edit Tickets
                        </Link>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={isDeleting === event.id}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting === event.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Smartphone className="w-6 h-6 text-gray-700" />
                <h3 className="text-xl font-bold text-gray-900">WhatsApp Integration</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                  <p className="text-gray-600">
                    Link your business WhatsApp to automatically send tickets to users upon purchase. Scan the QR code with your WhatsApp app (Linked Devices) to connect.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    {waStatus.connectionState === "open" ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Disconnected
                      </div>
                    )}
                  </div>
                  
                  {waStatus.connectionState === "open" ? (
                    <div className="space-y-4">
                      <button onClick={handleWaLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
                        Disconnect
                      </button>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notification Group</label>
                        <select 
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                          value={waStatus.activeGroupId || ''}
                          onChange={(e) => handleSetGroup(e.target.value)}
                          disabled={isSavingGroup}
                        >
                          <option value="">-- Select a WhatsApp Group --</option>
                          {waStatus.groups?.map((g: any) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select the group where tickets will be broadcasted to your admins.</p>
                      </div>
                    </div>
                  ) : (
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors opacity-50 cursor-not-allowed">
                      <RefreshCcw className="w-4 h-4" />
                      Waiting for QR...
                    </button>
                  )}
                </div>
                <div className="w-full md:w-64 aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4">
                  {waStatus.isConnected || waStatus.connectionState === "open" ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                      <p className="text-sm text-green-600 font-medium text-center">Session Active</p>
                    </>
                  ) : waStatus.qr ? (
                    <img src={waStatus.qr} alt="WhatsApp QR" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <QrCode className="w-16 h-16 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500 text-center">Loading QR Code...</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Ticket Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden relative"
            >
              <button 
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 text-center border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedTicket.event_title || selectedTicket.event}</h3>
                <p className="text-blue-600 font-medium">{selectedTicket.package_name || selectedTicket.package}</p>
              </div>
              
              <div className="p-8 bg-gray-50 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedTicket.id}`} 
                    alt="Large QR Code" 
                    className="w-48 h-48 object-contain mix-blend-multiply" 
                  />
                </div>
                
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-500">Attendee</span>
                    <span className="font-medium text-gray-900">{user.first_name} {user.last_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-500">Ticket ID</span>
                    <span className="font-medium text-gray-900">{String(selectedTicket.id).split('-')[0].toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">{new Date(selectedTicket.event_date || selectedTicket.date || "2024-01-01").toDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
