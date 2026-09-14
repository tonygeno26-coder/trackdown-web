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

/**
 * Custom URL scheme the native iOS/Android (Capacitor) builds register to
 * receive the magic-link callback — must match capacitor.config.ts's appId
 * and be added to the Supabase project's Auth > URL Configuration redirect
 * allow-list. See lib/native-auth-link.ts for the receiving side.
 */
export const AUTH_CALLBACK_URL = "com.desertspore.trackdown://auth-callback";

/**
 * Sends a magic-link email that upgrades the current anonymous session to a
 * permanent one, in place. This deliberately does NOT sign in fresh — that
 * would mint a new auth.uid() and orphan every shift already tied to this
 * device's existing anonymous identity. Linking the email onto the existing
 * session keeps auth.uid() unchanged, so all of it stays visible.
 */
export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  const { userId } = await ensureAuthSession();
  if (!userId) return { error: "Could not establish a session to link this email to." };

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: AUTH_CALLBACK_URL }
  );
  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Completes a magic-link callback (deep link on native, redirect URL on
 * web) by exchanging its PKCE `code` param for a session. detectSessionInUrl
 * is off, so nothing does this automatically — see lib/native-auth-link.ts
 * for where this gets called from.
 */
export async function completeAuthFromUrl(url: string): Promise<{ error: string | null }> {
  let code: string | null = null;
  try {
    code = new URL(url).searchParams.get("code");
  } catch {
    return { error: null };
  }
  if (!code) return { error: null };

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error: error?.message ?? null };
}

export type { AuthDiagnosticCode, AuthSessionResult };
