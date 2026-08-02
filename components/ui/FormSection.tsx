"use client";

import { ReactNode } from "react";

export function FormSection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      {(title || description) && (
        <div>
          {title && (
            <h3 className="font-display text-[12px] font-bold uppercase tracking-[1px] text-td-cream">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-[12px] leading-relaxed text-td-muted">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
