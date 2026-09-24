'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function FAB() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.5 
      }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link
        href="https://wa.me/254700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full text-white shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </Link>
    </motion.div>
  );
}
