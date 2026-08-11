import { supabase, isSupabaseConfigured } from "./supabase";
import { clearSupabaseAuthStorage } from "./auth-storage";
import {
  classifyAuthError,
  type AuthDiagnosticCode,
  type AuthSessionResult,
} from "./auth-diagnostics";

let cachedUserId: string | null = null;
let authInitPromise: Promise<AuthSessionResult> | null = null;

async function clearLocalAuthState(): Promise<void> {
  clearCachedUserId();
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Best-effort local cleanup only.
  }
  clearSupabaseAuthStorage();
}

async function signInAnonymouslyOnce(): Promise<AuthSessionResult> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user?.id) {
    return { userId: null, diagnosticCode: classifyAuthError(error) };
  }
  cachedUserId = data.user.id;
  return { userId: data.user.id, diagnosticCode: null };
}

async function resolveAuthSession(forceClear = false): Promise<AuthSessionResult> {
  if (!isSupabaseConfigured()) {
    return { userId: null, diagnosticCode: "AUTH_ENV_MISSING" };
  }

  if (forceClear) {
    await clearLocalAuthState();
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      await clearLocalAuthState();
    } else if (sessionData.session?.user?.id) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData.user?.id) {
        cachedUserId = userData.user.id;
        return { userId: userData.user.id, diagnosticCode: null };
      }
      await clearLocalAuthState();
    }

    let result = await signInAnonymouslyOnce();
    if (result.userId) return result;

    await clearLocalAuthState();
    result = await signInAnonymouslyOnce();
    return result;
  } catch {
    return { userId: null, diagnosticCode: "AUTH_INIT_FAILED" };
  }
}

/** Ensures a Supabase auth session exists (anonymous sign-in). Returns user id or null. */
export async function ensureUserId(): Promise<string | null> {
  const result = await ensureAuthSession();
  return result.userId;
}

export async function ensureAuthSession(forceClear = false): Promise<AuthSessionResult> {
  if (forceClear) {
    authInitPromise = resolveAuthSession(true).finally(() => {
      authInitPromise = null;
    });
    return authInitPromise;
  }

  if (!authInitPromise) {
    authInitPromise = resolveAuthSession(false).finally(() => {
      authInitPromise = null;
    });
  }
  return authInitPromise;
}

export function getCachedUserId(): string | null {
  return cachedUserId;
}

export function clearCachedUserId(): void {
  cachedUserId = null;
}

/** Signs out the current session so a fresh anonymous user can be created. */
export async function signOutUser(): Promise<{ error: string | null }> {
  authInitPromise = null;
  await clearLocalAuthState();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export type { AuthDiagnosticCode, AuthSessionResult };
