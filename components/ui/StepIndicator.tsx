"use client";

export function StepIndicator({
  current,
  total,
  labels,
}: {
  current: number;
  total: number;
  labels?: string[];
}) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={`h-1 w-full rounded-full transition-colors ${
              i <= current ? "bg-td-gold" : "bg-td-border/60"
            }`}
            aria-hidden
          />
          {labels?.[i] && (
            <span
              className={`text-[9px] font-semibold uppercase tracking-wide ${
                i === current ? "text-td-goldsoft" : "text-td-muted"
              }`}
            >
              {labels[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
