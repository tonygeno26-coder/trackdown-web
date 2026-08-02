import { Difficulty } from "./types";

export type TrainingArea = "dealer" | "poker" | "blackjack";

export type DealerTopic =
  | "pot_calculations"
  | "plo_pot_calculations"
  | "side_pots"
  | "procedures"
  | "board_reading"
  | "speed_drills";

export type PokerTopic =
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "position"
  | "bet_sizing"
  | "bluff_catching"
  | "value_betting";

export type BlackjackTopic =
  | "hard_totals"
  | "soft_totals"
  | "pair_splitting"
  | "double_decisions"
  | "surrender";

export type AdaptiveTopic = DealerTopic | PokerTopic | BlackjackTopic;

export type TopicTier = "weak" | "medium" | "mastered";

export interface AdaptiveAttempt {
  date: string;
  topic: AdaptiveTopic;
  difficulty: Difficulty;
  correct: boolean;
  responseMs: number;
  questionId: string;
}

export interface TopicStats {
  topic: AdaptiveTopic;
  area: TrainingArea;
  label: string;
  attempted: number;
  correct: number;
  accuracy: number;
  avgResponseMs: number;
  currentStreak: number;
  bestStreak: number;
  confidence: number;
  tier: TopicTier;
  recentTrend: number;
}

export interface FocusRecommendation {
  area: TrainingArea;
  areaLabel: string;
  topic: AdaptiveTopic;
  topicLabel: string;
  accuracy: number;
  trainerRoute: TrainerRoute;
}

export type TrainerRoute =
  | { type: "pot-calc"; topic: DealerTopic }
  | { type: "plo-calc"; topic: DealerTopic }
  | { type: "poker-simulator"; topic: PokerTopic }
  | { type: "pot-odds"; topic: PokerTopic }
  | { type: "blackjack-trainer"; topic: BlackjackTopic }
  | { type: "dealer-home" }
  | { type: "poker-home" }
  | { type: "blackjack-home" };

export interface AdaptiveTrainingData {
  version: 1;
  attempts: AdaptiveAttempt[];
  recentQuestionIds: string[];
}

export interface AdaptiveDashboard {
  todaysFocus: FocusRecommendation[];
  recentlyImproved: TopicStats[];
  needsAttention: TopicStats[];
  masteredSkills: TopicStats[];
}
