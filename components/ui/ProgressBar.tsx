"use client";

export function ProgressBar({
  value,
  max = 1,
  className = "",
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={className}>
      {label && (
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">{label}</p>
      )}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-td-surface2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-td-gold to-td-goldsoft transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
