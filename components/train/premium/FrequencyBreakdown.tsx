"use client";

import { RangeBreakdown } from "@/lib/solver/types";
import { SurfaceCard } from "@/components/ui";

export function FrequencyBreakdown({ entries }: { entries: RangeBreakdown[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">Range Breakdown</p>
      {entries.map((r) => (
        <SurfaceCard key={r.label} className="space-y-1 bg-td-surface2/50 p-3">
          <div className="flex justify-between text-[13px]">
            <span className="font-semibold text-td-cream">{r.label}</span>
            <span className="font-mono text-td-muted">{r.percentage}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-td-border/60">
            <div
              className="h-full rounded-full bg-td-gold/70"
              style={{ width: `${Math.min(100, r.percentage)}%` }}
            />
          </div>
          <p className="text-[11px] text-td-muted">{r.examples.join(", ")}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}
