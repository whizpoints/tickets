'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Smartphone, CreditCard, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingClient({ events }: { events: any[] }) {
  return (
    <main className="flex min-h-screen flex-col w-full overflow-hidden bg-white">
      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] flex flex-col justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop" 
          alt="Concert crowd" 
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Experience Events <br />
              <span className="text-blue-400">Like Never Before</span>
            </h1>
            <p className="mt-6 text-xl text-gray-200 max-w-2xl font-light">
              Secure your spot at Kenya's most exclusive events. Pay with M-PESA, get your ticket on WhatsApp instantly.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/events" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30">
                Explore Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-white/10 border border-white/30 backdrop-blur-md rounded-full hover:bg-white/20">
                How It Works
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 items-center text-sm font-medium text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span>10,000+ Tickets Sold</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span>Instant M-PESA</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span>WhatsApp Delivery</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED EVENTS SECTION */}
      <section className="py-24 bg-gray-50 w-full" id="events">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Upcoming Events</h2>
            <p className="mt-4 text-lg text-gray-600">Don't miss out on these incredible experiences happening near you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                    {event.price}
                  </div>
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
          
          <div className="mt-12 text-center">
            <Link href="/events" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors">
              View All Events
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">How FlashPass Works</h2>
            <p className="mt-4 text-lg text-gray-600">Get your tickets in three simple steps. No accounts required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-100 z-0"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-white rounded-full border-8 border-gray-50 flex items-center justify-center shadow-sm mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-black text-gray-100 absolute top-0 -z-10 -mt-4">01</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Event</h3>
              <p className="text-gray-600">Browse and select your perfect event package from our curated list.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-white rounded-full border-8 border-gray-50 flex items-center justify-center shadow-sm mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-black text-gray-100 absolute top-0 -z-10 -mt-4">02</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pay via M-PESA</h3>
              <p className="text-gray-600">Instant STK push to your phone. Enter your PIN and you're done securely.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-white rounded-full border-8 border-gray-50 flex items-center justify-center shadow-sm mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-black text-gray-100 absolute top-0 -z-10 -mt-4">03</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Your Ticket</h3>
              <p className="text-gray-600">QR code ticket delivered instantly via WhatsApp & Email to your phone.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST/STATS SECTION */}
      <section className="bg-blue-600 py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-500/50">
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">10,000+</div>
              <div className="text-blue-100 font-medium">Tickets Sold</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">50+</div>
              <div className="text-blue-100 font-medium">Events Hosted</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">99.9%</div>
              <div className="text-blue-100 font-medium">Uptime</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">&lt; 5s</div>
              <div className="text-blue-100 font-medium">Delivery Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-white w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Ready to Experience Something Amazing?</h2>
          <p className="text-xl text-gray-600 mb-10">Join thousands of event-goers who trust FlashPass for their entertainment needs.</p>
          <Link href="/events" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1">
            Browse Upcoming Events
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>
    </main>
  );
}
