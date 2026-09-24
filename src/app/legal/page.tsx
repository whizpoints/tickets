"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, Lock } from "lucide-react";

const tabs = [
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "privacy", label: "Privacy Policy", icon: Lock },
  { id: "security", label: "Security & Refunds", icon: Shield },
];

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
          >
            Legal Hub
          </motion.h1>
        </div>

        {/* Tab Bar */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-2 mb-8 relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? "text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-50 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="prose prose-blue max-w-none text-gray-600"
            >
              {activeTab === "terms" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms of Service</h2>
                  <p className="mb-4">Welcome to FlashPass. By using our platform, you agree to these terms.</p>
                  
                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. Account Registration</h3>
                  <p className="mb-4">You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
                  
                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. Ticket Purchases</h3>
                  <p className="mb-4">All ticket sales are final unless otherwise specified by the event organizer. FlashPass acts solely as a platform for organizers to sell tickets.</p>

                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. User Conduct</h3>
                  <p className="mb-4">You agree not to use the platform for any unlawful purpose or in any way that interrupts, damages, or impairs the service.</p>
                </div>
              )}

              {activeTab === "privacy" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
                  <p className="mb-4">We value your privacy and are committed to protecting your personal data.</p>
                  
                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">Data Collection</h3>
                  <p className="mb-4">We collect information you provide directly to us, such as when you create an account, purchase a ticket, or contact support.</p>
                  
                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">Data Usage</h3>
                  <p className="mb-4">Your data is used to provide, maintain, and improve our services, process transactions, and send related information including confirmations and receipts.</p>

                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">Data Sharing</h3>
                  <p className="mb-4">We share your information with event organizers for events you purchase tickets for. We do not sell your personal data to third parties.</p>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Refunds</h2>
                  <p className="mb-4">Information regarding platform security and our refund policies.</p>
                  
                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">Payment Security</h3>
                  <p className="mb-4">All payments are processed securely through our payment partners. FlashPass does not store your full credit card or mobile money details.</p>
                  
                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">Refund Policy</h3>
                  <p className="mb-4">Refund policies are determined by individual event organizers. FlashPass can only process refunds if authorized by the organizer or if the event is cancelled.</p>

                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-3">Reporting Issues</h3>
                  <p className="mb-4">If you notice any security vulnerabilities or suspicious activity on your account, please contact our support team immediately.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
