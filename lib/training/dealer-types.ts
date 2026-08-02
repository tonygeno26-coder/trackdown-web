import { Difficulty, ModuleStats } from "./types";

/** Dealer Academy module identifiers */
export type DealerModuleKey =
  | "tips"
  | "pot"
  | "plo"
  | "side-pot"
  | "misdeal"
  | "tournament-quiz"
  | "cash-quiz"
  | "board-reading"
  | "hi-lo"
  | "speed";

export type DealerSkillGroup =
  | "math"
  | "procedures"
  | "board_reading"
  | "side_pots"
  | "high_low"
  | "speed"
  | "professional";

export const DEALER_MODULE_SKILL: Record<DealerModuleKey, DealerSkillGroup> = {
  tips: "professional",
  pot: "math",
  plo: "math",
  "side-pot": "side_pots",
  misdeal: "procedures",
  "tournament-quiz": "procedures",
  "cash-quiz": "procedures",
  "board-reading": "board_reading",
  "hi-lo": "high_low",
  speed: "speed",
};

export const DEALER_SKILL_LABELS: Record<DealerSkillGroup, string> = {
  math: "Math",
  procedures: "Procedures",
  board_reading: "Board Reading",
  side_pots: "Side Pots",
  high_low: "High-Low",
  speed: "Speed",
  professional: "Professional Knowledge",
};

/** Per-question attempt tracking for procedure-style modules */
export interface ProcedureProgress extends ModuleStats {
  byQuestionId: Record<string, { attempted: number; correct: number; lastAt?: string }>;
  mistakeQueue: string[];
  lastPracticedAt?: string;
}

export type SpeedDrillMode = "60s" | "120s" | "5q" | "10q";

export interface SpeedDrillPersonalBest {
  mode: SpeedDrillMode;
  score: number;
  at: string;
}

export interface SpeedDrillProgress {
  totalSessions: number;
  totalCorrect: number;
  totalAttempted: number;
  personalBests: SpeedDrillPersonalBest[];
  lastPracticedAt?: string;
}

export interface TipLibraryProgress {
  completedIds: string[];
  viewedIds: string[];
  savedIds: string[];
  dailyTipId?: string;
  dailyTipDate?: string;
}

export interface DealerSkillProgress {
  potCalc: ModuleStats;
  ploCalc: ModuleStats;
  sidePot: ProcedureProgress;
  misdeal: ProcedureProgress;
  tournamentQuiz: ProcedureProgress;
  cashQuiz: ProcedureProgress;
  boardReading: ProcedureProgress;
  hiLo: ProcedureProgress;
  speed: SpeedDrillProgress;
  tips: TipLibraryProgress;
  totalTrainingMs: number;
  streakDays: number;
  lastTrainingDate?: string;
}

export type QuizMode = "quick" | "full" | "mistakes" | "timed";

export interface QuizOption {
  id: string;
  text: string;
}

export interface ProcedureQuizQuestion {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  caveat?: string;
  tags: string[];
}

export interface ProcedureScenario {
  id: string;
  difficulty: Difficulty;
  title: string;
  situation: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  caveat?: string;
  tags: string[];
}

export interface SidePotPlayerInput {
  id: string;
  name: string;
  stack: number;
  committed: number;
  folded?: boolean;
}

export interface SidePotQuestion {
  id: string;
  difficulty: Difficulty;
  title: string;
  description: string;
  players: SidePotPlayerInput[];
  /** Expected side pot layers: amount + eligible player ids in order (main first) */
  expectedLayers: { amount: number; eligibleIds: string[] }[];
  totalPot: number;
  steps: string[];
  caveat?: string;
}

export type BoardGameType = "holdem" | "plo" | "omaha-hilo";

export interface BoardReadingHand {
  id: string;
  cards: string;
  label: string;
}

export interface BoardReadingScenario {
  id: string;
  difficulty: Difficulty;
  gameType: BoardGameType;
  board: string;
  hands: BoardReadingHand[];
  /** Hand id(s) that win — may be multiple for ties */
  winningHandIds: string[];
  explanation: string;
  caveat?: string;
}

export interface HiLoScenario {
  id: string;
  difficulty: Difficulty;
  board: string;
  hands: BoardReadingHand[];
  /** high winners */
  highWinnerIds: string[];
  /** low winners — empty if no qualifying low */
  lowWinnerIds: string[];
  /** per-winner payout description */
  payoutDescription: string;
  explanation: string;
  caveat?: string;
  tags: string[];
}

export interface SpeedDrillQuestion {
  id: string;
  type: "pot_total" | "side_pot_count" | "call_amount" | "chip_count";
  prompt: string;
  correctAnswer: number;
  difficulty: Difficulty;
}

export interface TodaysFocusItem {
  module: DealerModuleKey;
  moduleLabel: string;
  reason: string;
  estimatedMinutes: number;
  accuracy: number;
  route: DealerModuleKey;
  secondary?: boolean;
}

export type DateRangeFilter = "7d" | "30d" | "all";
