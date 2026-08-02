"use client";

import CardRow from "@/components/cards/CardRow";
import { ParsedCard } from "@/lib/cards";
import { CardSize } from "@/components/cards/types";

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
      <div className="flex h-[4.5rem] items-center justify-center sm:h-[4.75rem]">
        <span className="text-[10px] font-semibold uppercase tracking-[1px] text-td-muted/70">
          Preflop
        </span>
      </div>
    );
  }

  const slots = street === "flop" ? 3 : street === "turn" ? 4 : 5;
  const visible = cards.slice(0, slots);

  return (
    <div className="flex min-h-[4.5rem] items-center justify-center sm:min-h-[4.75rem]">
      <CardRow cards={visible} size={size} overlap gapClass="gap-0" />
    </div>
  );
}
