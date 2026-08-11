import { supabase } from "./supabase";

let cachedUserId: string | null = null;

/** Ensures a Supabase auth session exists (anonymous sign-in). Returns user id or null. */
export async function ensureUserId(): Promise<string | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUserId = sessionData.session?.user?.id ?? null;

  if (sessionUserId) {
    cachedUserId = sessionUserId;
    return sessionUserId;
  }

  cachedUserId = null;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user?.id) return null;

  cachedUserId = data.user.id;
  return data.user.id;
}

export function getCachedUserId(): string | null {
  return cachedUserId;
}

export function clearCachedUserId(): void {
  cachedUserId = null;
}

/** Signs out the current session so a fresh anonymous user can be created. */
export async function signOutUser(): Promise<{ error: string | null }> {
  clearCachedUserId();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}
