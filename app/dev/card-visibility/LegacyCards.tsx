"use client";

/** Legacy card face from pre-visibility pass — demo screenshots only */
import { ParsedCard, cardAccessibilityLabel, cardDisplayRank, isRedSuit, suitSymbol } from "@/lib/cards";

const SIZE_CLASS = "h-[4.25rem] w-[3rem] text-[13px]";
const CENTER_SUIT = "text-[1.75rem]";

export function LegacyPlayingCard({ card }: { card: ParsedCard }) {
  const red = isRedSuit(card.suit);
  const suitClass = red ? "text-td-gold" : "text-td-surface";
  return (
    <div
      className={`relative flex shrink-0 flex-col rounded-lg border bg-td-cream shadow-td-card ${SIZE_CLASS} border-td-border/80`}
      role="img"
      aria-label={cardAccessibilityLabel(card)}
    >
      <div className={`px-1.5 pt-1 font-mono font-bold leading-none ${suitClass}`}>
        <span>{cardDisplayRank(card.rank)}</span>
        <span className="block text-[0.85em]">{suitSymbol(card.suit)}</span>
      </div>
      <div className={`flex flex-1 items-center justify-center ${suitClass} ${CENTER_SUIT}`}>
        {suitSymbol(card.suit)}
      </div>
    </div>
  );
}

export function LegacyCardRow({ cards }: { cards: ParsedCard[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {cards.map((card, i) => (
        <LegacyPlayingCard key={`${card.notation}-${i}`} card={card} />
      ))}
    </div>
  );
}
