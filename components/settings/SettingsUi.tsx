"use client";

import { ReactNode } from "react";
import { PlayingCard } from "@/components/playing/PlayingUi";

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-[13px] font-bold uppercase tracking-[1.5px] text-td-cream">
          {title}
        </h2>
        {description && <p className="mt-1 text-[12px] leading-relaxed text-td-muted">{description}</p>}
      </div>
      <PlayingCard className="space-y-4 p-4">{children}</PlayingCard>
    </section>
  );
}

export function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[12px] font-semibold uppercase tracking-[0.8px] text-td-muted">{label}</span>
      {children}
      {hint && <span className="block text-[11px] leading-relaxed text-td-muted/90">{hint}</span>}
    </label>
  );
}

export const settingsInputClass =
  "w-full rounded-xl border border-td-border bg-td-bg/80 px-3.5 py-3 text-[15px] text-td-cream focus:outline focus:outline-2 focus:outline-td-gold/60";
