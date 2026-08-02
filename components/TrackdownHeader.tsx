"use client";

import { Spade } from "lucide-react";

export default function TrackdownHeader({ showToday = false }: { showToday?: boolean }) {
  return (
    <header className="pt-9 pb-2 text-center">
      <div className="flex items-center justify-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-td-gold shadow-td-glow-sm">
          <Spade size={16} className="text-td-cream" strokeWidth={2} />
        </span>
        <h1 className="font-display text-[22px] font-extrabold uppercase tracking-[3px] bg-gradient-to-b from-td-cream to-td-muted bg-clip-text text-transparent">
          Trackdown
        </h1>
      </div>
      <p className="mt-1.5 text-[10px] uppercase tracking-[1.8px] text-td-muted">
        Track every down. Own the night.
      </p>
      {showToday && (
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[2px] text-td-gold">Today</p>
      )}
    </header>
  );
}
