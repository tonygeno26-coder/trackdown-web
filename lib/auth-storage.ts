/** Supabase auth token keys only — never touches Trackdown user prefs/progress. */
export function clearSupabaseAuthStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      localStorage.removeItem(key);
    }
  }
}
