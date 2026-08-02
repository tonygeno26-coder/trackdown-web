"use client";

import { SurfaceCard } from "@/components/ui";

export function DrillStatsStrip({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <SurfaceCard className="mb-4 space-y-2 bg-td-surface2/40 p-4">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-3 py-1 text-[13px]">
          <span className="text-td-muted">{label}</span>
          <span className="font-mono font-semibold text-td-cream">{value}</span>
        </div>
      ))}
    </SurfaceCard>
  );
}
