"use client";

import { AlertTriangle } from "lucide-react";
import { useDeveloperPreview } from "@/components/dev/DeveloperPreviewProvider";

export default function DeveloperPreviewBanner() {
  const { isPreviewActive, clearPreview } = useDeveloperPreview();

  if (!isPreviewActive) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-td-gold/40 bg-td-gold/10 px-4 py-3">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-td-gold" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-td-cream">
          Developer Preview — no database records are being changed
        </p>
        <button
          type="button"
          onClick={clearPreview}
          className="mt-1 text-[12px] font-semibold text-td-gold hover:text-td-cream"
        >
          Clear Preview Override
        </button>
      </div>
    </div>
  );
}
