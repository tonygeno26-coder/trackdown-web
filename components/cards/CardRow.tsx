"use client";

import PlayingCard from "@/components/cards/PlayingCard";
import { CardSize, CardState } from "@/components/cards/types";
import { ParsedCard } from "@/lib/cards";

const OVERLAP_PX: Record<CardSize, number> = {
  thumbnail: 10,
  small: 12,
  medium: 14,
  large: 16,
  hero: 18,
};

export default function CardRow({
  cards,
  size = "medium",
  highlighted,
  selected,
  dimmed,
  state,
  overlap = true,
  gapClass,
  className = "",
  cardStates,
  badges,
}: {
  cards: ParsedCard[];
  size?: CardSize;
  highlighted?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  state?: CardState;
  overlap?: boolean;
  gapClass?: string;
  className?: string;
  cardStates?: CardState[];
  badges?: (string | undefined)[];
}) {
  if (cards.length === 0) return null;

  const overlapPx = OVERLAP_PX[size];

  if (!overlap) {
    return (
      <div className={`flex flex-wrap justify-center ${gapClass ?? "gap-1"} ${className}`}>
        {cards.map((card, i) => (
          <PlayingCard
            key={`${card.notation}-${i}`}
            card={card}
            size={size}
            highlighted={highlighted}
            selected={selected}
            dimmed={dimmed}
            state={cardStates?.[i] ?? state}
            badge={badges?.[i]}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex justify-center ${className}`}
      role="group"
      aria-label={`${cards.length} cards`}
    >
      {cards.map((card, i) => (
        <PlayingCard
          key={`${card.notation}-${i}`}
          card={card}
          size={size}
          highlighted={highlighted}
          selected={selected}
          dimmed={dimmed}
          state={cardStates?.[i] ?? state}
          badge={badges?.[i]}
          className={i > 0 ? "relative" : ""}
          style={i > 0 ? { marginLeft: `-${overlapPx}px`, zIndex: i + 1 } : { zIndex: 1 }}
        />
      ))}
    </div>
  );
}
