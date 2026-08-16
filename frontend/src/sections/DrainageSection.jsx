"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList } from "recharts";
import StatCard from "../components/StatCard";
import { AlertCircle, CheckCircle, Flame, MapPin, Lightbulb } from "lucide-react";

const CAT_COLORS = ["#1E3A8A", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

export default function DrainageSection({ stats, dateRange }) {
  if (!stats || !stats.table_rows) return null;

  // Chart 1 data: Grouped bar by category
  const chart1Data = stats.table_rows.map((r) => {
    const item = { zone: r.zone };
    stats.categories.forEach((cat) => {
      item[cat] = r.cat_open[cat] || 0;
    });
    return item;
  });

  // Chart 2 data: Single bar total open volume
  const chart2Data = stats.table_rows.map((r) => ({
    zone: r.zone,
    total_open: r.total_open,
  }));

  const topZone = stats.highest_open_zone || { zone: "N/A", total_open: 0 };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="navy-banner rounded-2xl p-4 sm:p-6 text-white shadow-md">
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight">CCRS Drainage Complaints Summary Report</h2>
        <p className="text-xs text-blue-200 mt-1">
          Comprehensive Zone-Wise Analysis of Open & Pending Complaints | Period: {dateRange || "August 2026"}
        </p>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="TOTAL COMPLAINTS"
          value={stats.grand_total}
          badgeText="Citywide Total"
          badgeColor="blue"
          icon={AlertCircle}
        />
        <StatCard
          title="CLOSED COMPLAINTS"
          value={stats.total_closed}
          badgeText={`${stats.resolution_rate}% Res. Rate`}
          badgeColor="green"
          icon={CheckCircle}
        />
        <StatCard
          title="OPEN COMPLAINTS"
          value={stats.total_open}
          badgeText={`${stats.pct_open}% Pending`}
          badgeColor="red"
          icon={Flame}
        />
        <StatCard
          title="HIGHEST OPEN ZONE"
          value={topZone.zone}
          badgeText={`${topZone.total_open} Open`}
          badgeColor="orange"
          icon={MapPin}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart 1: Grouped Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Open Complaints Category Breakdown by Zone
          </h3>
          <div className="chart-scaler-box min-h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart1Data} margin={{ top: 20, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fontWeight: 600, fill: "#334155" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} />
                {stats.categories.map((cat, idx) => (
                  <Bar key={cat} dataKey={cat} fill={CAT_COLORS[idx % CAT_COLORS.length]} radius={[3, 3, 0, 0]}>
                    <LabelList dataKey={cat} position="top" style={{ fontSize: 9, fontWeight: "bold", fill: "#1E293B" }} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Single Bar Volume */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Total Open Complaints Volume by Zone
          </h3>
          <div className="chart-scaler-box min-h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart2Data} margin={{ top: 20, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fontWeight: 600, fill: "#334155" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total_open" fill="#1E3A8A" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total_open" position="top" style={{ fontSize: 10, fontWeight: "bold", fill: "#1E3A8A" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white font-bold text-xs sm:text-sm">
          Drainage Detailed Data Table (Sorted Descending by Total Open)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[600px]">
            <thead className="bg-slate-800 text-white uppercase font-semibold">
              <tr>
                <th className="p-3">Zone</th>
                {stats.categories.map((cat) => (
                  <th key={cat} className="p-3 text-center">
                    {cat}
                  </th>
                ))}
                <th className="p-3 text-center bg-rose-900/60">Total Open</th>
                <th className="p-3 text-center">Total Closed</th>
                <th className="p-3 text-center">Grand Total</th>
                <th className="p-3 text-center">% Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.table_rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{r.zone}</td>
                  {stats.categories.map((cat) => (
                    <td key={cat} className="p-3 text-center text-slate-700 font-medium">
                      {r.cat_open[cat] || 0}
                    </td>
                  ))}
                  <td className="p-3 text-center text-rose-600 font-extrabold bg-rose-50/50">{r.total_open}</td>
                  <td className="p-3 text-center text-emerald-700 font-medium">{r.total_closed}</td>
                  <td className="p-3 text-center text-slate-800 font-semibold">{r.grand_total}</td>
                  <td className="p-3 text-center font-bold text-amber-700">{r.pct_open}%</td>
                </tr>
              ))}

              {/* ALL ZONES COMBINED */}
              <tr className="bg-slate-900 text-white font-extrabold">
                <td className="p-3">ALL ZONES COMBINED</td>
                {stats.categories.map((cat) => (
                  <td key={cat} className="p-3 text-center">
                    {stats.cat_totals[cat] || 0}
                  </td>
                ))}
                <td className="p-3 text-center text-rose-400 font-black">{stats.total_open}</td>
                <td className="p-3 text-center">{stats.total_closed}</td>
                <td className="p-3 text-center">{stats.grand_total}</td>
                <td className="p-3 text-center text-amber-300">{stats.pct_open}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights & Executive Summary */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border-l-4 border-l-blue-600 border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm mb-3">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <h3>KEY INSIGHTS & EXECUTIVE SUMMARY</h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-700 font-medium leading-relaxed">
          {stats.insights && stats.insights.map((ins, i) => (
            <li key={i} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-blue-600 font-bold">•</span>
              <span>{ins}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
