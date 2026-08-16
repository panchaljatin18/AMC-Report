"use client";

export default function StatCard({ title, value, badgeText, badgeColor = "blue", subtext, icon: Icon }) {
  const colorMap = {
    blue: "border-blue-600 bg-blue-50/50 text-blue-700",
    green: "border-emerald-600 bg-emerald-50/50 text-emerald-700",
    red: "border-rose-600 bg-rose-50/50 text-rose-700",
    orange: "border-amber-600 bg-amber-50/50 text-amber-700",
  };

  const accentMap = {
    blue: "bg-blue-600",
    green: "bg-emerald-600",
    red: "bg-rose-600",
    orange: "bg-amber-600",
  };

  return (
    <div className="relative glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${accentMap[badgeColor] || "bg-blue-600"}`} />
      
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 truncate">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${colorMap[badgeColor]}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {(badgeText || subtext) && (
        <div className="mt-3 flex items-center gap-2">
          {badgeText && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${colorMap[badgeColor]}`}>
              {badgeText}
            </span>
          )}
          {subtext && <span className="text-xs text-slate-500 font-medium">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
