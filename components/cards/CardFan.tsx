"use client";

import PlayingCard from "@/components/cards/PlayingCard";
import { PLO_FAN_SIZE_CLASS, CardState } from "@/components/cards/types";
import { ParsedCard } from "@/lib/cards";

/** Compact fan layout for PLO — all four corner ranks remain visible */
export default function CardFan({
  cards,
  highlighted,
  selected,
  dimmed,
  state,
  cardStates,
  className = "",
}: {
  cards: ParsedCard[];
  highlighted?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  state?: CardState;
  cardStates?: CardState[];
  className?: string;
}) {
  if (cards.length === 0) return null;

  const fanRotations = [-6, -2, 2, 6];
  const overlapPx = 14;

  return (
    <div
      className={`flex justify-center py-1 ${className}`}
      role="group"
      aria-label={`${cards.length} hole cards`}
    >
      {cards.map((card, i) => {
        const rotation = fanRotations[i] ?? 0;
        return (
          <PlayingCard
            key={`${card.notation}-${i}`}
            card={card}
            size="medium"
            highlighted={highlighted}
            selected={selected}
            dimmed={dimmed}
            state={cardStates?.[i] ?? state}
            className={`${PLO_FAN_SIZE_CLASS} ${i > 0 ? "relative" : ""} motion-safe:transition-transform`}
            style={{
              marginLeft: i > 0 ? `-${overlapPx}px` : undefined,
              zIndex: i + 1,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
