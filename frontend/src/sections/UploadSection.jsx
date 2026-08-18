"use client";

import { useState } from "react";
import DragDropUpload from "../components/DragDropUpload";
import ValidationAlert from "../components/ValidationAlert";
import { Play, Download, Sparkles, Calendar, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { apiUrl } from "../utils/api";

export default function UploadSection({ onReportGenerated, isProcessing, setIsProcessing }) {
  const [files, setFiles] = useState({ road: null, drainage: null, water: null });
  const [dateRange, setDateRange] = useState("Reporting Period: August 2026");
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  const handleLoadSampleFiles = async () => {
    setLoadingSamples(true);
    setErrorMsg(null);
    try {
      const res = await fetch(apiUrl("/api/reports/generate-sample-files"), {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to generate sample files on backend");
      }
      const data = await res.json();
      
      // Fetch each sample file and convert to File object
      const roadBlob = await fetch(apiUrl(data.files.road)).then((r) => r.blob());
      const drainageBlob = await fetch(apiUrl(data.files.drainage)).then((r) => r.blob());
      const waterBlob = await fetch(apiUrl(data.files.water)).then((r) => r.blob());

      const roadFile = new File([roadBlob], "Road_Complaints_Sample.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const drainageFile = new File([drainageBlob], "Drainage_Complaints_Sample.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const waterFile = new File([waterBlob], "Water_Complaints_Sample.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      setFiles({
        road: roadFile,
        drainage: drainageFile,
        water: waterFile,
      });
    } catch (err) {
      setErrorMsg("Backend server is not reachable on port 8000. Please ensure the Python FastAPI backend is running.");
    } finally {
      setLoadingSamples(false);
    }
  };

  const handleGenerate = async () => {
    if (!files.road || !files.drainage || !files.water) {
      setErrorMsg("Please upload all 3 Excel files (Road, Drainage, Water) before generating.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setCurrentStep("Uploading datasets & parsing Excel sheets...");

    try {
      const formData = new FormData();
      formData.append("road_file", files.road);
      formData.append("drainage_file", files.drainage);
      formData.append("water_file", files.water);
      formData.append("date_range", dateRange);

      const stepTimer1 = setTimeout(() => {
        setCurrentStep("Validating formulas & calculating statistics...");
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setCurrentStep("Generating high-res charts & building PowerPoint...");
      }, 2500);

      const res = await fetch(apiUrl("/api/reports/generate"), {
        method: "POST",
        body: formData,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        let errorText = "Failed to generate report";
        try {
          const errData = await res.json();
          errorText = errData.detail || errorText;
        } catch {
          errorText = `Server error (${res.status}): ${res.statusText}`;
        }
        throw new Error(errorText);
      }

      const data = await res.json();
      setCurrentStep("Report & PowerPoint ready!");
      onReportGenerated(data);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("failed to fetch")) {
        setErrorMsg("Cannot connect to backend server. Please make sure the FastAPI server is running on port 8000 (uvicorn backend.main:app --port 8000).");
      } else {
        setErrorMsg(err.message || "An unexpected error occurred connecting to the backend server.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
              <span>Upload Source Complaint Datasets</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload Road, Drainage & Water Excel files to compute stats & build the 6-slide PowerPoint presentation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadSampleFiles}
              disabled={loadingSamples || isProcessing}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Auto-fill with official AMC sample template datasets"
            >
              {loadingSamples ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>{loadingSamples ? "Loading Samples..." : "Auto-Fill Sample Excels"}</span>
            </button>

            <div className="flex items-center space-x-2 bg-slate-100 p-2 sm:p-2.5 rounded-xl border border-slate-200 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-full sm:w-48"
                placeholder="e.g. Aug 1 - Aug 15, 2026"
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold leading-relaxed flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        <DragDropUpload files={files} setFiles={setFiles} />

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isProcessing ? (
            <div className="flex items-center space-x-3 text-xs text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200 animate-pulse w-full sm:w-auto">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span className="font-semibold">{currentStep || "Processing..."}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              {files.road && files.drainage && files.water
                ? "✓ All 3 datasets loaded. Ready to build report & PPT."
                : "Select or drag & drop Road, Drainage, and Water Excel files."}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${
              isProcessing
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-blue-500/25 cursor-pointer"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing & Building PPT...</span>
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
