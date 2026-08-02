"use client";

import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "text-td-cream",
  sublabel,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  accent?: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-td border border-td-border/80 bg-td-surface/90 px-4 py-4 shadow-td-card">
      <div className="mb-2 flex items-center gap-2 text-td-muted">
        {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden />}
        <span className="text-[10px] font-semibold uppercase tracking-[1px]">{label}</span>
      </div>
      <p className={`font-mono text-[17px] font-semibold leading-tight ${accent}`}>{value}</p>
      {sublabel && <p className="mt-1 text-[11px] text-td-muted">{sublabel}</p>}
    </div>
  );
}
