"use client";

import type { CSSProperties } from "react";
import CardBack from "@/components/cards/CardBack";
import {
  BLACKJACK_SIZE_CLASS,
  CARD_CENTER_SUIT,
  CARD_RANK_CLASS,
  CARD_SIZE_CLASS,
  CardSize,
  CardState,
  CardVariant,
  PICKER_SIZE_CLASS,
  cardStateClasses,
} from "@/components/cards/types";
import {
  ParsedCard,
  Rank,
  cardAccessibilityLabel,
  cardDisplayRank,
  isRedSuit,
  suitSymbol,
} from "@/lib/cards";

export type { CardSize, CardVariant, CardState };

function sizeClasses(size: CardSize, variant: CardVariant): string {
  if (variant === "blackjack") return BLACKJACK_SIZE_CLASS;
  if (variant === "picker") return PICKER_SIZE_CLASS;
  return CARD_SIZE_CLASS[size];
}

function resolveState(
  state?: CardState,
  opts: { faceDown?: boolean; highlighted?: boolean; dimmed?: boolean; selected?: boolean } = {}
): CardState {
  if (opts.faceDown) return "face-down";
  if (state) return state;
  if (opts.selected) return "selected";
  if (opts.highlighted) return "highlighted";
  if (opts.dimmed) return "dimmed";
  return "default";
}

export default function PlayingCard({
  card,
  size = "medium",
  variant = "poker",
  state: stateProp,
  faceDown = false,
  highlighted = false,
  dimmed = false,
  selected = false,
  /** Rank-only display for blackjack (no suit) */
  rankOnly,
  className = "",
  style,
  onClick,
  badge,
}: {
  card?: ParsedCard | null;
  size?: CardSize;
  variant?: CardVariant;
  state?: CardState;
  faceDown?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  selected?: boolean;
  rankOnly?: Rank;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  badge?: string;
}) {
  const state = resolveState(stateProp, { faceDown, highlighted, dimmed, selected });
  const sizeClass = sizeClasses(size, variant);
  const isInteractive = Boolean(onClick) && state !== "disabled";
  const motionSafe =
    "motion-safe:transition-[transform,box-shadow,opacity] motion-safe:duration-150";

  if (state === "face-down" || (!card && !rankOnly)) {
    return (
      <CardBack
        size={size}
        className={`${cardStateClasses(state)} ${className}`}
      />
    );
  }

  const displayRank = rankOnly ? cardDisplayRank(rankOnly) : card ? cardDisplayRank(card.rank) : "";
  const red = card ? isRedSuit(card.suit) : false;
  const suitClass = red ? "text-td-gold" : "text-td-bg";
  const label = rankOnly
    ? `${displayRank === "10" ? "Ten" : displayRank}`
    : card
      ? cardAccessibilityLabel(card)
      : "Playing card";

  const isThumbnail = variant === "thumbnail" || size === "thumbnail";
  const isBlackjack = variant === "blackjack" || Boolean(rankOnly);

  const Tag = isInteractive ? "button" : "div";

  return (
    <Tag
      type={isInteractive ? "button" : undefined}
      onClick={onClick}
      disabled={state === "disabled"}
      className={`relative flex shrink-0 flex-col overflow-hidden rounded-lg border bg-gradient-to-b from-td-cream to-td-cream/95 shadow-[0_2px_6px_rgba(0,0,0,0.35),0_0_0_1px_rgba(236,238,240,0.08)_inset] ${sizeClass} ${cardStateClasses(state)} ${motionSafe} ${isInteractive ? "cursor-pointer touch-manipulation active:scale-[0.97]" : ""} ${className}`}
      style={style}
      role="img"
      aria-label={label}
      aria-pressed={selected ? true : undefined}
    >
      <div className="pointer-events-none absolute inset-[3px] rounded-[5px] border border-td-border/25" aria-hidden />

      {isBlackjack ? (
        <div className="flex flex-1 flex-col items-center justify-center px-1">
          <span className={`font-display font-bold leading-none text-td-bg ${CARD_RANK_CLASS[size]}`}>
            {displayRank}
          </span>
        </div>
      ) : (
        <>
          <div className={`px-1.5 pt-1 leading-none ${suitClass}`}>
            <span className={`font-mono ${CARD_RANK_CLASS[size]}`}>{displayRank}</span>
            {!isThumbnail && (
              <span className="block text-[0.8em] leading-tight">{card && suitSymbol(card.suit)}</span>
            )}
          </div>
          {!isThumbnail && card && (
            <div
              className={`flex flex-1 items-center justify-center ${suitClass} ${CARD_CENTER_SUIT[size]}`}
            >
              {suitSymbol(card.suit)}
            </div>
          )}
          {isThumbnail && card && (
            <div className={`pb-0.5 text-center ${suitClass} text-[0.75em]`}>
              {suitSymbol(card.suit)}
            </div>
          )}
        </>
      )}

      {badge && (
        <span className="absolute -right-1 -top-1 rounded-full border border-td-border bg-td-surface2 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-td-cream">
          {badge}
        </span>
      )}
    </Tag>
  );
}

/** @deprecated Use PlayingCard — kept for gradual migration */
export { PlayingCard as PlayingCardFace };
