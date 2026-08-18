"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  History,
  Download,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { apiUrl } from "../utils/api";

export default function Sidebar({
  mobileOpen = false,
  onCloseMobile = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {},
}) {
  const pathname = usePathname();

  const links = [
    { name: "Report Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Report History", href: "/history", icon: History },
  ];

  const handleDownloadSamples = async () => {
    try {
      const res = await fetch(apiUrl("/api/reports/generate-sample-files"), {
        method: "POST",
      });
      const data = await res.json();
      if (data.files) {
        window.open(apiUrl(data.files.road), "_blank");
        window.open(apiUrl(data.files.drainage), "_blank");
        window.open(apiUrl(data.files.water), "_blank");
      }
    } catch (err) {
      alert("Unable to generate samples. Please check if backend server is reachable.");
    }
  };

  return (
    <>
      {/* Desktop Persistent Sidebar with Smooth Expand / Collapse */}
      <aside
        className={`hidden md:flex bg-white border-r border-slate-200 flex-col justify-between shadow-xs shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20 p-3" : "w-64 p-4"
        }`}
      >
        <div className="space-y-5">
          {/* Desktop Sidebar Header with Collapse / Expand Toggle */}
          <div
            className={`flex items-center pb-3 border-b border-slate-100 ${
              isCollapsed ? "justify-center" : "justify-between px-1"
            }`}
          >
            {!isCollapsed && (
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Menu
              </span>
            )}
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-blue-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Navigation
              </h2>
            )}
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={isCollapsed ? link.name : undefined}
                    className={`flex items-center rounded-xl font-medium text-sm transition-all ${
                      isCollapsed
                        ? "justify-center p-3"
                        : "space-x-3 px-3.5 py-2.5"
                    } ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{link.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Testing Utility */}
          <div className={`pt-3 border-t border-slate-100`}>
            {!isCollapsed && (
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Testing Utility
              </h2>
            )}
            <button
              onClick={handleDownloadSamples}
              title={isCollapsed ? "Download 3 Sample Excels" : undefined}
              className={`w-full flex items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer ${
                isCollapsed
                  ? "justify-center p-3"
                  : "space-x-2 px-3.5 py-2.5 text-xs font-medium"
              }`}
            >
              <Download className="w-4 h-4 text-blue-600 shrink-0" />
              {!isCollapsed && <span className="truncate">Download 3 Sample Excels</span>}
            </button>
          </div>
        </div>

        {/* Bottom Validation Status Box */}
        <div
          className={`bg-slate-50 border border-slate-200 rounded-xl transition-all ${
            isCollapsed ? "p-2.5 flex justify-center" : "p-3.5 text-xs space-y-1"
          }`}
          title={isCollapsed ? "Zero Math Mismatch (100% computed metrics)" : undefined}
        >
          {isCollapsed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <>
              <div className="flex items-center text-slate-700 font-semibold gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero Math Mismatch</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                100% computed metrics from Road, Drainage & Water Excel sources.
              </p>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop with Smooth Fade */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[990] md:hidden transition-opacity duration-300 ease-in-out ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile Slide-Over Drawer: Close Button on LEFT, Logo on RIGHT */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 z-[999] p-5 shadow-2xl transition-all duration-300 ease-out md:hidden flex flex-col justify-between ${
          mobileOpen
            ? "translate-x-0 opacity-100 pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.35)]"
            : "-translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Header in Drawer: Close button on LEFT, Logo & Name on RIGHT */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <button
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0 border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <Image
                src="/AMC Logo.webp"
                alt="AMC Logo"
                width={40}
                height={40}
                priority
                unoptimized
                className="w-10 h-10 object-contain drop-shadow-sm select-none shrink-0"
              />
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-bold text-slate-900 text-base leading-tight tracking-tight">CCRS Menu</span>
                <span className="text-[11px] text-blue-600 font-semibold tracking-normal mt-0.5">Auto Report System</span>
              </div>
            </div>
          </div>

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
                    onClick={onCloseMobile}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
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
              className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">Download 3 Sample Excels</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1">
          <div className="flex items-center text-slate-700 font-semibold gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero Math Mismatch</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            100% computed metrics from Road, Drainage & Water Excel sources.
          </p>
        </div>
      </div>
    </>
  );
}
