"use client";

import PlayingCardFace, { CardSize } from "@/components/cards/PlayingCard";
import { ParsedCard } from "@/lib/cards";

export default function CardRow({
  cards,
  size = "medium",
  highlighted,
  gapClass = "gap-1.5",
}: {
  cards: ParsedCard[];
  size?: CardSize;
  highlighted?: boolean;
  gapClass?: string;
}) {
  if (cards.length === 0) return null;
  return (
    <div className={`flex flex-wrap justify-center ${gapClass}`}>
      {cards.map((card, i) => (
        <PlayingCardFace key={`${card.notation}-${i}`} card={card} size={size} highlighted={highlighted} />
      ))}
    </div>
  );
}
