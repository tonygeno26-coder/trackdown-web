"use client";

import { AlertCircle, WifiOff } from "lucide-react";
import { PrimaryButton } from "./Buttons";

export function ErrorState({
  message,
  onRetry,
  offline,
  diagnosticCode,
}: {
  message: string;
  onRetry?: () => void;
  offline?: boolean;
  diagnosticCode?: string | null;
}) {
  const Icon = offline ? WifiOff : AlertCircle;
  const showDiagnostic =
    diagnosticCode &&
    (process.env.NODE_ENV !== "production" || diagnosticCode.startsWith("AUTH_"));

  return (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-6 py-10 text-center"
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-td-red/40 bg-td-red/10">
        <Icon size={24} className="text-red-300" aria-hidden />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold uppercase tracking-[1px] text-td-cream">
          {offline ? "You're offline" : "Something went wrong"}
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-td-muted">{message}</p>
        {showDiagnostic && (
          <p className="mt-3 font-mono text-[11px] tracking-wide text-td-muted/80">
            {diagnosticCode}
          </p>
        )}
      </div>
      {onRetry && (
        <div className="w-full max-w-[280px] space-y-2">
          <PrimaryButton onClick={onRetry}>Try Again</PrimaryButton>
        </div>
      )}
    </div>
  );
}
