"use client";

import { ReactNode } from "react";
import { SurfaceCard } from "@/components/ui";

export function ExplanationPanel({
  explanation,
  gto,
  exploit,
  children,
}: {
  explanation: string;
  gto?: string;
  exploit?: string;
  children?: ReactNode;
}) {
  return (
    <SurfaceCard className="space-y-3 p-4">
      <p className="text-[13px] leading-relaxed text-td-cream">{explanation}</p>
      {gto && exploit && (
        <div className="space-y-1 border-t border-td-border/60 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">GTO vs Exploit</p>
          <p className="text-[12px] text-td-cream">
            <span className="text-td-goldsoft">GTO:</span> {gto}
          </p>
          <p className="text-[12px] text-td-cream">
            <span className="text-td-goldsoft">Exploit:</span> {exploit}
          </p>
        </div>
      )}
      {children}
    </SurfaceCard>
  );
}
