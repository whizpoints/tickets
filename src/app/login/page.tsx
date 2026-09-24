"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Ticket, ArrowRight, Loader2 } from "lucide-react";
import { loginUser, registerUser } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [identifier, setIdentifier] = useState(""); // email or phone for login
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      let result;
      const { forgotPassword } = await import('@/actions/auth');
      
      if (isForgotMode) {
        result = await forgotPassword(identifier);
      } else if (isLogin) {
        result = await loginUser(identifier, password);
      } else {
        result = await registerUser(email, phone, password);
      }

      if (result.success) {
        if (result.action === "verify") {
          router.push("/verify");
        } else if (result.action === "verify-reset") {
          router.push("/verify-reset");
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMsg(result.error || "Action failed");
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white pt-16">
      {/* Left side - Image & Branding */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop"
          alt="Concert crowd"
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
              Experience the extraordinary.
            </h1>
            <p className="text-lg text-white/80">
              Your portal to the most exclusive events, concerts, and experiences worldwide.
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
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="mb-8 text-gray-500">
              {isLogin
                ? "Enter your details to access your account."
                : "Join FlashPass to start exploring events."}
            </p>

            <div className="mb-8 flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
                  isLogin ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
                  !isLogin ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                }`}
              >
                Sign Up
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isLogin ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or +254..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">WhatsApp Number (Required for OTP)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254700000000"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                </>
              )}

              {!isForgotMode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900">
                      Password
                    </label>
                    {isLogin && (
                      <button type="button" onClick={() => setIsForgotMode(true)} className="text-sm font-medium text-gray-500 hover:text-black">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
                    required={!isForgotMode}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:bg-gray-300"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isForgotMode ? "Send Reset OTP" : (isLogin ? "Sign In" : "Create Account & Verify")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {isForgotMode && (
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setIsForgotMode(false)} className="text-sm text-gray-500 hover:text-black">
                    Back to login
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
