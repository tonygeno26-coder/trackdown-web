"use client";

import { CardSize, CARD_SIZE_CLASS } from "@/components/cards/types";

export default function CardBack({
  size = "medium",
  className = "",
}: {
  size?: CardSize;
  className?: string;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-lg border border-td-red/80 bg-td-gradient-red shadow-td-card ${CARD_SIZE_CLASS[size]} ${className}`}
      aria-label="Face-down card"
      role="img"
    >
      <div className="absolute inset-[10%] rounded-md border border-td-cream/15 bg-td-bg/40">
        <div className="absolute inset-0 rounded-md bg-gradient-to-br from-td-cream/5 to-transparent" />
        <div
          className="absolute inset-[20%] rounded-sm border border-td-cream/10"
          aria-hidden
        />
      </div>
      <span className="sr-only">Face-down card</span>
    </div>
  );
}
