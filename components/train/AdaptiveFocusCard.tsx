"use client";

import { FocusRecommendation } from "@/lib/training/adaptive-types";
import { ChevronRight } from "lucide-react";

export default function AdaptiveFocusCard({
  item,
  onPractice,
}: {
  item: FocusRecommendation;
  onPractice: (item: FocusRecommendation) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPractice(item)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-td-border/60 bg-td-surface2/50 px-4 py-3 text-left transition hover:border-td-gold/35"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">
          {item.areaLabel}
        </p>
        <p className="truncate text-[14px] font-semibold text-td-cream">{item.topicLabel}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[13px] font-bold text-td-goldsoft">
          {item.accuracy}%
        </span>
        <span className="flex items-center gap-0.5 text-[12px] font-semibold text-td-gold">
          Practice
          <ChevronRight size={14} strokeWidth={2.5} />
        </span>
      </div>
    </button>
  );
}
