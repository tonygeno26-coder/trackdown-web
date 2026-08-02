"use client";

import { ReactNode } from "react";
import { SurfaceCard } from "@/components/ui";

export function SolverSummaryCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SurfaceCard className="mb-4 space-y-3 p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg font-bold text-td-cream">{title}</h2>
        {badge}
      </div>
      {children}
    </SurfaceCard>
  );
}
