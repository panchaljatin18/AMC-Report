"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList } from "recharts";
import StatCard from "../components/StatCard";
import { AlertCircle, CheckCircle, Flame } from "lucide-react";

const COLORS = ["#2563EB", "#EF4444", "#F59E0B", "#10B981"];

export default function RoadSection({ stats, dateRange }) {
  if (!stats || !stats.zones) return null;

  // Prepare chart data: { zone: "NORTH WEST", "Road-Repair Require": 35, "Road-Bhuva On Road": 12, ... }
  const chartData = stats.zones.map((z) => {
    const item = { zone: z.zone };
    stats.categories.forEach((cat) => {
      item[cat] = z.categories[cat] ? z.categories[cat].open : 0;
    });
    return item;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="navy-banner rounded-2xl p-6 text-white shadow-md">
        <h2 className="text-2xl font-bold tracking-tight">Zone wise Road CCRS Complaints Report</h2>
        <p className="text-xs text-blue-200 mt-1">
          Open Complaints Breakdown • {dateRange || "Current Reporting Period"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="TOTAL ROAD COMPLAINTS"
          value={stats.grand_total}
          badgeText={`${stats.pct_open}% Open`}
          badgeColor="red"
          icon={AlertCircle}
        />
        <StatCard
          title="CLOSED COMPLAINTS"
          value={stats.total_closed}
          badgeText={`${stats.resolution_rate}% Resolution`}
          badgeColor="green"
          icon={CheckCircle}
        />
        <StatCard
          title="OPEN COMPLAINTS"
          value={stats.total_open}
          badgeText="Pending Action"
          badgeColor="orange"
          icon={Flame}
        />
      </div>

      {/* Recharts Grouped Bar Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4">
          Open Complaints Breakdown by Problem Category across Zones
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="zone" tick={{ fontSize: 12, fontWeight: 600, fill: "#334155" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
              {stats.categories.map((cat, idx) => (
                <Bar key={cat} dataKey={cat} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey={cat} position="top" style={{ fontSize: 11, fontWeight: "bold", fill: "#1E293B" }} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grouped Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-900 text-white font-bold text-sm">
          Zone & Category Detailed Data Table
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-white uppercase font-semibold">
              <tr>
                <th className="p-3">Zone</th>
                <th className="p-3">Problem Category</th>
                <th className="p-3 text-center">Closed</th>
                <th className="p-3 text-center">Open</th>
                <th className="p-3 text-center">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.zones.map((zData, zIdx) => (
                <>
                  {Object.entries(zData.categories).map(([catName, catVals], cIdx) => (
                    <tr key={`${zIdx}-${cIdx}`} className="hover:bg-slate-50/80">
                      <td className="p-3 font-semibold text-slate-800">{cIdx === 0 ? zData.zone : ""}</td>
                      <td className="p-3 text-slate-700">{catName}</td>
                      <td className="p-3 text-center text-slate-600 font-medium">{catVals.closed}</td>
                      <td className="p-3 text-center text-rose-600 font-bold">{catVals.open}</td>
                      <td className="p-3 text-center text-slate-800 font-semibold">{catVals.grand_total}</td>
                    </tr>
                  ))}
                  {/* Subtotal row */}
                  <tr className="bg-slate-100/90 font-bold border-t border-b border-slate-200">
                    <td className="p-3 text-slate-900" colSpan={2}>
                      {zData.zone} Total Subtotal
                    </td>
                    <td className="p-3 text-center text-slate-800">{zData.subtotal_closed}</td>
                    <td className="p-3 text-center text-rose-600 font-extrabold">{zData.subtotal_open}</td>
                    <td className="p-3 text-center text-slate-900">{zData.subtotal_grand_total}</td>
                  </tr>
                </>
              ))}

              {/* Grand Total row */}
              <tr className="bg-slate-900 text-white font-extrabold">
                <td className="p-3" colSpan={2}>
                  GRAND TOTAL
                </td>
                <td className="p-3 text-center">{stats.total_closed}</td>
                <td className="p-3 text-center text-rose-400 font-black">{stats.total_open}</td>
                <td className="p-3 text-center">{stats.grand_total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
