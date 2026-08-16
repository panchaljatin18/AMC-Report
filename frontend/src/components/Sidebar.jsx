"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Download, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Report Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Report History", href: "/history", icon: History },
  ];

  const handleDownloadSamples = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/reports/generate-sample-files", {
        method: "POST",
      });
      const data = await res.json();
      if (data.files) {
        window.open("http://localhost:8000" + data.files.road, "_blank");
        window.open("http://localhost:8000" + data.files.drainage, "_blank");
        window.open("http://localhost:8000" + data.files.water, "_blank");
      }
    } catch (err) {
      alert("Please make sure the backend server (FastAPI port 8000) is running!");
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shadow-sm">
      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </h2>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Testing Utility
          </h2>
          <button
            onClick={handleDownloadSamples}
            className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-all"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download 3 Sample Excels</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <div className="flex items-center text-slate-700 font-semibold gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Zero Math Mismatch</span>
        </div>
        <p className="text-slate-500 leading-relaxed text-[11px]">
          100% computed metrics from Road, Drainage & Water Excel sources.
        </p>
      </div>
    </aside>
  );
}
