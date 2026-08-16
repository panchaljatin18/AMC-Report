"use client";

import { useState } from "react";
import DragDropUpload from "../components/DragDropUpload";
import ValidationAlert from "../components/ValidationAlert";
import { Play, Download, Sparkles, Calendar } from "lucide-react";

export default function UploadSection({ onReportGenerated, isProcessing, setIsProcessing }) {
  const [files, setFiles] = useState({ road: null, drainage: null, water: null });
  const [dateRange, setDateRange] = useState("Reporting Period: August 2026");
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGenerate = async () => {
    if (!files.road || !files.drainage || !files.water) {
      setErrorMsg("Please upload all 3 Excel files (Road, Drainage, Water) before generating.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("road_file", files.road);
      formData.append("drainage_file", files.drainage);
      formData.append("water_file", files.water);
      formData.append("date_range", dateRange);

      const res = await fetch("http://localhost:8000/api/reports/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to generate report");
      }

      const data = await res.json();
      onReportGenerated(data);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred connecting to the backend server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Upload Source Complaint Datasets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload Road, Drainage & Water Excel files to compute stats & build the 6-slide PowerPoint presentation.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-48"
              placeholder="e.g. Aug 1 - Aug 15, 2026"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <DragDropUpload files={files} setFiles={setFiles} />

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${
              isProcessing
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-blue-500/25"
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Excels & Building PPT...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Generate Reports & Download PPT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
