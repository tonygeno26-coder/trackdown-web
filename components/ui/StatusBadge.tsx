"use client";

export type StatusBadgeVariant = "positive" | "negative" | "neutral" | "warning" | "gold";

const VARIANT_CLASS: Record<StatusBadgeVariant, string> = {
  positive: "border-td-goldsoft/40 bg-td-goldsoft/10 text-td-goldsoft",
  negative: "border-td-red/40 bg-td-red/10 text-red-300",
  neutral: "border-td-border bg-td-surface2/60 text-td-muted",
  warning: "border-td-gold/40 bg-td-gold/10 text-td-gold",
  gold: "border-td-gold/50 bg-td-gold/15 text-td-gold",
};

export function StatusBadge({
  children,
  variant = "neutral",
  icon,
}: {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${VARIANT_CLASS[variant]}`}
    >
      {icon}
      {children}
    </span>
  );
}
