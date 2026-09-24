"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

export default function EventsClient({ events }: { events: any[] }) {
  return (
    <main className="flex min-h-screen flex-col w-full bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">All Events</h1>
          <p className="mt-4 text-lg text-gray-600">Discover and book tickets for the best events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  <Link href={`/events/${event.id}`}>
                    {event.title}
                  </Link>
                </h3>
                
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-blue-500 shrink-0" />
                    <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-blue-500 shrink-0" />
                    <span className="text-sm line-clamp-1">{event.location}</span>
                  </div>
                </div>
                
                <Link 
                  href={`/events/${event.id}`}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  Get Tickets
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        {events.length === 0 && (
          <div className="text-center text-gray-500 py-12">No events found.</div>
        )}
      </div>
    </main>
  );
}
