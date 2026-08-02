"use client";

import { ReactNode } from "react";

export function DrillResultCard({
  correct,
  title,
  children,
}: {
  correct: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        correct
          ? "border-td-goldsoft/40 bg-td-goldsoft/10"
          : "border-td-red/40 bg-td-red/10"
      }`}
      role="status"
    >
      <p
        className={`font-display text-[14px] font-bold uppercase tracking-[1px] ${
          correct ? "text-td-goldsoft" : "text-red-300"
        }`}
      >
        {title}
      </p>
      <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-td-cream">{children}</div>
    </div>
  );
}
