"use client";

import { useState } from "react";
import UploadSection from "../sections/UploadSection";
import RoadSection from "../sections/RoadSection";
import DrainageSection from "../sections/DrainageSection";
import WaterSection from "../sections/WaterSection";
import ValidationAlert from "../components/ValidationAlert";
import { Download, FileText, CheckCircle2, Layers } from "lucide-react";

export default function Home() {
  const [reportData, setReportData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("road");

  const handleReportGenerated = (data) => {
    setReportData(data);
    setActiveTab("road");
  };

  const handleDownloadPPT = () => {
    if (reportData && reportData.ppt_download_url) {
      window.open("http://localhost:8000" + reportData.ppt_download_url, "_blank");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            CCRS Complaints Auto Report Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload source Excels → Compute zero-mismatch statistics → Preview live interactive reports → Download 6-slide PowerPoint.
          </p>
        </div>

        {reportData && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPPT}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
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
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">Generated Report Sections</h2>
            </div>

            {/* Tab Buttons */}
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
