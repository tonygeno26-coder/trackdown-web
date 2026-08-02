"use client";

import { ReactNode } from "react";
import { SurfaceCard } from "@/components/ui";

export function DrillPromptCard({
  meta,
  context,
  prompt,
  hint,
  children,
}: {
  meta?: string;
  context?: string;
  prompt: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <SurfaceCard className="mt-4 space-y-4 p-5">
      {meta && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">{meta}</p>
      )}
      {context && <p className="text-[13px] text-td-muted">{context}</p>}
      <p className="text-[16px] font-semibold leading-snug text-td-cream">{prompt}</p>
      {hint && <p className="text-[11px] italic text-td-muted">{hint}</p>}
      {children}
    </SurfaceCard>
  );
}
