"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { PlayingCard, PrimaryPlayingButton, SecondaryPlayingButton } from "@/components/playing/PlayingUi";

export function TrainHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <div className="pt-6 pb-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-td-muted hover:text-td-cream"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}
      <h1 className="font-display text-[26px] font-extrabold uppercase tracking-[3px] text-td-cream">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-td-muted">{subtitle}</p>}
    </div>
  );
}

export function TrainCard({
  title,
  description,
  icon,
  onClick,
  disabled,
  badge,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  const Tag = disabled ? "div" : "button";
  return (
    <Tag
      type={disabled ? undefined : "button"}
      onClick={disabled ? undefined : onClick}
      className={`w-full rounded-td-lg border border-td-border/80 bg-td-surface/90 p-5 text-left shadow-td-card transition-colors ${
        disabled
          ? "cursor-default opacity-55"
          : "hover:border-td-gold/40 active:scale-[0.99]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-td-surface2 text-td-gold">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="block text-[16px] font-bold text-td-cream">{title}</span>
            {badge && (
              <span className="rounded-full border border-td-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-td-muted">
                {badge}
              </span>
            )}
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-td-muted">{description}</span>
        </span>
      </div>
    </Tag>
  );
}

export function TrainModuleGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3">{children}</div>;
}

export function TrainQuestionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <PlayingCard className={`space-y-4 p-5 ${className}`}>{children}</PlayingCard>
  );
}

export function TrainFeedback({
  correct,
  title,
  children,
}: {
  correct: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        correct
          ? "border-td-goldsoft/40 bg-td-goldsoft/10"
          : "border-td-red/40 bg-td-red/10"
      }`}
    >
      <p
        className={`font-display text-[14px] font-bold uppercase tracking-[1px] ${
          correct ? "text-td-goldsoft" : "text-red-300"
        }`}
      >
        {title}
      </p>
      <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-td-cream">{children}</div>
    </div>
  );
}

export function TrainNumericInput({
  value,
  onChange,
  label,
  prefix = "$",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  prefix?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[12px] font-semibold uppercase tracking-[0.8px] text-td-muted">{label}</span>
      <div className="flex items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
        {prefix && <span className="font-mono text-td-muted">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border-none bg-transparent py-3.5 pl-1 font-mono text-[18px] font-semibold text-td-cream focus:outline-none"
          placeholder="0"
        />
      </div>
    </label>
  );
}

export function DifficultyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const levels = [
    { key: "beginner", label: "Beginner" },
    { key: "intermediate", label: "Intermediate" },
    { key: "advanced", label: "Advanced" },
  ];
  return (
    <div className="flex gap-2">
      {levels.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex-1 rounded-xl border py-2.5 text-[11px] font-semibold uppercase tracking-wide ${
            value === key
              ? "border-td-gold bg-td-gold/10 text-td-goldsoft"
              : "border-td-border bg-td-surface2 text-td-muted"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function TrainStickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 mt-6 space-y-2 pb-2">
      {children}
    </div>
  );
}

export { PrimaryPlayingButton, SecondaryPlayingButton };

export function TrainStatsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-[13px]">
      <span className="text-td-muted">{label}</span>
      <span className="font-mono font-semibold text-td-cream">{value}</span>
    </div>
  );
}
