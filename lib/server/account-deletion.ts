/**
 * Server-side account deletion helpers (Edge Function + tests).
 * User ID must always come from a verified JWT — never from the request body.
 */

/** Postgres tables with a user_id (or id) FK to auth.users ON DELETE CASCADE. */
export const USER_OWNED_TABLES = [
  "profiles",
  "entitlements",
  "shifts",
  "playing_sessions",
  "app_settings",
  "weekly_rates",
  "saved_hands",
] as const;

export type AccountDeletionRejectReason = "missing_authorization" | "invalid_session";

export function rejectDeletion(reason: AccountDeletionRejectReason): {
  ok: false;
  status: number;
  message: string;
} {
  switch (reason) {
    case "missing_authorization":
      return { ok: false, status: 401, message: "Missing authorization." };
    case "invalid_session":
      return { ok: false, status: 401, message: "Invalid or expired session." };
  }
}

/** Deletion always targets the JWT subject — never a client-provided id. */
export function deletionTargetUserId(verifiedJwtUserId: string): string {
  return verifiedJwtUserId;
}

/** Reject any client attempt to pass a target user id. */
export function assertNoClientUserId(body: unknown): void {
  if (body == null || typeof body !== "object") return;
  const record = body as Record<string, unknown>;
  if ("userId" in record || "user_id" in record) {
    throw new Error("Client-supplied user id is not allowed.");
  }
}

export function storagePrefixForUser(userId: string): string {
  return `${userId}/`;
}
