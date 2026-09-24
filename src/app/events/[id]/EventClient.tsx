'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'
import { processCheckout, checkTicketStatus } from '@/actions/checkout'

import { useRouter } from 'next/navigation'

interface EventClientProps {
  event: any;
  packages: any[];
  session: any;
}

export default function EventClient({ event, packages, session }: EventClientProps) {
  const router = useRouter();
  // Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [pendingTicketId, setPendingTicketId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    voucher: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleOpenCheckout = (pkg: any) => {
    if (!session?.userId) {
      router.push('/login?redirect=/events/' + event.id);
      return;
    }
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
    setCheckoutStep(1);
    setCheckoutError(null);
  };

  useEffect(() => {
    if (checkoutStep === 3 && pendingTicketId) {
      const interval = setInterval(async () => {
        const result = await checkTicketStatus(pendingTicketId);
        if (result.status === 'SUCCESS' || result.status === 'ACTIVE') {
          setCheckoutStep(4); // Success step
          clearInterval(interval);
        } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
          setCheckoutError("Payment failed or was cancelled.");
          clearInterval(interval);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [checkoutStep, pendingTicketId]);

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleCheckoutSubmit = async () => {
    if (!selectedPackage || !formData.firstName || !formData.phone || !formData.email) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const submitData = new FormData();
      submitData.append('packageId', selectedPackage.id);
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);

      const result = await processCheckout(submitData);

      if (result.success) {
        setPendingTicketId(result.ticketId || null);
        setCheckoutStep(3);
      } else {
        setCheckoutError(result.error || "Payment initiation failed");
        setCheckoutStep(3); // Show error in step 3
      }
    } catch (error: any) {
      setCheckoutError(error.message || "An unexpected error occurred");
      setCheckoutStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* 1. Cinematic Banner */}
      <div className="relative w-full h-[50vh]">
        <img 
          src={event.image_url || "https://images.unsplash.com/photo-1540039155732-d6741b687a03?q=80&w=2000&auto=format&fit=crop"}
          alt={event.title || "Event Banner"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
          <Link href="/events" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{event.title || "Neon Nights Festival 2026"}</h1>
          <p className="text-gray-300 text-lg sm:text-xl">{event.venue}</p>
        </div>
      </div>

      {/* 2. Event Info Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm">
            <Calendar className="w-4 h-4" />
            <span>{event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Oct 15, 2026"}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm">
            <Clock className="w-4 h-4" />
            <span>{event.start_time || "8:00 PM"} - {event.end_time || "4:00 AM"}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm">
            <MapPin className="w-4 h-4" />
            <span>{event.location || "Uhuru Gardens, Nairobi"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 3. Left Column (About & Organizer) */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {event.description || `Get ready for an unforgettable night at Neon Nights Festival 2026! We're bringing together the best DJs from across the continent for an immersive electronic music experience. Expect mind-blowing visuals, state-of-the-art sound systems, and a vibrant community of music lovers.\n\nFood and drinks will be available from premium vendors. No outside food or drinks allowed. Come early to skip the lines and catch the sunset sets.`}
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <img 
                src="/images.jpg" 
                alt="Organizer" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{event.organizer_name || "VibeTribe Entertainment"}</h3>
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Verified Organizer • 12 Past Events</p>
                <p className="text-sm text-gray-600">Bringing the best nightlife experiences to East Africa since 2020.</p>
              </div>
            </section>
          </div>

          {/* 4. Right Column (Ticket Packages) */}
          <div className="lg:col-span-1 sticky top-24 space-y-4">
            <h2 className="text-xl font-semibold px-1">Select Tickets</h2>
            {packages && packages.length > 0 ? (
              packages.map((pkg) => (
                <div key={pkg.id} className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      KES {Number(pkg.price).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>
                  <button 
                    onClick={() => handleOpenCheckout(pkg)}
                    className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition"
                  >
                    Get Ticket
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center text-gray-500">
                No tickets available for this event yet.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. Checkout Drawer */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            onClick={() => {
              if (!isSubmitting && checkoutStep !== 3) handleCloseCheckout();
            }}
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${(!isSubmitting && checkoutStep !== 3) ? 'cursor-pointer' : ''}`}
          />
          <div 
            className="relative w-full sm:w-[480px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
          >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-semibold text-lg">Checkout</h2>
                {(!isSubmitting && checkoutStep !== 3) && (
                  <button onClick={handleCloseCheckout} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {selectedPackage && (
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Selected Package</p>
                      <p className="font-semibold">{selectedPackage.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600 font-medium">Total</p>
                      <p className="font-bold">KES {Number(selectedPackage.price).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* STEP 1 */}
                {checkoutStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="font-semibold text-xl mb-4">Your Details</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">First Name</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Last Name</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <button 
                        onClick={() => setCheckoutStep(2)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition mt-4"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {checkoutStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="font-bold text-xl text-green-600 tracking-tight">M-PESA</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">M-PESA Phone Number</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+254</span>
                          <input 
                            type="tel" 
                            className="w-full pl-14 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            placeholder="712 345 678"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Voucher Code <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="Enter code"
                          value={formData.voucher}
                          onChange={(e) => setFormData({...formData, voucher: e.target.value})}
                        />
                      </div>
                      
                      <div className="pt-4 mt-4 border-t border-gray-100 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Buyer</span>
                          <span className="font-medium">{formData.firstName || 'Guest'} {formData.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Item</span>
                          <span className="font-medium">{selectedPackage?.name}</span>
                        </div>
                        <div className="flex justify-between text-base font-semibold pt-2">
                          <span>Total Amount</span>
                          <span>KES {Number(selectedPackage?.price).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button 
                          onClick={() => setCheckoutStep(1)}
                          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
                          disabled={isSubmitting}
                        >
                          Back
                        </button>
                        <button 
                          onClick={handleCheckoutSubmit}
                          disabled={isSubmitting}
                          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition disabled:opacity-50"
                        >
                          {isSubmitting ? 'Processing...' : 'Pay Now'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {checkoutStep === 3 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center py-12">
                    {checkoutError ? (
                      <div className="text-red-600 mb-6">
                        <X className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Payment Failed</h3>
                        <p className="text-sm">{checkoutError}</p>
                        <button 
                          onClick={() => { setCheckoutStep(2); setCheckoutError(null); }}
                          className="mt-6 px-6 py-2 bg-gray-100 rounded-xl font-medium"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative w-20 h-20 mb-6">
                          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">Awaiting M-PESA PIN...</h3>
                        <p className="text-gray-500 mb-8 max-w-[250px]">
                          Check your phone ({formData.phone || '...'}) and enter your PIN to complete the payment.
                        </p>

                        <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-medium mb-8 w-full">
                          Your ticket will be sent via WhatsApp instantly after payment.
                        </div>

                        <button 
                          onClick={() => setCheckoutStep(2)}
                          className="text-gray-500 hover:text-gray-700 font-medium transition"
                        >
                          Cancel Payment
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
                {/* STEP 4 */}
                {checkoutStep === 4 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center py-12">
                    <CheckCircle2 className="w-20 h-20 text-green-500 mb-6 mx-auto" />
                    <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                    <p className="text-gray-500 mb-8 max-w-[250px] mx-auto">
                      Your ticket has been secured and sent to your WhatsApp and Email.
                    </p>
                    <Link 
                      href={`/ticket?id=${pendingTicketId}`}
                      className="px-6 py-3 bg-black text-white rounded-xl font-medium w-full mb-4 inline-block hover:bg-gray-800"
                    >
                      View Ticket
                    </Link>
                    <button 
                      onClick={handleCloseCheckout}
                      className="text-gray-500 hover:text-gray-700 font-medium transition"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
