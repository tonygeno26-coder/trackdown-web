export type ShiftType = "tournament" | "cash" | "homegame" | "tournament_cash";
export type DealingSegment = "tournament" | "cash";
export type BlockStatus = "pending" | "done" | "skipped" | "break";
export type ShiftRole = "dealer" | "hostess";
export type TaxModel = "flat" | "tiered";

export interface TurnIn {
  id: string;
  amount: number;
  timestamp: string; // ISO
}

export interface DownBlock {
  id: string;
  index: number;
  scheduledStart: string; // ISO
  scheduledEnd: string; // ISO
  status: BlockStatus;
  /** Which segment was active when this down was logged (combined shifts). */
  segment?: DealingSegment;
  tournament: string;
  table: string;
  game: string;
  tips: number;
  notes: string;
}

export interface Shift {
  id: string;
  type: ShiftType;
  title: string;
  down_length: 30 | 40;
  house_tax_pct: number;
  is_lump_sum: boolean;
  lump_sum_tips: number | null;
  hourly_rate: number | null;
  start_time: string; // ISO
  ended_at: string | null;
  settled_status: "yes" | "no" | "partial" | null;
  settled_amount: number | null;
  status: "active" | "completed";
  blocks: DownBlock[];
  /** Active segment while dealing (combined shifts only). */
  active_segment?: DealingSegment | null;
  role: ShiftRole | null;
  tax_model: TaxModel | null;
  tiered_threshold: number;
  tiered_rate_below: number;
  tiered_rate_above: number;
  turn_ins: TurnIn[];
  created_at: string;
  is_demo?: boolean;
  user_id?: string;
}

export interface WeeklyRate {
  id: string;
  week_start: string; // YYYY-MM-DD, the Monday of the week
  down_rate: number;
  created_at: string;
  user_id?: string;
}

export type PlayingSessionType = "cash" | "tournament";
export type PlayingSessionStatus = "active" | "completed";

export interface PlayingSession {
  id: string;
  session_type: PlayingSessionType;
  status: PlayingSessionStatus;
  title: string;
  location: string;
  game: string;
  stakes: string;
  start_time: string;
  ended_at: string | null;
  initial_buy_in: number;
  additional_buy_ins: number;
  cash_out: number | null;
  expenses: number;
  notes: string;
  created_at: string;
  is_demo?: boolean;
  user_id?: string;
}
