import { supabase } from "./supabase";
import { Shift } from "./types";

/**
 * Legacy pre-isolation shifts with no owner. Fetched via a SECURITY DEFINER
 * RPC (not a standing RLS SELECT policy) so they're only ever exposed to the
 * one-time claim flow that calls this function — not to every authenticated
 * user's regular shift queries.
 */
export async function fetchUnclaimedShifts(): Promise<{ shifts: Shift[]; error: string | null }> {
  const { data, error } = await supabase.rpc("get_unclaimed_shifts");

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
