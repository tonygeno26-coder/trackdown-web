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
import { clearCachedUserId, ensureUserId } from "@/lib/auth";
import { clearUserLocalState } from "@/lib/user-storage";

interface AuthContextValue {
  userId: string | null;
  ready: boolean;
  authError: string | null;
  retryAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  const applyUserChange = useCallback((nextUserId: string | null) => {
    if (lastUserIdRef.current && nextUserId && lastUserIdRef.current !== nextUserId) {
      clearUserLocalState();
    }
    lastUserIdRef.current = nextUserId;
    setUserId(nextUserId);
  }, []);

  const initAuth = useCallback(async () => {
    setReady(false);
    setAuthError(null);
    const id = await ensureUserId();
    if (!id) {
      clearCachedUserId();
      applyUserChange(null);
      setAuthError("Could not establish a secure session. Check your connection and retry.");
      setReady(true);
      return;
    }
    applyUserChange(id);
    setReady(true);
  }, [applyUserChange]);

  useEffect(() => {
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
      retryAuth: initAuth,
    }),
    [userId, ready, authError, initAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
