"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AppSettings,
  AppSettingsUpdate,
  fetchOrCreateSettings,
  updateSettings,
} from "@/lib/settings";
import { useAuth } from "@/components/auth/AuthProvider";

interface AppSettingsContextValue {
  settings: AppSettings | null;
  loading: boolean;
  saving: boolean;
  savedAt: number | null;
  error: string | null;
  lastFetchAt: number | null;
  lastSaveAt: number | null;
  lastSupabaseError: string | null;
  reload: () => Promise<void>;
  saveSettings: (updates: AppSettingsUpdate) => Promise<boolean>;
  setDeveloperMode: (enabled: boolean) => Promise<boolean>;
  recordSupabaseError: (message: string | null) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { userId, ready } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchAt, setLastFetchAt] = useState<number | null>(null);
  const [lastSaveAt, setLastSaveAt] = useState<number | null>(null);
  const [lastSupabaseError, setLastSupabaseError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await fetchOrCreateSettings();
    setLoading(false);
    setLastFetchAt(Date.now());
    if (err) {
      setError(err);
      setLastSupabaseError(err);
      return;
    }
    setSettings(data);
    setError(null);
  }, []);

  useEffect(() => {
    if (!ready || !userId) {
      setSettings(null);
      setLoading(!ready);
      return;
    }
    reload();
  }, [ready, userId, reload]);

  const saveSettings = useCallback(
    async (updates: AppSettingsUpdate) => {
      if (!settings || saving) return false;
      setSaving(true);
      setError(null);
      const { data, error: err } = await updateSettings(settings.id, updates);
      setSaving(false);
      if (err) {
        setError(err);
        setLastSupabaseError(err);
        return false;
      }
      setSettings(data);
      setSavedAt(Date.now());
      setLastSaveAt(Date.now());
      return true;
    },
    [settings, saving]
  );

  const setDeveloperMode = useCallback(
    async (enabled: boolean) => saveSettings({ developer_mode: enabled }),
    [saveSettings]
  );

  const recordSupabaseError = useCallback((message: string | null) => {
    setLastSupabaseError(message);
    if (message) setError(message);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      saving,
      savedAt,
      error,
      lastFetchAt,
      lastSaveAt,
      lastSupabaseError,
      reload,
      saveSettings,
      setDeveloperMode,
      recordSupabaseError,
    }),
    [
      settings,
      loading,
      saving,
      savedAt,
      error,
      lastFetchAt,
      lastSaveAt,
      lastSupabaseError,
      reload,
      saveSettings,
      setDeveloperMode,
      recordSupabaseError,
    ]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}
