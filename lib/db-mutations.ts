import { supabase } from "./supabase";
import { DownBlock } from "./types";
import { parseAmount } from "./playing";

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
