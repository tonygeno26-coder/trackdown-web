"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  clearCachedUserId,
  ensureAuthSession,
  signOutUser,
  type AuthDiagnosticCode,
} from "@/lib/auth";
import { hasCompletedClaim, markClaimCompleted } from "@/lib/profile";
import { registerAuthLinkHandling } from "@/lib/native-auth-link";
import { clearUserLocalState } from "@/lib/user-storage";

interface AuthContextValue {
  userId: string | null;
  ready: boolean;
  authError: string | null;
  authDiagnosticCode: AuthDiagnosticCode | null;
  /** True until the user has linked an email via the magic-link flow. */
  isAnonymous: boolean;
  /** The linked email, once one exists. Null for anonymous sessions. */
  email: string | null;
  /** Whether the one-time claim-your-past-shifts flow is done. Null while still loading. */
  claimCompleted: boolean | null;
  completeClaim: () => Promise<void>;
  retryAuth: () => Promise<void>;
  /**
   * Re-reads the current Supabase client session and syncs React state to
   * it — no sign-out, no anonymous fallback. For flows that change the
   * session directly (e.g. supabase.auth.signInWithPassword) without going
   * through the normal magic-link path: onAuthStateChange does not
   * reliably fire for that transition, so callers need to trigger the
   * re-sync themselves. Unlike retryAuth(), this never clears the session.
   */
  refreshSession: () => Promise<void>;
  /**
   * Ends the session (local + server) and lands back on the login screen —
   * does NOT create a new anonymous session afterward (that's retryAuth's
   * job, for the separate "fresh test session" case). Never touches server
   * data: only clears the local auth token and this device's local
   * prefs/progress, the same reset that already happens whenever the
   * signed-in user changes on this device.
   */
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ERROR_MESSAGE =
  "Could not establish a secure session. Check your connection and retry.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authDiagnosticCode, setAuthDiagnosticCode] = useState<AuthDiagnosticCode | null>(null);
  const [claimCompleted, setClaimCompleted] = useState<boolean | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const initStartedRef = useRef(false);

  const applySession = useCallback((session: Session | null) => {
    const nextUserId = session?.user?.id ?? null;
    const nextIsAnonymous = session?.user?.is_anonymous ?? true;
    if (lastUserIdRef.current && nextUserId && lastUserIdRef.current !== nextUserId) {
      clearUserLocalState();
    }
    lastUserIdRef.current = nextUserId;
    setUserId(nextUserId);
    setIsAnonymous(nextIsAnonymous);
    setEmail(session?.user?.email ?? null);
  }, []);

  const initAuth = useCallback(async (forceClear = false) => {
    setReady(false);
    setAuthError(null);
    setAuthDiagnosticCode(null);

    const { userId: id, diagnosticCode } = await ensureAuthSession(forceClear);
    if (!id) {
      clearCachedUserId();
      applySession(null);
      setAuthDiagnosticCode(diagnosticCode);
      setAuthError(AUTH_ERROR_MESSAGE);
      setReady(true);
      return;
    }

    const { data } = await supabase.auth.getSession();
    applySession(data.session);
    setReady(true);
  }, [applySession]);

  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    initAuth();

    const unregisterAuthLink = registerAuthLinkHandling();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      subscription.unsubscribe();
      unregisterAuthLink();
    };
  }, [applySession, initAuth]);

  // Once a real (non-anonymous) identity is active, load whether they've
  // already been through the one-time claim flow.
  useEffect(() => {
    if (!userId || isAnonymous) {
      setClaimCompleted(null);
      return;
    }
    let cancelled = false;
    hasCompletedClaim(userId).then(({ completed }) => {
      if (!cancelled) setClaimCompleted(completed);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, isAnonymous]);

  const completeClaim = useCallback(async () => {
    if (!userId) return;
    await markClaimCompleted(userId);
    setClaimCompleted(true);
  }, [userId]);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    applySession(data.session);
  }, [applySession]);

  const signOut = useCallback(async () => {
    const { error } = await signOutUser();
    // Reset this device's local prefs/progress the same way an auth-user
    // change already does — a different person signing in next shouldn't
    // see the previous account's cached training progress.
    clearUserLocalState();
    // signOutUser() clears the session locally and on the server, but
    // (like signInWithPassword) that doesn't reliably fire
    // onAuthStateChange in this client, so re-sync state explicitly rather
    // than wait for a listener that may not run.
    await refreshSession();
    return { error };
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      userId,
      ready,
      authError,
      authDiagnosticCode,
      isAnonymous,
      email,
      claimCompleted,
      completeClaim,
      retryAuth: () => initAuth(true),
      refreshSession,
      signOut,
    }),
    [
      userId,
      ready,
      authError,
      authDiagnosticCode,
      isAnonymous,
      email,
      claimCompleted,
      completeClaim,
      initAuth,
      refreshSession,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
