"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

export default function ValidationAlert({ warnings = [], onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !warnings || warnings.length === 0) return null;

  return (
    <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm relative animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-700 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              Row Math Validation Warnings ({warnings.length})
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              The engine detected row mathematical mismatches or duplicate entries. Merges & corrections applied automatically without data loss.
            </p>
            
            <ul className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-2">
              {warnings.map((w, idx) => (
                <li key={idx} className="text-xs text-amber-900 bg-amber-100/60 px-3 py-1.5 rounded-lg border border-amber-200/80 font-mono">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            setDismissed(true);
            if (onDismiss) onDismiss();
          }}
          className="text-amber-600 hover:text-amber-900 p-1 rounded-lg hover:bg-amber-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
