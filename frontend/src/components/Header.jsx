"use client";

import Link from "next/link";
import { Activity, ShieldCheck, FileSpreadsheet } from "lucide-react";

export default function Header() {
  return (
    <header className="navy-banner text-white border-b border-blue-900/50 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600/30 p-2 rounded-xl border border-blue-400/30">
          <FileSpreadsheet className="w-6 h-6 text-blue-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            CCRS CRM
            <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/20 font-medium">
              Auto Report System
            </span>
          </h1>
          <p className="text-xs text-blue-200/80">Command & Control Room System • Zero Math Mismatch Engine</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-200">Validation Engine Active</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
          <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-slate-200">FastAPI & Mongo Backend</span>
        </div>
      </div>
    </header>
  );
}
