/** Developer-only keys — must never affect production/TestFlight users after auth change. */
export const DEV_LOCAL_STORAGE_KEYS = [
  "trackdown_dev_preview",
  "trackdown_dev_solver_pro_preview",
] as const;

/** User-scoped prefs/progress — cleared when auth user changes on the same device. */
export const USER_LOCAL_STORAGE_KEYS = [
  "trackdown_training_progress_v1",
  "trackdown_adaptive_training_v1",
  "trackdown_blackjack_rules_v1",
  "trackdown_last_tournament_hourly_rate",
] as const;

export function clearKeys(keys: readonly string[]): void {
  if (typeof window === "undefined") return;
  for (const key of keys) localStorage.removeItem(key);
}

/** Clears developer and user-local state when the authenticated user changes. */
export function clearUserLocalState(): void {
  clearKeys(DEV_LOCAL_STORAGE_KEYS);
  clearKeys(USER_LOCAL_STORAGE_KEYS);
}
