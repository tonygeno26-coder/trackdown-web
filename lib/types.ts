export type ShiftType = "tournament" | "cash";
export type BlockStatus = "pending" | "done" | "skipped";

export interface DownBlock {
  id: string;
  index: number;
  scheduledStart: string; // ISO
  scheduledEnd: string; // ISO
  status: BlockStatus;
  tournament: string;
  table: string;
  game: string;
  tips: number;
  notes: string;
}

export interface Shift {
  id: string;
  type: ShiftType;
  down_length: 30 | 40;
  start_time: string; // ISO
  ended_at: string | null;
  status: "active" | "completed";
  blocks: DownBlock[];
  created_at: string;
}
