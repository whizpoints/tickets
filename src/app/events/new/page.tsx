"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createEvent } from "@/actions/event";
import { Calendar, MapPin, Clock, Image as ImageIcon, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packages, setPackages] = useState([{ id: 1, name: "General Admission", price: "", capacity: "" }]);

  const addPackage = () => {
    setPackages([...packages, { id: Date.now(), name: "", price: "", capacity: "" }]);
  };

  const removePackage = (id: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  const updatePackage = (id: number, field: string, value: string) => {
    setPackages(packages.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Clean packages array to remove the temp 'id' and append as JSON string
    const cleanedPackages = packages.map(({ id, ...rest }) => rest);
    formData.append("packages", JSON.stringify(cleanedPackages));
    
    try {
      await createEvent(formData);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link 
          href="/admin/events" 
          className="mb-8 flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Event</h1>
          <p className="mt-2 text-gray-500">Add a new event to the FlashPass platform.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
          >
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Event Details</h2>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="title">
                  Event Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Coachella Valley Music and Arts Festival"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe the event..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="date">
                    Date
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="time">
                    Time
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="venue">
                    Venue Name
                  </label>
                  <input
                    id="venue"
                    name="venue"
                    type="text"
                    placeholder="e.g. Madison Square Garden"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="location">
                    City / Location
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. New York, NY"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor="coverImage">
                  Cover Image URL
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="coverImage"
                    name="coverImage"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ticket Packages Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Ticket Packages</h2>
                <p className="mt-1 text-sm text-gray-500">Define the ticket types and capacities.</p>
              </div>
              <button
                type="button"
                onClick={addPackage}
                className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
              >
                <Plus className="h-4 w-4" />
                Add Package
              </button>
            </div>

            <div className="space-y-4">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">Package Name</label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => updatePackage(pkg.id, "name", e.target.value)}
                      placeholder="Package Name (e.g. VIP)"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pkg.price}
                      onChange={(e) => updatePackage(pkg.id, "price", e.target.value)}
                      placeholder="Price ($)"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="mb-1 block text-xs font-medium text-gray-500 sm:hidden">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={pkg.capacity}
                      onChange={(e) => updatePackage(pkg.id, "capacity", e.target.value)}
                      placeholder="Capacity"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  {packages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePackage(pkg.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm transition-colors hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-gray-800 disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Event...
                </>
              ) : (
                "Publish Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
