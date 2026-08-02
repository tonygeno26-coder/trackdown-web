"use client";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <div
      className="flex rounded-td-lg border border-td-border/80 bg-td-surface/80 p-1"
      role="tablist"
    >
      {options.map(({ key, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={`min-h-[44px] flex-1 rounded-[18px] py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.5px] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${
              active
                ? "bg-td-gold text-td-cream shadow-td-glow-sm"
                : "text-td-muted hover:text-td-cream"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
