import { supabase } from "./supabase";
import { ensureUserId } from "./auth";
import { ShiftType } from "./types";

export interface AppSettings {
  id: string;
  default_location: string;
  default_poker_game: string;
  default_poker_stakes: string;
  default_table_game: string;
  default_table_minimum: number | null;
  default_tournament_hourly_rate: number | null;
  default_tournament_down_length: 30 | 40 | null;
  default_dealer_shift_type: ShiftType | null;
  currency_code: string;
  developer_mode: boolean;
  created_at: string;
  updated_at: string;
}

export type AppSettingsUpdate = Partial<
  Omit<AppSettings, "id" | "created_at" | "updated_at">
>;

export function createDefaultSettingsRow(): Omit<AppSettings, "id" | "created_at" | "updated_at"> {
  return {
    default_location: "",
    default_poker_game: "",
    default_poker_stakes: "",
    default_table_game: "",
    default_table_minimum: null,
    default_tournament_hourly_rate: null,
    default_tournament_down_length: null,
    default_dealer_shift_type: null,
    currency_code: "USD",
    developer_mode: false,
  };
}

export function parseOptionalNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatSettingsCurrency(amount: number, currencyCode: string): string {
  const code = currencyCode || "USD";
  try {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function mapRow(row: Record<string, unknown>): AppSettings {
  return {
    id: String(row.id),
    default_location: String(row.default_location ?? ""),
    default_poker_game: String(row.default_poker_game ?? ""),
    default_poker_stakes: String(row.default_poker_stakes ?? ""),
    default_table_game: String(row.default_table_game ?? ""),
    default_table_minimum: parseOptionalNumber(row.default_table_minimum),
    default_tournament_hourly_rate: parseOptionalNumber(row.default_tournament_hourly_rate),
    default_tournament_down_length:
      row.default_tournament_down_length === 30 || row.default_tournament_down_length === 40
        ? row.default_tournament_down_length
        : null,
    default_dealer_shift_type:
      row.default_dealer_shift_type === "tournament" ||
      row.default_dealer_shift_type === "cash" ||
      row.default_dealer_shift_type === "homegame"
        ? row.default_dealer_shift_type
        : null,
    currency_code: String(row.currency_code ?? "USD"),
    developer_mode: Boolean(row.developer_mode),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function fetchSettings(): Promise<{ data: AppSettings | null; error: string | null }> {
  const userId = await ensureUserId();
  if (!userId) return { data: null, error: "Could not authenticate for settings." };

  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };
  return { data: mapRow(data as Record<string, unknown>), error: null };
}

export async function createDefaultSettings(): Promise<{
  data: AppSettings | null;
  error: string | null;
}> {
  const userId = await ensureUserId();
  if (!userId) return { data: null, error: "Could not authenticate for settings." };

  const { data, error } = await supabase
    .from("app_settings")
    .insert({ ...createDefaultSettingsRow(), user_id: userId })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data as Record<string, unknown>), error: null };
}

export async function fetchOrCreateSettings(): Promise<{
  data: AppSettings | null;
  error: string | null;
}> {
  const existing = await fetchSettings();
  if (existing.error) return existing;
  if (existing.data) return existing;
  return createDefaultSettings();
}

export async function updateSettings(
  id: string,
  updates: AppSettingsUpdate
): Promise<{ data: AppSettings | null; error: string | null }> {
  const userId = await ensureUserId();
  if (!userId) return { data: null, error: "Could not authenticate for settings." };

  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("app_settings")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data as Record<string, unknown>), error: null };
}

export function hourlyRateInputValue(rate: number | null | undefined): string {
  if (rate == null || !Number.isFinite(rate)) return "";
  return String(rate);
}

export function tableMinimumInputValue(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "";
  return String(value);
}
