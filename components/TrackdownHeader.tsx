"use client";

import TrackdownLogo from "@/components/TrackdownLogo";

export default function TrackdownHeader({
  showToday = false,
  compact = false,
}: {
  showToday?: boolean;
  compact?: boolean;
}) {
  return (
    <header className={`text-center ${compact ? "pt-5 pb-1" : "pt-7 pb-2"}`}>
      <div className="flex items-center justify-center">
        <TrackdownLogo variant="header" priority className={compact ? "h-[44px]" : undefined} />
      </div>
      {showToday && (
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[2px] text-td-gold">Today</p>
      )}
    </header>
  );
}
