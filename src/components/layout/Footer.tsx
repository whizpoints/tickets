import Link from 'next/link';
import { Globe, Camera, MessageSquare, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/images.jpg" alt="FlashPass Logo" className="h-6 w-6 rounded-md" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                FlashPass
              </span>
            </Link>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              The ultra-modern event ticketing platform. Group packages, instant M-PESA payments, and WhatsApp ticket delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#events" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/legal" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Security & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Camera className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </a>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>support@whizpoint.app</p>
              <p>0718 311 346</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FlashPass. All rights reserved.
          </p>
          <p className="text-sm font-medium text-gray-500">
            Powered by Neon DB & M-PESA
          </p>
        </div>
      </div>
    </footer>
  );
}
