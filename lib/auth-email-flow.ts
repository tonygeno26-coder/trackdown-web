/**
 * User-facing outcomes for email send / magic-link completion — kept separate
 * from raw Supabase messages so we can classify errors without leaking account
 * details.
 */
export type AuthEmailSendKind =
  | "sent"
  | "rate_limited"
  | "send_failed"
  | "session_unavailable"
  | "account_not_found"
  | "network";

export type AuthEmailSendResult =
  | { ok: true; kind: "sent" }
  | { ok: false; kind: Exclude<AuthEmailSendKind, "sent">; message: string };

export type AuthLinkExchangeKind =
  | "success"
  | "expired_or_used"
  | "callback_failed"
  | "missing_code";

function normalizeMessage(message: string): string {
  return message.toLowerCase();
}

export function mapGuestLinkSendError(error: { message?: string; status?: number } | null): AuthEmailSendResult {
  if (!error?.message) {
    return {
      ok: false,
      kind: "send_failed",
      message: "We couldn't send that email. Check the address and try again.",
    };
  }
  const msg = normalizeMessage(error.message);
  if (msg.includes("rate") || msg.includes("too many") || error.status === 429) {
    return {
      ok: false,
      kind: "rate_limited",
      message: "Too many attempts. Wait a few minutes, then try again.",
    };
  }
  if (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("failed to fetch") ||
    error.status === 0
  ) {
    return {
      ok: false,
      kind: "network",
      message: "Network error while sending email. Check your connection and try again.",
    };
  }
  if (msg.includes("already") && (msg.includes("registered") || msg.includes("exists"))) {
    return {
      ok: false,
      kind: "send_failed",
      message:
        "That email already has a Trackdown account. Use “Already have an account? Sign in” instead of saving this guest.",
    };
  }
  return {
    ok: false,
    kind: "send_failed",
    message: "We couldn't send that email. Check the address and try again.",
  };
}

export function mapReturningSignInSendError(
  error: { message?: string; status?: number } | null
): AuthEmailSendResult {
  if (!error?.message) {
    return {
      ok: false,
      kind: "send_failed",
      message: "We couldn't send a sign-in link. Try again in a moment.",
    };
  }
  const msg = normalizeMessage(error.message);
  if (msg.includes("rate") || msg.includes("too many") || error.status === 429) {
    return {
      ok: false,
      kind: "rate_limited",
      message: "Too many attempts. Wait a few minutes, then try again.",
    };
  }
  if (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("failed to fetch") ||
    error.status === 0
  ) {
    return {
      ok: false,
      kind: "network",
      message: "Network error while sending email. Check your connection and try again.",
    };
  }
  if (
    msg.includes("signups not allowed") ||
    msg.includes("user not found") ||
    msg.includes("no user") ||
    msg.includes("not found") ||
    msg.includes("invalid login credentials")
  ) {
    return {
      ok: false,
      kind: "account_not_found",
      message:
        "No account exists for that email. Save this device’s guest data with a new email instead, or double-check the address.",
    };
  }
  return {
    ok: false,
    kind: "send_failed",
    message: "We couldn't send a sign-in link. Try again in a moment.",
  };
}

export function mapLinkExchangeError(message: string | undefined): string {
  if (!message) {
    return "The sign-in link could not be completed. Request a new link and try again.";
  }
  const msg = normalizeMessage(message);
  if (
    msg.includes("expired") ||
    msg.includes("invalid") ||
    msg.includes("already been used") ||
    msg.includes("code verifier") ||
    msg.includes("pkce")
  ) {
    return "This sign-in link has expired or was already used. Send yourself a fresh link and open it once.";
  }
  return "The sign-in link could not be completed. Request a new link and try again.";
}
