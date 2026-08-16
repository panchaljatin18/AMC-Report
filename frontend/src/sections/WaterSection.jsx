"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList } from "recharts";
import StatCard from "../components/StatCard";
import { AlertCircle, Flame, MapPin, Target, Lightbulb } from "lucide-react";

const WATER_COLORS = ["#2563EB", "#06B6D4", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6"];

export default function WaterSection({ stats, dateRange }) {
  if (!stats || !stats.zone_rows) return null;

  // Chart data
  const chartData = stats.zone_rows.map((z) => {
    const item = { zone: z.zone };
    stats.categories.forEach((cat) => {
      item[cat] = z.categories[cat] || 0;
    });
    return item;
  });

  // Calculate peak value in each category column for pink highlight
  const colPeaks = {};
  stats.categories.forEach((cat) => {
    colPeaks[cat] = Math.max(...stats.zone_rows.map((z) => z.categories[cat] || 0));
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="navy-banner rounded-2xl p-4 sm:p-6 text-white shadow-md">
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight">CCRS Water Complaints: Zone & Category Open Summary</h2>
        <p className="text-xs text-blue-200 mt-1">
          Reporting Period: {dateRange || "August 2026"}
        </p>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="TOTAL OPEN COMPLAINTS"
          value={stats.total_open}
          badgeText="Citywide Water Backlog"
          badgeColor="red"
          icon={Flame}
        />
        <StatCard
          title="TOP OPEN ZONE"
          value={stats.top_zone?.zone || "N/A"}
          badgeText={`${stats.top_zone?.total_open || 0} Cases`}
          badgeColor="orange"
          icon={MapPin}
        />
        <StatCard
          title="TOP OPEN CATEGORY"
          value={stats.top_category?.name || "N/A"}
          badgeText={`${stats.top_category?.count || 0} (${stats.top_category?.pct || 0}%)`}
          badgeColor="blue"
          icon={Target}
        />
        <StatCard
          title="CATEGORIES TRACKED"
          value={stats.categories.length}
          badgeText="Active Issue Types"
          badgeColor="green"
          icon={AlertCircle}
        />
      </div>

      {/* Recharts Grouped Bar Chart */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Open Complaints Count by Zone & Category
        </h3>
        <div className="chart-scaler-box min-h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 15, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="zone" tick={{ fontSize: 10, fontWeight: 600, fill: "#334155" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} />
              {stats.categories.map((cat, idx) => (
                <Bar key={cat} dataKey={cat} fill={WATER_COLORS[idx % WATER_COLORS.length]} radius={[3, 3, 0, 0]}>
                  <LabelList dataKey={cat} position="top" style={{ fontSize: 9, fontWeight: "bold", fill: "#1E293B" }} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Matrix Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white font-bold text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Water Matrix Data Table (Peak values in light-pink)</span>
          <span className="text-[11px] text-rose-300 font-normal">* Peak open category per column</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[650px]">
            <thead className="bg-slate-800 text-white uppercase font-semibold">
              <tr>
                <th className="p-3">Zone Name</th>
                {stats.categories.map((cat) => (
                  <th key={cat} className="p-3 text-center">
                    {cat}
                  </th>
                ))}
                <th className="p-3 text-center bg-rose-900/60 font-bold">Total Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.zone_rows.map((zRow, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{zRow.zone}</td>
                  {stats.categories.map((cat) => {
                    const val = zRow.categories[cat] || 0;
                    const isPeak = val > 0 && val === colPeaks[cat];
                    return (
                      <td
                        key={cat}
                        className={`p-3 text-center font-medium ${
                          isPeak ? "bg-rose-100 text-rose-800 font-extrabold" : "text-slate-700"
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center text-rose-600 font-extrabold bg-rose-50/50">{zRow.total_open}</td>
                </tr>
              ))}

              {/* Total Open Row */}
              <tr className="bg-slate-900 text-white font-extrabold">
                <td className="p-3">Total Open</td>
                {stats.categories.map((cat) => (
                  <td key={cat} className="p-3 text-center">
                    {stats.col_totals[cat] || 0}
                  </td>
                ))}
                <td className="p-3 text-center text-rose-400 font-black">{stats.total_open}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights & Strategic Focus Areas */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border-l-4 border-l-indigo-600 border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm mb-3">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <h3>KEY INSIGHTS & STRATEGIC FOCUS AREAS</h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-700 font-medium leading-relaxed">
          {stats.insights && stats.insights.map((ins, i) => (
            <li key={i} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-indigo-600 font-bold">•</span>
              <span>{ins}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
