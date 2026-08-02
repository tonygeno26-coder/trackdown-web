import { PokerAction } from "@/lib/training/types";

export type HandStreet = "preflop" | "flop" | "turn" | "river";

export interface HandActionRecord {
  player: "hero" | "villain" | string;
  action: PokerAction;
  amount?: number;
  description?: string;
}

export interface StreetSegment {
  street: HandStreet;
  board: string;
  actions: HandActionRecord[];
}

export interface SavedHand {
  id: string;
  user_id: string;
  session_id: string | null;
  casino: string;
  game: string;
  stakes: string;
  played_at: string;
  hero_position: string;
  villain_position: string;
  effective_stack: string;
  hero_cards: string;
  board_cards: string;
  action_history: StreetSegment[];
  result: string;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type SavedHandInput = Omit<
  SavedHand,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface SavedHandFilters {
  search: string;
  casino: string;
  game: string;
  stakes: string;
  position: string;
  dateFrom: string;
  dateTo: string;
  tag: string;
}

export const POKER_POSITIONS = [
  "UTG",
  "UTG+1",
  "MP",
  "HJ",
  "CO",
  "BTN",
  "SB",
  "BB",
] as const;

export const HAND_RESULT_OPTIONS = [
  "Won",
  "Lost",
  "Break Even",
  "Folded",
  "Unknown",
] as const;
