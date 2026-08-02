"use client";

import { CardSize, CARD_SIZE_CLASS } from "@/components/cards/types";

export default function CardPlaceholder({
  size = "medium",
  label = "Empty card slot",
  className = "",
}: {
  size?: CardSize;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-td-border/70 bg-td-surface/30 ${CARD_SIZE_CLASS[size]} ${className}`}
      role="img"
      aria-label={label}
    >
      <span className="text-[1.25em] text-td-muted/40" aria-hidden>
        +
      </span>
    </div>
  );
}
