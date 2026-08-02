"use client";

import { ReactNode } from "react";

export const inputClass =
  "min-h-[48px] w-full rounded-xl border border-td-border bg-td-bg/80 px-3.5 py-3 text-[15px] text-td-cream focus:outline focus:outline-2 focus:outline-td-gold/60";

export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-[11.5px] font-medium uppercase tracking-[0.8px] text-td-muted">
      <span>{label}</span>
      {children}
      {hint && <span className="normal-case tracking-normal text-[12px] text-td-muted/80">{hint}</span>}
    </label>
  );
}
