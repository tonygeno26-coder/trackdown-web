"use client";

import { parseCardList } from "@/lib/cards";
import CardRow from "@/components/cards/CardRow";
import { SavedHand } from "@/lib/hands/types";

export default function SavedHandCard({
  hand,
  onClick,
}: {
  hand: SavedHand;
  onClick: () => void;
}) {
  const heroCards = parseCardList(hand.hero_cards);
  const boardCards = parseCardList(hand.board_cards);
  const date = new Date(hand.played_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-td-lg border border-td-border/80 bg-td-surface/90 p-3 text-left shadow-td-card transition-colors hover:border-td-gold/40 sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardRow cards={heroCards} size="thumbnail" overlap />
            {boardCards.length > 0 && (
              <>
                <span className="text-td-muted/60" aria-hidden>|</span>
                <CardRow cards={boardCards} size="thumbnail" overlap />
              </>
            )}
          </div>
          <p className="text-[13px] font-semibold text-td-cream">
            {hand.result}
            {hand.stakes && <span className="font-normal text-td-muted"> · {hand.stakes}</span>}
          </p>
          <p className="truncate text-[12px] text-td-muted">
            {[hand.casino, hand.game, hand.hero_position && `Hero ${hand.hero_position}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {hand.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hand.tags.map((t) => (
                <span key={t} className="rounded-full border border-td-border px-2 py-0.5 text-[10px] text-td-muted">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="shrink-0 text-[11px] font-mono text-td-muted">{date}</span>
      </div>
    </button>
  );
}
