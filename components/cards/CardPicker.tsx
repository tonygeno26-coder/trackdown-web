"use client";

import { useMemo } from "react";
import PlayingCard from "@/components/cards/PlayingCard";
import CardPlaceholder from "@/components/cards/CardPlaceholder";
import { ParsedCard, Rank, Suit, parseCompactCard } from "@/lib/cards";

const RANKS: Rank[] = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const SUIT_LETTER: Record<Suit, string> = {
  spades: "s",
  hearts: "h",
  diamonds: "d",
  clubs: "c",
};

function buildDeck(): ParsedCard[] {
  const deck: ParsedCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const notation = `${rank === "10" ? "10" : rank}${SUIT_LETTER[suit]}`;
      const parsed = parseCompactCard(notation);
      if (parsed) deck.push(parsed);
    }
  }
  return deck;
}

function cardsToString(cards: ParsedCard[]): string {
  return cards.map((c) => c.notation).join(" ");
}

export default function CardPicker({
  value,
  onChange,
  maxCards = 2,
  label,
  selectedPreviewSize = "large",
}: {
  value: string;
  onChange: (notation: string) => void;
  maxCards?: number;
  label?: string;
  selectedPreviewSize?: "medium" | "large" | "hero";
}) {
  const deck = useMemo(() => buildDeck(), []);
  const selected = useMemo(() => {
    return value
      .split(/[\s,]+/)
      .map((p) => parseCompactCard(p))
      .filter((c): c is ParsedCard => c !== null);
  }, [value]);

  const selectedKeys = new Set(selected.map((c) => c.notation));

  const toggle = (card: ParsedCard) => {
    const idx = selected.findIndex((c) => c.notation === card.notation);
    if (idx >= 0) {
      const next = selected.filter((_, i) => i !== idx);
      onChange(cardsToString(next));
    } else if (selected.length < maxCards) {
      onChange(cardsToString([...selected, card]));
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">{label}</p>
      )}

      <div className="flex min-h-[5.5rem] items-center justify-center gap-1 rounded-xl border border-td-border/60 bg-td-surface2/40 px-3 py-3">
        {selected.length === 0 ? (
          Array.from({ length: maxCards }).map((_, i) => (
            <CardPlaceholder key={i} size={selectedPreviewSize === "hero" ? "large" : "medium"} />
          ))
        ) : (
          selected.map((card, i) => (
            <PlayingCard
              key={card.notation}
              card={card}
              size={selectedPreviewSize}
              selected
              onClick={() => toggle(card)}
              style={{ zIndex: i + 1, marginLeft: i > 0 ? "-12px" : undefined }}
            />
          ))
        )}
      </div>

      <div
        className="grid grid-cols-4 gap-1.5 sm:grid-cols-6"
        role="listbox"
        aria-label={label ?? "Card picker"}
        aria-multiselectable="true"
      >
        {deck.map((card) => {
          const isSelected = selectedKeys.has(card.notation);
          const isUsed = isSelected;
          const atMax = selected.length >= maxCards && !isSelected;
          return (
            <PlayingCard
              key={card.notation}
              card={card}
              variant="picker"
              selected={isSelected}
              state={atMax ? "disabled" : isUsed ? "selected" : "default"}
              onClick={() => !atMax && toggle(card)}
              aria-label={`${card.notation}${isSelected ? ", selected" : ""}`}
            />
          );
        })}
      </div>

      <p className="text-center font-mono text-[11px] text-td-muted">
        {value.trim() || "Tap cards to select"}
      </p>
    </div>
  );
}
