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
import { supabase } from "@/lib/supabase";
import {
  clearCachedUserId,
  ensureAuthSession,
  type AuthDiagnosticCode,
} from "@/lib/auth";
import { clearUserLocalState } from "@/lib/user-storage";

interface AuthContextValue {
  userId: string | null;
  ready: boolean;
  authError: string | null;
  authDiagnosticCode: AuthDiagnosticCode | null;
  retryAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ERROR_MESSAGE =
  "Could not establish a secure session. Check your connection and retry.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authDiagnosticCode, setAuthDiagnosticCode] = useState<AuthDiagnosticCode | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const initStartedRef = useRef(false);

  const applyUserChange = useCallback((nextUserId: string | null) => {
    if (lastUserIdRef.current && nextUserId && lastUserIdRef.current !== nextUserId) {
      clearUserLocalState();
    }
    lastUserIdRef.current = nextUserId;
    setUserId(nextUserId);
  }, []);

  const initAuth = useCallback(async (forceClear = false) => {
    setReady(false);
    setAuthError(null);
    setAuthDiagnosticCode(null);

    const { userId: id, diagnosticCode } = await ensureAuthSession(forceClear);
    if (!id) {
      clearCachedUserId();
      applyUserChange(null);
      setAuthDiagnosticCode(diagnosticCode);
      setAuthError(AUTH_ERROR_MESSAGE);
      setReady(true);
      return;
    }

    applyUserChange(id);
    setReady(true);
  }, [applyUserChange]);

  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextId = session?.user?.id ?? null;
      applyUserChange(nextId);
    });

    return () => subscription.unsubscribe();
  }, [applyUserChange, initAuth]);

  const value = useMemo(
    () => ({
      userId,
      ready,
      authError,
      authDiagnosticCode,
      retryAuth: () => initAuth(true),
    }),
    [userId, ready, authError, authDiagnosticCode, initAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
