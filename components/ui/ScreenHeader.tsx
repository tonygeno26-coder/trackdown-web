"use client";

import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  action,
  compact,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`${compact ? "pt-4 pb-3" : "pt-6 pb-4"}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex min-h-[44px] items-center gap-2 text-[13px] font-semibold text-td-muted transition-colors hover:text-td-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60"
        >
          <ArrowLeft size={16} aria-hidden /> Back
        </button>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-extrabold uppercase tracking-[3px] text-td-cream">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[14px] leading-relaxed text-td-muted">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
