import { supabase } from "./supabase";
import { DownBlock, TurnIn, WeeklyRate } from "./types";
import { parseAmount } from "./playing";
import { uid } from "./blocks";

/** Read current additional_buy_ins from DB, then append — avoids lost buy-ins from stale UI state. */
export async function appendAdditionalBuyIn(
  sessionId: string,
  amount: number
): Promise<{ additionalBuyIns: number | null; error: string | null }> {
  const { data: row, error: fetchErr } = await supabase
    .from("playing_sessions")
    .select("additional_buy_ins")
    .eq("id", sessionId)
    .single();

  if (fetchErr) return { additionalBuyIns: null, error: fetchErr.message };

  const nextAdditional = parseAmount(row.additional_buy_ins) + amount;
  const { error: updateErr } = await supabase
    .from("playing_sessions")
    .update({ additional_buy_ins: nextAdditional })
    .eq("id", sessionId);

  if (updateErr) return { additionalBuyIns: null, error: updateErr.message };
  return { additionalBuyIns: nextAdditional, error: null };
}

/** Load latest blocks from DB before applying an update — avoids lost down logs from concurrent writes. */
export async function updateShiftBlock(
  shiftId: string,
  blockId: string,
  apply: (block: DownBlock) => DownBlock
): Promise<{ blocks: DownBlock[] | null; error: string | null }> {
  const { data: row, error: fetchErr } = await supabase
    .from("shifts")
    .select("blocks")
    .eq("id", shiftId)
    .single();

  if (fetchErr) return { blocks: null, error: fetchErr.message };

  const currentBlocks = (row.blocks ?? []) as DownBlock[];
  const index = currentBlocks.findIndex((b) => b.id === blockId);
  if (index === -1) return { blocks: null, error: "Down block not found on shift." };

  const nextBlocks = currentBlocks.map((b, i) => (i === index ? apply(b) : b));
  const { error: updateErr } = await supabase
    .from("shifts")
    .update({ blocks: nextBlocks })
    .eq("id", shiftId);

  if (updateErr) return { blocks: null, error: updateErr.message };
  return { blocks: nextBlocks, error: null };
}

/** Replace one block in a shift using the latest blocks from DB. */
export async function replaceShiftBlock(
  shiftId: string,
  updatedBlock: DownBlock
): Promise<{ blocks: DownBlock[] | null; error: string | null }> {
  return updateShiftBlock(shiftId, updatedBlock.id, () => updatedBlock);
}

/** Load latest turn-ins from DB, then append — avoids lost turn-ins from stale UI state. */
export async function appendTurnIn(
  shiftId: string,
  amount: number
): Promise<{ turnIns: TurnIn[] | null; error: string | null }> {
  const { data: row, error: fetchErr } = await supabase
    .from("shifts")
    .select("turn_ins")
    .eq("id", shiftId)
    .single();

  if (fetchErr) return { turnIns: null, error: fetchErr.message };

  const currentTurnIns = (row.turn_ins ?? []) as TurnIn[];
  const nextTurnIns = [
    ...currentTurnIns,
    { id: uid(), amount, timestamp: new Date().toISOString() },
  ];
  const { error: updateErr } = await supabase.from("shifts").update({ turn_ins: nextTurnIns }).eq("id", shiftId);

  if (updateErr) return { turnIns: null, error: updateErr.message };
  return { turnIns: nextTurnIns, error: null };
}

/** Load latest turn-ins from DB before applying an update — avoids lost turn-ins from concurrent writes. */
export async function updateTurnIn(
  shiftId: string,
  turnInId: string,
  apply: (turnIn: TurnIn) => TurnIn
): Promise<{ turnIns: TurnIn[] | null; error: string | null }> {
  const { data: row, error: fetchErr } = await supabase
    .from("shifts")
    .select("turn_ins")
    .eq("id", shiftId)
    .single();

  if (fetchErr) return { turnIns: null, error: fetchErr.message };

  const currentTurnIns = (row.turn_ins ?? []) as TurnIn[];
  const index = currentTurnIns.findIndex((t) => t.id === turnInId);
  if (index === -1) return { turnIns: null, error: "Turn-in not found on shift." };

  const nextTurnIns = currentTurnIns.map((t, i) => (i === index ? apply(t) : t));
  const { error: updateErr } = await supabase.from("shifts").update({ turn_ins: nextTurnIns }).eq("id", shiftId);

  if (updateErr) return { turnIns: null, error: updateErr.message };
  return { turnIns: nextTurnIns, error: null };
}

/** Load latest turn-ins from DB, then remove one — avoids lost turn-ins from stale UI state. */
export async function deleteTurnIn(
  shiftId: string,
  turnInId: string
): Promise<{ turnIns: TurnIn[] | null; error: string | null }> {
  const { data: row, error: fetchErr } = await supabase
    .from("shifts")
    .select("turn_ins")
    .eq("id", shiftId)
    .single();

  if (fetchErr) return { turnIns: null, error: fetchErr.message };

  const currentTurnIns = (row.turn_ins ?? []) as TurnIn[];
  const nextTurnIns = currentTurnIns.filter((t) => t.id !== turnInId);
  const { error: updateErr } = await supabase.from("shifts").update({ turn_ins: nextTurnIns }).eq("id", shiftId);

  if (updateErr) return { turnIns: null, error: updateErr.message };
  return { turnIns: nextTurnIns, error: null };
}

/** Upsert a posted down rate for a given week (keyed by that week's Monday). */
export async function upsertWeeklyRate(
  userId: string,
  weekStart: string,
  downRate: number
): Promise<{ rate: WeeklyRate | null; error: string | null }> {
  const { data, error } = await supabase
    .from("weekly_rates")
    .upsert({ user_id: userId, week_start: weekStart, down_rate: downRate }, { onConflict: "user_id,week_start" })
    .select()
    .single();

  if (error) return { rate: null, error: error.message };
  return { rate: data as WeeklyRate, error: null };
}
