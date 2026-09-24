"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, Ticket } from 'lucide-react';

export default function MobileMenu({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <X className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg px-4 pt-2 pb-6 space-y-4 z-40">
          <Link onClick={() => setIsOpen(false)} href="/events" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
            Events
          </Link>
          {session && (
            <Link onClick={() => setIsOpen(false)} href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium py-2">
              <Ticket className="h-5 w-5" />
              My Tickets
            </Link>
          )}
          <Link onClick={() => setIsOpen(false)} href="/contact" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
            Support
          </Link>
          <div className="pt-4 border-t border-gray-100">
            {session ? (
              <Link 
                onClick={() => setIsOpen(false)}
                href="/dashboard" 
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-md"
              >
                <User className="h-5 w-5" />
                Dashboard
              </Link>
            ) : (
              <Link 
                onClick={() => setIsOpen(false)}
                href="/login" 
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-md"
              >
                <User className="h-5 w-5" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
