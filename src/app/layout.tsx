import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FAB from "@/components/layout/FAB";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FlashPass - Ultra-modern Event Ticketing",
  description: "Secure your spot at Kenya's most exclusive events. Pay instantly with M-PESA and get your ticket delivered directly to your WhatsApp.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://api.whizpoint.app"),
  openGraph: {
    title: "FlashPass - Ultra-modern Event Ticketing",
    description: "Secure your spot at Kenya's most exclusive events. Pay instantly with M-PESA and get your ticket delivered directly to your WhatsApp.",
    url: "/",
    siteName: "FlashPass",
    images: [
      {
        url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "FlashPass Events Hero Image",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlashPass - Ultra-modern Event Ticketing",
    description: "Secure your spot at Kenya's most exclusive events. Pay instantly with M-PESA and get your ticket delivered directly to your WhatsApp.",
    images: ["https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Toaster position="top-center" />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
        <FAB />
      </body>
    </html>
  );
}
