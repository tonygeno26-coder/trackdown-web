"use client";

import CardRow from "@/components/cards/CardRow";
import { ParsedCard } from "@/lib/cards";
import { CardSize } from "@/components/cards/PlayingCard";

export default function PokerBoard({
  cards,
  street,
  size = "medium",
}: {
  cards: ParsedCard[];
  street: "preflop" | "flop" | "turn" | "river";
  size?: CardSize;
}) {
  if (street === "preflop") {
    return (
      <div className="flex h-[4.25rem] items-center justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted/70">
          Preflop
        </span>
      </div>
    );
  }

  const slots = street === "flop" ? 3 : street === "turn" ? 4 : 5;
  const visible = cards.slice(0, slots);

  return (
    <div className="flex min-h-[4.25rem] items-center justify-center">
      <CardRow cards={visible} size={size} gapClass="gap-1" />
    </div>
  );
}
