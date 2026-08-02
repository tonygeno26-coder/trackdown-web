import { supabase } from "@/lib/supabase";
import { ensureHandUserId } from "./auth";
import { SavedHand, SavedHandFilters, SavedHandInput } from "./types";

export async function fetchSavedHands(): Promise<{ data: SavedHand[]; error: string | null }> {
  const userId = await ensureHandUserId();
  if (!userId) return { data: [], error: "Could not authenticate for saved hands." };

  const { data, error } = await supabase
    .from("saved_hands")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as SavedHand[], error: null };
}

export async function saveHand(
  input: SavedHandInput
): Promise<{ data: SavedHand | null; error: string | null }> {
  const userId = await ensureHandUserId();
  if (!userId) return { data: null, error: "Could not authenticate for saved hands." };

  const { data, error } = await supabase
    .from("saved_hands")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SavedHand, error: null };
}

export async function deleteSavedHand(id: string): Promise<{ error: string | null }> {
  const userId = await ensureHandUserId();
  if (!userId) return { error: "Could not authenticate for saved hands." };

  const { error } = await supabase.from("saved_hands").delete().eq("id", id).eq("user_id", userId);
  return { error: error?.message ?? null };
}

export function filterSavedHands(hands: SavedHand[], filters: SavedHandFilters): SavedHand[] {
  const q = filters.search.trim().toLowerCase();
  return hands.filter((h) => {
    if (q) {
      const haystack = [
        h.casino,
        h.game,
        h.stakes,
        h.hero_position,
        h.villain_position,
        h.hero_cards,
        h.board_cards,
        h.result,
        h.notes,
        ...h.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.casino && h.casino !== filters.casino) return false;
    if (filters.game && h.game !== filters.game) return false;
    if (filters.stakes && h.stakes !== filters.stakes) return false;
    if (filters.position && h.hero_position !== filters.position && h.villain_position !== filters.position)
      return false;
    if (filters.tag && !h.tags.includes(filters.tag)) return false;
    if (filters.dateFrom && h.played_at.slice(0, 10) < filters.dateFrom) return false;
    if (filters.dateTo && h.played_at.slice(0, 10) > filters.dateTo) return false;
    return true;
  });
}

export function uniqueFilterValues(hands: SavedHand[], key: keyof SavedHand): string[] {
  const set = new Set<string>();
  for (const h of hands) {
    const v = h[key];
    if (typeof v === "string" && v.trim()) set.add(v);
  }
  return [...set].sort();
}

export function uniqueTags(hands: SavedHand[]): string[] {
  const set = new Set<string>();
  for (const h of hands) {
    for (const t of h.tags) if (t.trim()) set.add(t);
  }
  return [...set].sort();
}
