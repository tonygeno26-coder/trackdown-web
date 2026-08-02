"use client";

import { ReactNode } from "react";

export function AppScreen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative min-h-0 ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20px] -top-6 bottom-0 bg-playing-radial"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20px] -top-6 bottom-0 bg-playing-radial-bottom opacity-50"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
