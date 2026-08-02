"use client";

import { PokerAction } from "@/lib/training/types";

export function BetSizeComparison({
  entries,
}: {
  entries: { action: PokerAction; ev: number }[];
}) {
  const maxEv = Math.max(...entries.map((e) => e.ev));
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">EV Comparison</p>
      {entries.map(({ action, ev }) => (
        <div key={action} className="flex items-center gap-3">
          <span className="w-16 text-[12px] font-semibold uppercase text-td-cream">{action}</span>
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-td-border/60">
              <div
                className={`h-full rounded-full ${ev === maxEv ? "bg-td-gold" : "bg-td-surface2"}`}
                style={{ width: `${maxEv > 0 ? (ev / maxEv) * 100 : 0}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[13px] text-td-muted">{ev.toFixed(1)} bb</span>
        </div>
      ))}
    </div>
  );
}
