"use client";

import { AlertCircle, WifiOff } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./Buttons";

export function ErrorState({
  message,
  onRetry,
  offline,
}: {
  message: string;
  onRetry?: () => void;
  offline?: boolean;
}) {
  const Icon = offline ? WifiOff : AlertCircle;
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
      </div>
      {onRetry && (
        <div className="w-full max-w-[280px] space-y-2">
          <PrimaryButton onClick={onRetry}>Try Again</PrimaryButton>
        </div>
      )}
    </div>
  );
}
