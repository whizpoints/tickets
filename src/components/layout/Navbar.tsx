import Link from 'next/link';
import { Menu, User, Ticket, Zap } from 'lucide-react';
import { getSession } from '@/lib/session';
import MobileMenu from './MobileMenu';

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="FlashPass Logo" className="h-7 w-7 rounded" />
              <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                FlashPass
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#events" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Events
            </Link>
            {session && (
              <Link href="/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                <Ticket className="h-4 w-4" />
                My Tickets
              </Link>
            )}
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Support
            </Link>
            {session ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <MobileMenu session={session} />
        </div>
      </div>
    </nav>
  );
}
