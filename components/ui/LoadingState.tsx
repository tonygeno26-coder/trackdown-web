"use client";

import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-td-muted"
      role="status"
      aria-live="polite"
    >
      <Loader2 size={26} className="animate-spin text-td-gold" aria-hidden />
      <span className="text-[14px]">{message}</span>
    </div>
  );
}
