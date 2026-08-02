export type Suit = "clubs" | "diamonds" | "hearts" | "spades";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface ParsedCard {
  rank: Rank;
  suit: Suit;
  notation: string;
}

const SUIT_MAP: Record<string, Suit> = {
  c: "clubs",
  C: "clubs",
  d: "diamonds",
  D: "diamonds",
  h: "hearts",
  H: "hearts",
  s: "spades",
  S: "spades",
};

const RANK_MAP: Record<string, Rank> = {
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  T: "10",
  t: "10",
  "10": "10",
  J: "J",
  j: "J",
  Q: "Q",
  q: "Q",
  K: "K",
  k: "K",
  A: "A",
  a: "A",
};

const SUIT_SYMBOL: Record<Suit, string> = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};

const SUIT_NAMES: Record<Suit, string> = {
  clubs: "clubs",
  diamonds: "diamonds",
  hearts: "hearts",
  spades: "spades",
};

const RANK_NAMES: Record<Rank, string> = {
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  J: "Jack",
  Q: "Queen",
  K: "King",
  A: "Ace",
};

export function parseCompactCard(notation: string): ParsedCard | null {
  const trimmed = notation.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return null;

  const match = trimmed.match(/^([2-9TtJQKA10]{1,2})([cdhsCDHS])$/);
  if (!match) return null;

  const rank = RANK_MAP[match[1]];
  const suit = SUIT_MAP[match[2]];
  if (!rank || !suit) return null;

  return { rank, suit, notation: trimmed };
}

export function parseCardList(cardsStr: string): ParsedCard[] {
  if (!cardsStr || cardsStr.trim() === "—" || cardsStr.trim() === "-") return [];
  return cardsStr
    .split(/[\s,]+/)
    .map((part) => parseCompactCard(part))
    .filter((c): c is ParsedCard => c !== null);
}

export function cardDisplayRank(rank: Rank): string {
  return rank;
}

export function suitSymbol(suit: Suit): string {
  return SUIT_SYMBOL[suit];
}

export function isRedSuit(suit: Suit): boolean {
  return suit === "hearts" || suit === "diamonds";
}

export function cardAccessibilityLabel(card: ParsedCard): string {
  return `${RANK_NAMES[card.rank]} of ${SUIT_NAMES[card.suit]}`;
}

export function cardKey(card: ParsedCard): string {
  return `${card.rank}${card.suit[0]}`;
}
