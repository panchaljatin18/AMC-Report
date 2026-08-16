"use client";

import Link from "next/link";
import Image from "next/image";
import { Activity, ShieldCheck, Menu, X } from "lucide-react";

export default function Header({
  onToggleMobileMenu,
  mobileMenuOpen = false,
}) {
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
        {/* Validation Engine Badge */}
        <div className="hidden lg:flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-200">Validation Engine Active</span>
        </div>

        {/* Backend Status Indicator */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-zinc-900/90 border border-zinc-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs">
          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" />
          <span className="text-zinc-200 hidden sm:inline">FastAPI Backend Ready</span>
          <span className="text-zinc-200 sm:hidden">API Ready</span>
        </div>
      </div>
    </header>
  );
}
