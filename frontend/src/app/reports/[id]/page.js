"use client";

import { use, useEffect, useState } from "react";
import RoadSection from "../../../sections/RoadSection";
import DrainageSection from "../../../sections/DrainageSection";
import WaterSection from "../../../sections/WaterSection";
import ValidationAlert from "../../../components/ValidationAlert";
import { Download, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";

export default function ReportDetailPage({ params }) {
  const resolvedParams = use(params);
  const reportId = resolvedParams.id;

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("road");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) throw new Error("Report not found");
        const data = await res.json();
        setReportData(data);
      } catch (err) {
        setError(err.message || "Failed to load report detail.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [reportId]);

  if (loading) {
    return (
      <div className="text-center py-16 max-w-7xl mx-auto">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Fetching saved report details...</p>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold text-center space-y-3">
        <p>{error || "Report not found"}</p>
        <Link href="/history" className="inline-block text-blue-600 underline">
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 scaler-container">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <Link
            href="/history"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Report View: <span className="font-mono text-blue-700">{reportId.substring(0, 8)}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Period: {reportData.date_range} • Generated on {new Date(reportData.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <a
          href={reportData.ppt_download_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download PPT (.pptx)</span>
        </a>
      </div>

      {/* Validation Alert */}
      {reportData.warnings && reportData.warnings.length > 0 && (
        <ValidationAlert warnings={reportData.warnings} />
      )}

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Report Preview Sections</h2>
          </div>

          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 space-x-1">
            <button
              onClick={() => setActiveTab("road")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "road"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1-2. Road Report
            </button>
            <button
              onClick={() => setActiveTab("drainage")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "drainage"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3-4. Drainage Report
            </button>
            <button
              onClick={() => setActiveTab("water")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "water"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              5-6. Water Report
            </button>
          </div>
        </div>

        <div>
          {activeTab === "road" && (
            <RoadSection stats={reportData.road_stats} dateRange={reportData.date_range} />
          )}
          {activeTab === "drainage" && (
            <DrainageSection stats={reportData.drainage_stats} dateRange={reportData.date_range} />
          )}
          {activeTab === "water" && (
            <WaterSection stats={reportData.water_stats} dateRange={reportData.date_range} />
          )}
        </div>
      </div>
    </div>
  );
}
