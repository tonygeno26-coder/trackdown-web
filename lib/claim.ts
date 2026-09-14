import { supabase } from "./supabase";
import { Shift } from "./types";

/** Legacy pre-isolation shifts with no owner — visible to any authenticated user via a narrow RLS policy. */
export async function fetchUnclaimedShifts(): Promise<{ shifts: Shift[]; error: string | null }> {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .is("user_id", null)
    .order("start_time", { ascending: false });

  if (error) return { shifts: [], error: error.message };
  return { shifts: (data ?? []) as Shift[], error: null };
}

/**
 * Assigns the given unclaimed shifts to this user. First-to-claim wins: once
 * a row's user_id is set, the "claim unclaimed" RLS policy's USING clause
 * (user_id IS NULL) no longer matches it for anyone else.
 */
export async function claimShifts(shiftIds: string[], userId: string): Promise<{ error: string | null }> {
  if (shiftIds.length === 0) return { error: null };
  const { error } = await supabase.from("shifts").update({ user_id: userId }).in("id", shiftIds);
  return { error: error?.message ?? null };
}
