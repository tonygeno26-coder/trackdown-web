"use client";

import { ParsedCard, cardAccessibilityLabel, cardDisplayRank, isRedSuit, suitSymbol } from "@/lib/cards";

export type CardSize = "small" | "medium" | "large";

const SIZE_CLASS: Record<CardSize, string> = {
  small: "h-[3.25rem] w-[2.35rem] text-[11px]",
  medium: "h-[4.25rem] w-[3rem] text-[13px]",
  large: "h-[5.5rem] w-[3.85rem] text-[15px]",
};

const CENTER_SUIT: Record<CardSize, string> = {
  small: "text-[1.35rem]",
  medium: "text-[1.75rem]",
  large: "text-[2.25rem]",
};

export default function PlayingCardFace({
  card,
  size = "medium",
  faceDown = false,
  highlighted = false,
  dimmed = false,
}: {
  card?: ParsedCard | null;
  size?: CardSize;
  faceDown?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
}) {
  if (faceDown || !card) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-lg border border-td-border bg-gradient-to-br from-td-surface2 to-td-surface shadow-td-card ${SIZE_CLASS[size]} ${dimmed ? "opacity-40" : ""}`}
        aria-label="Face-down card"
      >
        <div className="absolute inset-[12%] rounded-md border border-td-border/50 bg-td-bg/90">
          <div className="absolute inset-0 rounded-md bg-gradient-to-br from-td-surface2/40 to-transparent" />
        </div>
      </div>
    );
  }

  const red = isRedSuit(card.suit);
  const suitClass = red ? "text-td-gold" : "text-td-surface";
  const label = cardAccessibilityLabel(card);

  return (
    <div
      className={`relative flex shrink-0 flex-col rounded-lg border bg-td-cream shadow-td-card ${SIZE_CLASS[size]} ${
        highlighted ? "border-td-gold ring-2 ring-td-gold/40" : "border-td-border/80"
      } ${dimmed ? "opacity-45" : ""}`}
      role="img"
      aria-label={label}
    >
      <div className={`px-1.5 pt-1 font-mono font-bold leading-none ${suitClass}`}>
        <span>{cardDisplayRank(card.rank)}</span>
        <span className="block text-[0.85em]">{suitSymbol(card.suit)}</span>
      </div>
      <div className={`flex flex-1 items-center justify-center ${suitClass} ${CENTER_SUIT[size]}`}>
        {suitSymbol(card.suit)}
      </div>
    </div>
  );
}
