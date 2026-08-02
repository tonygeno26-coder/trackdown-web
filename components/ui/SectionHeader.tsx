"use client";

import { ReactNode } from "react";

export function SectionHeader({
  title,
  action,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-td-muted">{title}</p>
      {action}
    </div>
  );
}
