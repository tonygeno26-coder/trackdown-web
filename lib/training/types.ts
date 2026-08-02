export type DealerTipCategory =
  | "pitching"
  | "pace"
  | "announcing"
  | "deck"
  | "pot"
  | "communication"
  | "cash"
  | "tournament"
  | "mistakes"
  | "professionalism";

export interface DealerTip {
  id: string;
  title: string;
  category: DealerTipCategory;
  explanation: string;
  practicalTip: string;
  commonMistake?: string;
}

export type CalculationType =
  | "total_pot"
  | "call_amount"
  | "min_raise"
  | "pot_after_call";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface CalculationQuestion {
  id: string;
  difficulty: Difficulty;
  type: CalculationType;
  startingPot: number;
  currentBet: number;
  previousRaiseSize?: number;
  callers?: number;
  previousAction: string;
  prompt: string;
  correctAnswer: number;
  steps: string[];
}

export type PloCalculationType =
  | "call_amount"
  | "pot_before_raise"
  | "max_raise"
  | "total_put_in";

export interface PloCalculationQuestion {
  id: string;
  difficulty: Difficulty;
  type: PloCalculationType;
  pot: number;
  currentBet: number;
  actionHistory: string;
  straddle?: number;
  prompt: string;
  correctAnswer: number;
  steps: string[];
}

export type PokerAction = "fold" | "call" | "check" | "bet" | "raise";

export interface RecommendedAction {
  action: PokerAction;
  frequency: number;
}

export interface PokerScenario {
  id: string;
  source: "Trackdown training scenario";
  gameType: string;
  players: number;
  effectiveStack: string;
  heroPosition: string;
  villainPosition?: string;
  stakes: string;
  heroCards: string;
  board: string;
  potSize: number;
  actionHistory: string;
  availableActions: PokerAction[];
  /** Optional display labels e.g. "Call $75", "Raise to $300" */
  actionLabels?: Partial<Record<PokerAction, string>>;
  recommended: RecommendedAction[];
  preferredAction: PokerAction;
  explanation: string;
  concepts: string[];
  difficulty: Difficulty;
  tags: string[];
}

export interface PotOddsQuestion {
  id: string;
  difficulty: Difficulty;
  potBefore: number;
  betToCall: number;
  estimatedEquity?: number;
  drawDescription?: string;
  prompt: string;
  correctCallAmount: number;
  correctFinalPot: number;
  correctEquityPct: number;
  steps: string[];
  explanation: string;
}

export interface ModuleStats {
  attempted: number;
  correct: number;
  currentStreak: number;
  bestStreak: number;
}

export interface ScenarioStats extends ModuleStats {
  acceptable: number;
  byPosition: Record<string, { attempted: number; preferred: number }>;
  byTag: Record<string, { attempted: number; preferred: number }>;
}

export interface TrainingProgress {
  version: 2;
  dealer: {
    completedTipIds: string[];
    potCalc: ModuleStats;
    ploCalc: ModuleStats;
  };
  poker: {
    scenarios: ScenarioStats;
    potOdds: ModuleStats;
  };
  blackjack: BlackjackStats;
}

export interface BlackjackStats {
  total: ModuleStats;
  hard: ModuleStats;
  soft: ModuleStats;
  pair: ModuleStats;
  surrender: ModuleStats;
  mistakeQueue: string[];
  totalResponseMs: number;
  responseCount: number;
  speedBestStreak: number;
  speedCurrentStreak: number;
}

export const ACCEPTABLE_ACTION_THRESHOLD = 10;

export const DEALER_TIP_CATEGORY_LABELS: Record<DealerTipCategory, string> = {
  pitching: "Pitching & Card Control",
  pace: "Game Pace",
  announcing: "Announcing Action",
  deck: "Protecting the Deck",
  pot: "Managing the Pot",
  communication: "Player Communication",
  cash: "Cash-Game Procedures",
  tournament: "Tournament Procedures",
  mistakes: "Common Mistakes",
  professionalism: "Professionalism",
};
