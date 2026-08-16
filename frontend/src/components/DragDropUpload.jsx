"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, FileCheck } from "lucide-react";

export default function DragDropUpload({ files, setFiles }) {
  const [dragOverKey, setDragOverKey] = useState(null);

  const fileConfigs = [
    {
      key: "road",
      title: "Road Complaints Excel",
      sheetName: "Road",
      sheetBadgeColor: "bg-blue-100/90 text-blue-800 border-blue-300 font-bold",
      colsReq: "Zone | Problem | Closed | Open | Grand Total",
      accent: "border-blue-500 hover:border-blue-600 bg-blue-50/20",
    },
    {
      key: "drainage",
      title: "Drainage Complaints Excel",
      sheetName: "Drainage",
      sheetBadgeColor: "bg-teal-100/90 text-teal-800 border-teal-300 font-bold",
      colsReq: "Zone | Problem | Closed | Open | Grand Total",
      accent: "border-teal-500 hover:border-teal-600 bg-teal-50/20",
    },
    {
      key: "water",
      title: "Water Complaints Excel",
      sheetName: "Water",
      sheetBadgeColor: "bg-indigo-100/90 text-indigo-800 border-indigo-300 font-bold",
      colsReq: "Zone | No Supply | Leakage | Pollution | Low Pressure | Tanker | Other | Total Open",
      accent: "border-indigo-500 hover:border-indigo-600 bg-indigo-50/20",
    },
  ];

  const handleFileDrop = (e, key) => {
    e.preventDefault();
    setDragOverKey(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFiles((prev) => ({ ...prev, [key]: selected }));
    }
  };

  const handleFileChange = (e, key) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFiles((prev) => ({ ...prev, [key]: selected }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {fileConfigs.map((cfg) => {
        const selectedFile = files[cfg.key];
        const isDragging = dragOverKey === cfg.key;

        return (
          <div
            key={cfg.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverKey(cfg.key);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOverKey(null);
            }}
            onDrop={(e) => handleFileDrop(e, cfg.key)}
            className={`relative glass-panel rounded-2xl p-4 sm:p-5 border-2 border-dashed transition-all cursor-pointer flex flex-col justify-between ${
              selectedFile
                ? "border-emerald-500 bg-emerald-50/20"
                : isDragging
                ? "border-blue-600 bg-blue-100/40 scale-[1.01]"
                : cfg.accent
            }`}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              id={`file-input-${cfg.key}`}
              className="hidden"
              onChange={(e) => handleFileChange(e, cfg.key)}
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <FileSpreadsheet className={`w-5 h-5 shrink-0 ${selectedFile ? "text-emerald-600" : "text-blue-600"}`} />
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{cfg.title}</h3>
                </div>
                {selectedFile ? (
                  <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Ready
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">Required</span>
                )}
              </div>

              {selectedFile ? (
                <label
                  htmlFor={`file-input-${cfg.key}`}
                  className="block bg-white border border-emerald-200 rounded-xl p-3 shadow-xs cursor-pointer hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div className="overflow-hidden text-ellipsis min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
                      </p>
                    </div>
                  </div>
                </label>
              ) : (
                <label
                  htmlFor={`file-input-${cfg.key}`}
                  className="block text-center py-5 sm:py-6 border border-slate-200 bg-white/60 hover:bg-white rounded-xl cursor-pointer transition-all"
                >
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Drag & drop or click to upload</p>
                  <p className="text-[11px] text-slate-400 mt-1">Supports .xlsx files</p>
                </label>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-600 font-medium">Sheet:</span>
                <span className={`px-2 py-0.5 rounded-md text-xs border shadow-2xs ${cfg.sheetBadgeColor}`}>
                  {cfg.sheetName}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{cfg.colsReq}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
