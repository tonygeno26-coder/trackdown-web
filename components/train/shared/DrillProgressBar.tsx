"use client";

import { ProgressBar } from "@/components/ui";

export function DrillProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return <ProgressBar value={pct} label={`${value} of ${max}`} />;
}
