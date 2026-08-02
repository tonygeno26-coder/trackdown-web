import { HandCategory } from "./blackjack";
import { PokerScenario } from "./types";
import {
  AdaptiveTopic,
  BlackjackTopic,
  DealerTopic,
  PokerTopic,
  TrainingArea,
  TrainerRoute,
} from "./adaptive-types";

export const DEALER_TOPICS: DealerTopic[] = [
  "pot_calculations",
  "plo_pot_calculations",
  "side_pots",
  "procedures",
  "board_reading",
  "speed_drills",
];

export const POKER_TOPICS: PokerTopic[] = [
  "preflop",
  "flop",
  "turn",
  "river",
  "position",
  "bet_sizing",
  "bluff_catching",
  "value_betting",
];

export const BLACKJACK_TOPICS: BlackjackTopic[] = [
  "hard_totals",
  "soft_totals",
  "pair_splitting",
  "double_decisions",
  "surrender",
];

export const TOPIC_LABELS: Record<AdaptiveTopic, string> = {
  pot_calculations: "Pot Calculations",
  plo_pot_calculations: "PLO Pot Calculations",
  side_pots: "Side Pots",
  procedures: "Procedures",
  board_reading: "Board Reading",
  speed_drills: "Speed Drills",
  preflop: "Preflop",
  flop: "Flop",
  turn: "Turn",
  river: "River Decisions",
  position: "Position",
  bet_sizing: "Bet Sizing",
  bluff_catching: "Bluff Catching",
  value_betting: "Value Betting",
  hard_totals: "Hard Totals",
  soft_totals: "Soft Totals",
  pair_splitting: "Pair Splitting",
  double_decisions: "Double Decisions",
  surrender: "Surrender",
};

export const AREA_LABELS: Record<TrainingArea, string> = {
  dealer: "Dealer",
  poker: "Poker",
  blackjack: "Blackjack",
};

export function topicArea(topic: AdaptiveTopic): TrainingArea {
  if ((DEALER_TOPICS as string[]).includes(topic)) return "dealer";
  if ((POKER_TOPICS as string[]).includes(topic)) return "poker";
  return "blackjack";
}

export function trainerRouteForTopic(topic: AdaptiveTopic): TrainerRoute {
  switch (topic) {
    case "pot_calculations":
      return { type: "pot-calc", topic };
    case "plo_pot_calculations":
      return { type: "plo-calc", topic };
    case "bet_sizing":
      return { type: "pot-odds", topic };
    case "preflop":
    case "flop":
    case "turn":
    case "river":
    case "position":
    case "bluff_catching":
    case "value_betting":
      return { type: "poker-simulator", topic };
    case "hard_totals":
    case "soft_totals":
    case "pair_splitting":
    case "double_decisions":
    case "surrender":
      return { type: "blackjack-trainer", topic };
    case "side_pots":
    case "procedures":
    case "board_reading":
    case "speed_drills":
      return { type: "dealer-home" };
    default:
      return { type: "dealer-home" };
  }
}

/** Topics with live trainers for Today's Focus selection */
export const FOCUS_TRAINABLE: Record<TrainingArea, AdaptiveTopic[]> = {
  dealer: ["pot_calculations", "plo_pot_calculations"],
  poker: [
    "preflop",
    "flop",
    "turn",
    "river",
    "position",
    "bet_sizing",
    "bluff_catching",
    "value_betting",
  ],
  blackjack: [
    "hard_totals",
    "soft_totals",
    "pair_splitting",
    "double_decisions",
    "surrender",
  ],
};

export function mapScenarioToTopic(scenario: PokerScenario): PokerTopic {
  const concepts = scenario.concepts.map((c) => c.toLowerCase());
  const tags = scenario.tags.map((t) => t.toLowerCase());
  const text = [...concepts, ...tags].join(" ");

  if (text.includes("bluff catch") || text.includes("bluff catching")) return "bluff_catching";
  if (text.includes("value bet") || text.includes("value betting")) return "value_betting";
  if (tags.includes("preflop")) return "preflop";
  if (tags.includes("river")) return "river";
  if (tags.includes("turn")) return "turn";
  if (tags.includes("flop")) return "flop";
  if (tags.includes("in_position") || tags.includes("out_of_position") || text.includes("position"))
    return "position";
  if (text.includes("bet") || text.includes("sizing") || text.includes("3-bet")) return "bet_sizing";
  if (tags.includes("preflop")) return "preflop";
  return "flop";
}

export function mapBlackjackToTopic(
  category: HandCategory | "surrender",
  recommended: string
): BlackjackTopic {
  if (category === "surrender" || recommended === "surrender") return "surrender";
  if (category === "pair") return "pair_splitting";
  if (category === "soft") return "soft_totals";
  if (recommended === "double") return "double_decisions";
  return "hard_totals";
}

export function allTopics(): AdaptiveTopic[] {
  return [...DEALER_TOPICS, ...POKER_TOPICS, ...BLACKJACK_TOPICS];
}
