"use client";

import { Spade } from "lucide-react";

export default function TrackdownHeader({
  showToday = false,
  compact = false,
}: {
  showToday?: boolean;
  compact?: boolean;
}) {
  return (
    <header className={`text-center ${compact ? "pt-5 pb-1" : "pt-7 pb-2"}`}>
      <div className="flex items-center justify-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-td-gold shadow-td-glow-sm">
          <Spade size={15} className="text-td-cream" strokeWidth={2} aria-hidden />
        </span>
        <h1 className="font-display text-[21px] font-extrabold uppercase tracking-[3px] bg-gradient-to-b from-td-cream to-td-muted bg-clip-text text-transparent">
          Trackdown
        </h1>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-[1.8px] text-td-muted/90">
        Track every down. Own the night.
      </p>
      {showToday && (
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[2px] text-td-gold">Today</p>
      )}
    </header>
  );
}
