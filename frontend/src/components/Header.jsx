"use client";

import Link from "next/link";
import Image from "next/image";
import { Activity, ShieldCheck, Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header({
  onToggleMobileMenu,
  mobileMenuOpen = false,
}) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-md text-white border-b border-zinc-800/80 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between shadow-xl">
      <div className="flex items-center space-x-3 sm:space-x-3.5">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className={`md:hidden flex items-center justify-center p-2.5 -ml-1 rounded-xl border transition-all active:scale-90 cursor-pointer ${
            mobileMenuOpen
              ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/30"
              : "bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 text-blue-400 hover:text-white shadow-xs"
          }`}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3">
          <Image
            src="/AMC Logo.webp"
            alt="AMC Logo"
            width={56}
            height={56}
            priority
            unoptimized
            className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-md select-none shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2 truncate">
              CCRS CRM
              <span className="text-[10px] sm:text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700 font-medium shrink-0">
                Auto Report
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-400 hidden xs:block truncate">
              Command & Control Room System • Zero Math Mismatch Engine
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Officer Profile Badge */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-950/80 to-zinc-900 border border-blue-500/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs shadow-inner">
          <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[11px] font-bold text-white leading-tight">
              {user?.name || "Jatin Panchal"}
            </div>
            <div className="text-[9px] text-blue-400 font-medium leading-tight">
              Admin • AMC CCRS
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out of CCRS Command Center"
          className="flex items-center space-x-1 sm:space-x-1.5 bg-rose-950/50 hover:bg-rose-900/80 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
