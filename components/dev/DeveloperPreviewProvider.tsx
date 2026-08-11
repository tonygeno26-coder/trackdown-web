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
import { useAuth } from "@/components/auth/AuthProvider";

export type DeveloperPreviewMode = "none" | "empty" | "dealer" | "gaming";

const STORAGE_KEY = "trackdown_dev_preview";

interface DeveloperPreviewContextValue {
  previewMode: DeveloperPreviewMode;
  isPreviewActive: boolean;
  setPreviewMode: (mode: DeveloperPreviewMode) => void;
  clearPreview: () => void;
}

const DeveloperPreviewContext = createContext<DeveloperPreviewContextValue | null>(null);

function readStoredMode(): DeveloperPreviewMode {
  if (typeof window === "undefined") return "none";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "empty" || raw === "dealer" || raw === "gaming") return raw;
  return "none";
}

export function DeveloperPreviewProvider({ children }: { children: ReactNode }) {
  const { userId, ready } = useAuth();
  const [previewMode, setPreviewModeState] = useState<DeveloperPreviewMode>("none");
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (lastUserIdRef.current && userId && lastUserIdRef.current !== userId) {
      setPreviewModeState("none");
    } else if (lastUserIdRef.current === null) {
      setPreviewModeState(readStoredMode());
    }
    lastUserIdRef.current = userId;
  }, [ready, userId]);

  const setPreviewMode = useCallback((mode: DeveloperPreviewMode) => {
    setPreviewModeState(mode);
    if (typeof window !== "undefined") {
      if (mode === "none") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, mode);
    }
  }, []);

  const clearPreview = useCallback(() => setPreviewMode("none"), [setPreviewMode]);

  const value = useMemo(
    () => ({
      previewMode,
      isPreviewActive: previewMode !== "none",
      setPreviewMode,
      clearPreview,
    }),
    [previewMode, setPreviewMode, clearPreview]
  );

  return (
    <DeveloperPreviewContext.Provider value={value}>{children}</DeveloperPreviewContext.Provider>
  );
}

export function useDeveloperPreview() {
  const ctx = useContext(DeveloperPreviewContext);
  if (!ctx) throw new Error("useDeveloperPreview must be used within DeveloperPreviewProvider");
  return ctx;
}
