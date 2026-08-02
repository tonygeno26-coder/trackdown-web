"use client";

import { BlackjackCard, BlackjackHand, cardDisplay, dealerUpcardLabel } from "@/lib/training/blackjack";
import { formatHandCards } from "@/lib/training/blackjack-hands";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function BlackjackHandDisplay({
  playerHand,
  dealerUpcard,
}: {
  playerHand: BlackjackHand;
  dealerUpcard: BlackjackCard;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Dealer shows</p>
        <div className="mx-auto mt-2 flex h-20 w-16 items-center justify-center rounded-xl border-2 border-td-border bg-td-surface2 font-display text-2xl font-bold text-td-cream shadow-td-card">
          {dealerUpcardLabel(dealerUpcard.rank)}
        </div>
      </div>

      <PlayingCard className="p-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Your hand</p>
        <div className="mt-3 flex justify-center gap-3">
          {playerHand.cards.map((c, i) => (
            <div
              key={i}
              className="flex h-24 w-[4.5rem] items-center justify-center rounded-xl border-2 border-td-gold/30 bg-td-bg font-display text-2xl font-bold text-td-cream"
            >
              {cardDisplay(c.rank)}
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[15px] text-td-muted">{formatHandCards(playerHand.cards)}</p>
        <p className="mt-1 font-mono text-[22px] font-bold text-td-goldsoft">{playerHand.total}</p>
      </PlayingCard>
    </div>
  );
}
