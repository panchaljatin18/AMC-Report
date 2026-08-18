"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  Building2,
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Please enter your Username");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your Password");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      await login(username, password, rememberMe);
    } catch (err) {
      setErrorMsg(err.message || "Invalid Username or Password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-x-hidden bg-gradient-to-br from-slate-950 via-[#0B1528] to-slate-950 p-4 sm:p-6 md:p-8 select-none">
      {/* Ambient background glow & grid */}
      <div className="absolute top-10 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[700px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Responsive Container Wrapper */}
      <div className="relative z-10 w-full max-w-[420px] sm:max-w-[450px] md:max-w-[480px] my-auto">
        {/* Main Card Container */}
        <div className="bg-white/98 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-9 shadow-2xl shadow-black/60 ring-1 ring-slate-900/5">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-6 sm:mb-7">
            <div className="inline-flex items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-blue-950 border border-slate-700 shadow-xl shadow-blue-900/20 mb-1 ring-4 ring-blue-500/10">
              <Image
                src="/AMC Logo.webp"
                alt="AMC Emblem Logo"
                width={72}
                height={72}
                priority
                unoptimized
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 object-contain drop-shadow-md"
              />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase mb-2 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>AMC Officer Command Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-2xl font-black text-slate-900 tracking-tight">
                CCRS CRM Command Center
              </h1>
              <p className="text-xs sm:text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                Automated Municipal Complaints & PowerPoint Analytics Engine
              </p>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-5 p-3 sm:p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-xs font-semibold flex items-center space-x-2.5 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
            {/* Username Input */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-xs font-bold text-slate-700">
                  Username
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Officer ID</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Jatin Panchal"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300/90 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Secure Key</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300/90 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & SSL Badge */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs sm:text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-colors cursor-pointer"
                />
                <span>Remember this workstation</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>SSL Secured</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 py-3 sm:py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 active:scale-[0.98] shadow-blue-600/25 hover:shadow-blue-600/35 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Officer Access...</span>
                </>
              ) : (
                <>
                  <span>Sign In to CCRS Command System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint Banner */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="inline-flex items-center space-x-1.5 text-[11px] text-slate-600 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200">
              <KeyRound className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Admin Officer: <strong className="text-slate-900 font-bold">Jatin Panchal</strong></span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center text-[11px] text-slate-400 space-y-0.5">
          <p className="font-semibold text-slate-300">
            Ahmedabad Municipal Corporation • CCRS Command & Control
          </p>
          <p className="text-[10px] text-slate-500">
            Restricted System • Authorized Municipal Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
