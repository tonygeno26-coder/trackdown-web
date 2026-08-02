"use client";

import { ReactNode } from "react";
import { SurfaceCard } from "@/components/ui";
import { FormField as UiFormField } from "@/components/ui";

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
      <SurfaceCard className="space-y-4 p-4">{children}</SurfaceCard>
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
    <UiFormField label={label} hint={hint}>
      {children}
    </UiFormField>
  );
}

export const settingsInputClass =
  "w-full rounded-xl border border-td-border bg-td-bg/80 px-3.5 py-3 text-[15px] text-td-cream focus:outline focus:outline-2 focus:outline-td-gold/60";
