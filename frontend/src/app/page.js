"use client";

import { useState } from "react";
import UploadSection from "../sections/UploadSection";
import RoadSection from "../sections/RoadSection";
import DrainageSection from "../sections/DrainageSection";
import WaterSection from "../sections/WaterSection";
import ValidationAlert from "../components/ValidationAlert";
import { Download, FileText, CheckCircle2, Layers } from "lucide-react";
import { apiUrl } from "../utils/api";

export default function Home() {
  const [reportData, setReportData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("road");

  const handleReportGenerated = (data) => {
    setReportData(data);
    setActiveTab("road");

    if (data && data.ppt_download_url) {
      try {
        const fullUrl = apiUrl(data.ppt_download_url);
        const link = document.createElement("a");
        link.href = fullUrl;
        link.download = `CCRS_Report_${data.report_id || "generated"}.pptx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error("Auto-download error:", e);
      }
    }
  };

  const handleDownloadPPT = () => {
    if (reportData && reportData.ppt_download_url) {
      window.open(apiUrl(reportData.ppt_download_url), "_blank");
    }
  };

  return (
    <div className="space-y-6 scaler-container">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            CCRS Complaints Auto Report Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload source Excels → Compute zero-mismatch statistics → Preview live interactive reports → Download 6-slide PowerPoint.
          </p>
        </div>

        {reportData && (
          <div className="flex items-center">
            <button
              onClick={handleDownloadPPT}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PowerPoint (.pptx)</span>
            </button>
          </div>
        )}
      </div>

      {/* Excel Upload Section */}
      <UploadSection
        onReportGenerated={handleReportGenerated}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      {/* Validation Alert */}
      {reportData && reportData.warnings && (
        <ValidationAlert warnings={reportData.warnings} />
      )}

      {/* Report Preview Tabs */}
      {reportData && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800">Generated Report Sections</h2>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto gap-1 max-w-full">
              <button
                onClick={() => setActiveTab("road")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "road"
                    ? "bg-white text-blue-700 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1-2. Road
              </button>
              <button
                onClick={() => setActiveTab("drainage")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "drainage"
                    ? "bg-white text-blue-700 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3-4. Drainage
              </button>
              <button
                onClick={() => setActiveTab("water")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "water"
                    ? "bg-white text-blue-700 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                5-6. Water
              </button>
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="pt-2">
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
      )}
    </div>
  );
}
