import { ParsedCard, Rank, parseCardList } from "@/lib/cards";

const RANK_VALUE: Record<Rank, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  "10": 10, J: 11, Q: 12, K: 13, A: 14,
};

const LOW_RANK_VALUE: Record<Rank, number> = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 99, "10": 99, J: 99, Q: 99, K: 99,
};

export interface EvaluatedHand {
  rank: number;
  values: number[];
  description: string;
  cards: ParsedCard[];
}

const HAND_NAMES = [
  "High Card", "Pair", "Two Pair", "Three of a Kind", "Straight",
  "Flush", "Full House", "Four of a Kind", "Straight Flush",
];

function rankCounts(cards: ParsedCard[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const c of cards) {
    const v = RANK_VALUE[c.rank];
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return m;
}

function isStraight(values: number[]): boolean {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  if (sorted.length < 5) return false;
  for (let i = 0; i <= sorted.length - 5; i++) {
    const slice = sorted.slice(i, i + 5);
    if (slice[4] - slice[0] === 4) return true;
  }
  if (sorted.includes(14)) {
    const wheel = [14, 2, 3, 4, 5];
    if (wheel.every((v) => sorted.includes(v))) return true;
  }
  return false;
}

function straightHigh(values: number[]): number {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  for (let i = sorted.length - 5; i >= 0; i--) {
    const slice = sorted.slice(i, i + 5);
    if (slice[4] - slice[0] === 4) return slice[4];
  }
  if ([14, 2, 3, 4, 5].every((v) => sorted.includes(v))) return 5;
  return 0;
}

function evaluateFive(cards: ParsedCard[]): EvaluatedHand {
  const values = cards.map((c) => RANK_VALUE[c.rank]).sort((a, b) => b - a);
  const counts = rankCounts(cards);
  const countEntries = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);
  const straight = isStraight(values);

  if (isFlush && straight) {
    return { rank: 8, values: [straightHigh(values)], description: "Straight Flush", cards };
  }
  if (countEntries[0][1] === 4) {
    return { rank: 7, values: [countEntries[0][0], countEntries[1][0]], description: "Four of a Kind", cards };
  }
  if (countEntries[0][1] === 3 && countEntries[1][1] === 2) {
    return { rank: 6, values: [countEntries[0][0], countEntries[1][0]], description: "Full House", cards };
  }
  if (isFlush) {
    return { rank: 5, values, description: "Flush", cards };
  }
  if (straight) {
    return { rank: 4, values: [straightHigh(values)], description: "Straight", cards };
  }
  if (countEntries[0][1] === 3) {
    const kickers = countEntries.filter((e) => e[1] === 1).map((e) => e[0]);
    return { rank: 3, values: [countEntries[0][0], ...kickers], description: "Three of a Kind", cards };
  }
  if (countEntries[0][1] === 2 && countEntries[1][1] === 2) {
    const kicker = countEntries.find((e) => e[1] === 1)?.[0] ?? 0;
    return { rank: 2, values: [countEntries[0][0], countEntries[1][0], kicker], description: "Two Pair", cards };
  }
  if (countEntries[0][1] === 2) {
    const kickers = countEntries.filter((e) => e[1] === 1).map((e) => e[0]);
    return { rank: 1, values: [countEntries[0][0], ...kickers], description: "Pair", cards };
  }
  return { rank: 0, values, description: "High Card", cards };
}

function compareEvaluated(a: EvaluatedHand, b: EvaluatedHand): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.max(a.values.length, b.values.length); i++) {
    const diff = (a.values[i] ?? 0) - (b.values[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

export function evaluateHoldem(holeCards: string, board: string): EvaluatedHand {
  const all = [...parseCardList(holeCards), ...parseCardList(board)];
  let best: EvaluatedHand | null = null;
  for (const combo of combinations(all, 5)) {
    const ev = evaluateFive(combo);
    if (!best || compareEvaluated(ev, best) > 0) best = ev;
  }
  return best!;
}

export function evaluatePlo(holeCards: string, board: string): EvaluatedHand {
  const hole = parseCardList(holeCards);
  const brd = parseCardList(board);
  let best: EvaluatedHand | null = null;
  for (const h2 of combinations(hole, 2)) {
    for (const b3 of combinations(brd, 3)) {
      const ev = evaluateFive([...h2, ...b3]);
      if (!best || compareEvaluated(ev, best) > 0) best = ev;
    }
  }
  return best!;
}

export interface LowHand {
  values: number[];
  description: string;
  qualifies: boolean;
}

export function evaluateOmahaLow(holeCards: string, board: string): LowHand {
  const hole = parseCardList(holeCards);
  const brd = parseCardList(board);
  let best: number[] | null = null;

  for (const h2 of combinations(hole, 2)) {
    for (const b3 of combinations(brd, 3)) {
      const five = [...h2, ...b3];
      const lowVals = five.map((c) => LOW_RANK_VALUE[c.rank]);
      if (lowVals.some((v) => v > 8)) continue;
      const unique = [...new Set(lowVals)];
      if (unique.length !== 5) continue;
      unique.sort((a, b) => a - b);
      if (!best || compareLow(unique, best) < 0) best = unique;
    }
  }

  if (!best) return { values: [], description: "No qualifying low", qualifies: false };
  return {
    values: best,
    description: `Low ${best.map((v) => (v === 1 ? "A" : String(v))).join("-")}`,
    qualifies: true,
  };
}

function compareLow(a: number[], b: number[]): number {
  for (let i = 4; i >= 0; i--) {
    const diff = (a[i] ?? 99) - (b[i] ?? 99);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function compareHands(a: EvaluatedHand, b: EvaluatedHand): number {
  return compareEvaluated(a, b);
}

export function findWinningHandIds(
  hands: { id: string; cards: string }[],
  board: string,
  gameType: "holdem" | "plo"
): string[] {
  const evals = hands.map((h) => ({
    id: h.id,
    ev: gameType === "plo" ? evaluatePlo(h.cards, board) : evaluateHoldem(h.cards, board),
  }));
  let best = evals[0];
  for (const e of evals.slice(1)) {
    if (compareEvaluated(e.ev, best.ev) > 0) best = e;
  }
  const bestRank = best.ev;
  return evals.filter((e) => compareEvaluated(e.ev, bestRank) === 0).map((e) => e.id);
}

export function findHiLoWinners(
  hands: { id: string; cards: string }[],
  board: string
): { highWinnerIds: string[]; lowWinnerIds: string[] } {
  const highWinnerIds = findWinningHandIds(hands, board, "plo");
  const lows = hands.map((h) => ({ id: h.id, low: evaluateOmahaLow(h.cards, board) }));
  const qualifying = lows.filter((l) => l.low.qualifies);
  if (qualifying.length === 0) return { highWinnerIds, lowWinnerIds: [] };
  let bestLow = qualifying[0];
  for (const l of qualifying.slice(1)) {
    if (compareLow(l.low.values, bestLow.low.values) < 0) bestLow = l;
  }
  const lowWinnerIds = qualifying
    .filter((l) => compareLow(l.low.values, bestLow.low.values) === 0)
    .map((l) => l.id);
  return { highWinnerIds, lowWinnerIds };
}

export function handRankName(rank: number): string {
  return HAND_NAMES[rank] ?? "Unknown";
}
