"use client";

import { ReactNode } from "react";

export function SurfaceCard({
  children,
  className = "",
  feature = false,
}: {
  children: ReactNode;
  className?: string;
  feature?: boolean;
}) {
  return (
    <div
      className={`border border-td-border/80 bg-td-surface/90 shadow-td-card backdrop-blur-sm ${
        feature ? "rounded-td-lg" : "rounded-td"
      } ${className}`}
    >
      {children}
    </div>
  );
}
