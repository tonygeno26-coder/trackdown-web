import { supabase } from "./supabase";

/**
 * Manual entitlement overrides only (currently just "grandfathered") — paid
 * subscription status is checked separately via RevenueCat. A user with no
 * row here is simply not grandfathered, not an error.
 */
export async function isGrandfathered(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("entitlements")
    .select("grandfathered")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return false;
  return data.grandfathered;
}
