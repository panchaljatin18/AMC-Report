"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Download, Calendar, FileText, AlertTriangle, Eye, RefreshCw } from "lucide-react";
import { apiUrl } from "../../utils/api";

export default function HistoryPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/reports"));
      if (!res.ok) throw new Error("Failed to fetch reports history");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError("Unable to connect to backend server. Please verify the backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch(apiUrl("/api/reports"));
        if (!res.ok) throw new Error("Failed to fetch reports history");
        const data = await res.json();
        if (isMounted) setReports(data);
      } catch (err) {
        if (isMounted) setError("Unable to connect to backend server. Please verify the backend service is running.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 scaler-container">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Report History & Version Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            List of all past generated CCRS CRM complaint reports saved in MongoDB.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-200">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-500">Loading saved reports from database...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center">
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No past reports found. Upload files on the Dashboard to generate your first report!
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white uppercase font-semibold">
                <tr>
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Generated At</th>
                  <th className="p-4">Period</th>
                  <th className="p-4 text-center">Road Total</th>
                  <th className="p-4 text-center">Drainage Total</th>
                  <th className="p-4 text-center">Water Open</th>
                  <th className="p-4 text-center">Warnings</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-blue-700">{r.id.substring(0, 8)}...</td>
                    <td className="p-4 text-slate-600 font-medium">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{r.date_range}</td>
                    <td className="p-4 text-center font-bold text-slate-800">{r.road_grand_total}</td>
                    <td className="p-4 text-center font-bold text-slate-800">{r.drainage_grand_total}</td>
                    <td className="p-4 text-center font-bold text-rose-600">{r.water_total_open}</td>
                    <td className="p-4 text-center">
                      {r.warnings_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          {r.warnings_count}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Clean</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/reports/${r.id}`}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View</span>
                        </Link>
                        <a
                          href={apiUrl(r.ppt_download_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PPT</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
