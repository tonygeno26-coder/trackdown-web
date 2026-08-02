"use client";

import { ReactNode } from "react";

export function DrillNavigation({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 mt-6 space-y-2 pb-2">
      {children}
    </div>
  );
}
