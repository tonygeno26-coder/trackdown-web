"use client";

import { BlackjackCard, BlackjackHand, dealerUpcardLabel } from "@/lib/training/blackjack";
import { formatHandCards } from "@/lib/training/blackjack-hands";
import PlayingCard from "@/components/cards/PlayingCard";

export default function BlackjackHandDisplay({
  playerHand,
  dealerUpcard,
}: {
  playerHand: BlackjackHand;
  dealerUpcard: BlackjackCard;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">Dealer shows</p>
        <div className="flex flex-col items-center gap-1.5">
          <PlayingCard rankOnly={dealerUpcard.rank} variant="blackjack" size="hero" />
          <p className="font-mono text-[12px] text-td-muted">{dealerUpcardLabel(dealerUpcard.rank)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-td-border/60 bg-td-surface2/40 px-3 py-4 text-center">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">Your hand</p>
        <div className="flex justify-center">
          {playerHand.cards.map((c, i) => (
            <PlayingCard
              key={`${c.rank}-${i}`}
              rankOnly={c.rank}
              variant="blackjack"
              size="hero"
              className={i > 0 ? "relative" : ""}
              style={i > 0 ? { marginLeft: "-18px", zIndex: i + 1 } : { zIndex: 1 }}
            />
          ))}
        </div>
        <p className="mt-3 font-mono text-[13px] text-td-muted">{formatHandCards(playerHand.cards)}</p>
        <p className="mt-0.5 font-mono text-[24px] font-bold text-td-goldsoft">{playerHand.total}</p>
      </div>
    </div>
  );
}
