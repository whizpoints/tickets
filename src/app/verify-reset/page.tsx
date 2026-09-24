"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { resetPassword } from "@/actions/auth";

export default function VerifyResetPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await resetPassword(otp, newPassword);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setErrorMsg(result.error || "Reset failed");
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white pt-16">
      {/* Left side - Image & Branding */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1540039155732-67623d38698c?q=80&w=1200&auto=format&fit=crop"
          alt="Concert crowd verification"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col items-start justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black p-1">
              <img src="/images.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FlashPass</span>
          </div>
          <div className="max-w-md">
            <h1 className="mb-4 text-5xl font-bold leading-tight">
              Secure your access.
            </h1>
            <p className="text-lg text-white/80">
              We employ strict verification to ensure your tickets and account remain entirely yours.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-12 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white p-1">
              <img src="/images.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-black">FlashPass</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
              Check your messages
            </h2>
            <p className="mb-8 text-gray-500">
              We've sent a 6-digit verification code to your WhatsApp and Email. Enter it below to secure your account.
            </p>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center text-4xl tracking-[0.5em] font-mono py-4 rounded-2xl border-2 border-gray-200 focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-300"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Code expires in 10 minutes
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-center text-2xl font-mono py-4 rounded-2xl border-2 border-gray-200 focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-300"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-4 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
