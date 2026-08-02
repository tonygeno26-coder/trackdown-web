export type CardRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export type BlackjackAction = "hit" | "stand" | "double" | "split" | "surrender";

export type HandCategory = "hard" | "soft" | "pair";

export type BlackjackTrainingMode =
  | "random"
  | "hard"
  | "soft"
  | "pairs"
  | "mistakes"
  | "speed";

export interface BlackjackCard {
  rank: CardRank;
}

export interface BlackjackRules {
  decks: 1 | 2 | 6 | 8;
  dealerSoft17: "hit" | "stand";
  doubleAfterSplit: boolean;
  surrender: boolean;
  resplitAces: boolean;
}

export interface BlackjackHand {
  cards: BlackjackCard[];
  category: HandCategory;
  total: number;
  soft: boolean;
  pairRank?: CardRank;
}

export interface BlackjackSituation {
  id: string;
  playerHand: BlackjackHand;
  dealerUpcard: BlackjackCard;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
}

export interface StrategyGrade {
  recommended: BlackjackAction;
  alternatives: BlackjackAction[];
  explanation: string;
  category: HandCategory | "surrender";
  ruleNote?: string;
}

export interface BlackjackPreset {
  id: string;
  label: string;
  description: string;
  rules: BlackjackRules;
}

export const BLACKJACK_RULES_KEY = "trackdown_blackjack_rules_v1";

export const BLACKJACK_PRESETS: BlackjackPreset[] = [
  {
    id: "vegas-strip",
    label: "Vegas Strip (example)",
    description: "6 decks, dealer stands soft 17, DAS, surrender — common reference rules.",
    rules: {
      decks: 6,
      dealerSoft17: "stand",
      doubleAfterSplit: true,
      surrender: true,
      resplitAces: false,
    },
  },
  {
    id: "downtown",
    label: "Downtown Vegas (example)",
    description: "2 decks, dealer hits soft 17, DAS, no surrender.",
    rules: {
      decks: 2,
      dealerSoft17: "hit",
      doubleAfterSplit: true,
      surrender: false,
      resplitAces: false,
    },
  },
  {
    id: "single-deck",
    label: "Single Deck (example)",
    description: "1 deck, dealer stands soft 17, DAS, no surrender.",
    rules: {
      decks: 1,
      dealerSoft17: "stand",
      doubleAfterSplit: true,
      surrender: false,
      resplitAces: false,
    },
  },
  {
    id: "custom",
    label: "Custom",
    description: "Configure your own rule set.",
    rules: {
      decks: 6,
      dealerSoft17: "stand",
      doubleAfterSplit: true,
      surrender: true,
      resplitAces: false,
    },
  },
];

export const BLACKJACK_MODE_LABELS: Record<BlackjackTrainingMode, string> = {
  random: "Random Hands",
  hard: "Hard Totals",
  soft: "Soft Totals",
  pairs: "Pairs",
  mistakes: "Mistakes Review",
  speed: "Speed Drill",
};

export const ACTION_LABELS: Record<BlackjackAction, string> = {
  hit: "Hit",
  stand: "Stand",
  double: "Double",
  split: "Split",
  surrender: "Surrender",
};

export function cardValue(rank: CardRank): number {
  if (rank === "A") return 11;
  if (rank === "10" || rank === "J" || rank === "Q" || rank === "K") return 10;
  return parseInt(rank, 10);
}

export function cardDisplay(rank: CardRank): string {
  return rank;
}

export function dealerUpcardLabel(rank: CardRank): string {
  return rank === "A" ? "Ace" : cardDisplay(rank);
}

export function rulesSummary(rules: BlackjackRules): string {
  return `${rules.decks}-deck · Dealer ${rules.dealerSoft17 === "hit" ? "hits" : "stands on"} soft 17 · DAS ${rules.doubleAfterSplit ? "yes" : "no"} · Surrender ${rules.surrender ? "yes" : "no"}`;
}

export function loadBlackjackRules(): BlackjackRules {
  if (typeof window === "undefined") return BLACKJACK_PRESETS[0].rules;
  try {
    const raw = localStorage.getItem(BLACKJACK_RULES_KEY);
    if (!raw) return BLACKJACK_PRESETS[0].rules;
    return JSON.parse(raw) as BlackjackRules;
  } catch {
    return BLACKJACK_PRESETS[0].rules;
  }
}

export function saveBlackjackRules(rules: BlackjackRules): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BLACKJACK_RULES_KEY, JSON.stringify(rules));
}
