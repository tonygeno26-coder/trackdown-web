import { supabase } from "./supabase";

/** Whether this user has already completed (or explicitly skipped) the one-time claim flow. */
export async function hasCompletedClaim(userId: string): Promise<{ completed: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("claim_completed_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) return { completed: false, error: error.message };
  // No profile row yet (trigger hasn't caught up) — treat as not completed.
  return { completed: data?.claim_completed_at != null, error: null };
}

export async function markClaimCompleted(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, claim_completed_at: new Date().toISOString() }, { onConflict: "id" });
  return { error: error?.message ?? null };
}
