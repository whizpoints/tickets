'use client'

import React, { useState } from 'react';
import { updatePackage, updateEventDetails } from '@/actions/event';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditEventClient({ event, packages }: { event: any, packages: any[] }) {
  const router = useRouter();
  
  // Package states
  const [pkgs, setPkgs] = useState(packages);
  
  // Event detail states
  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.description || '');
  
  // Parse existing date to get YYYY-MM-DD and HH:MM
  const existingDate = event.date ? new Date(event.date) : new Date();
  const dateStr = existingDate.toISOString().split('T')[0];
  const timeStr = existingDate.toISOString().split('T')[1].substring(0, 5);
  
  const [date, setDate] = useState(dateStr);
  const [time, setTime] = useState(timeStr);
  const [venue, setVenue] = useState(event.venue || '');
  const [location, setLocation] = useState(event.location || '');
  const [coverImage, setCoverImage] = useState(event.image_url || '');

  const [isSaving, setIsSaving] = useState(false);

  const handleCapacityChange = (id: string, value: string) => {
    setPkgs(pkgs.map(p => p.id === id ? { ...p, capacity: parseInt(value) || 0 } : p));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.loading("Saving all changes...", { id: "save" });
    try {
      // 1. Update Core Event Details
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("venue", venue);
      formData.append("location", location);
      formData.append("coverImage", coverImage);

      await updateEventDetails(event.id, formData);

      // 2. Update Packages
      for (const p of pkgs) {
        await updatePackage(p.id, p.capacity);
      }
      
      toast.success("Event updated successfully!", { id: "save" });
      router.push('/dashboard');
    } catch (e) {
      toast.error("Failed to update event", { id: "save" });
      console.error(e);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8 border-b pb-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit Event: {event.title}</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-12">
          
          {/* CORE EVENT DETAILS SECTION */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">1. Event Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Event Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cover Image URL</label>
                <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Time</label>
                <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Venue Name</label>
                <input required type="text" value={venue} onChange={e => setVenue(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location Map Link / City</label>
                <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* PACKAGES SECTION */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">2. Ticket Packages & Capacity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pkgs.map(pkg => (
                <div key={pkg.id} className="p-5 border rounded-xl bg-gray-50 shadow-sm relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">{pkg.name}</h3>
                    <span className="text-sm font-medium bg-white px-3 py-1 rounded-full border shadow-sm">Sold: {pkg.sold}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Total Capacity</label>
                    <input 
                      type="number"
                      value={pkg.capacity}
                      onChange={(e) => handleCapacityChange(pkg.id, e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm font-bold ${(pkg.capacity - pkg.sold) <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                        Remaining: {Math.max(0, pkg.capacity - pkg.sold)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-500/30"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving Everything...' : 'Save All Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
