import { supabase, isSupabaseConfigured } from "./supabase";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; error: string; status?: number };

/**
 * Calls the privileged delete-account Edge Function using the caller's JWT.
 * Never sends a user id — the server derives it from the verified session.
 */
export async function deleteAccountViaEdgeFunction(): Promise<DeleteAccountResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Trackdown is not connected to the server." };
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    return { ok: false, error: "You must be signed in to delete your account." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return { ok: false, error: "Trackdown is not connected to the server." };
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/functions/v1/delete-account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confirm: true }),
    });
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }

  let payload: { error?: string; message?: string } | null = null;
  try {
    payload = (await response.json()) as { error?: string; message?: string };
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.error ?? payload?.message ?? "Account deletion failed. Please try again or contact support.";
    return { ok: false, error: message, status: response.status };
  }

  return { ok: true };
}
