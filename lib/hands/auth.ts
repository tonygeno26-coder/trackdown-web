import { supabase } from "@/lib/supabase";

/** Ensures an auth user exists (anonymous sign-in) for saved_hands RLS. */
export async function ensureHandUserId(): Promise<string | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user?.id) return sessionData.session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user?.id) return null;
  return data.user.id;
}
