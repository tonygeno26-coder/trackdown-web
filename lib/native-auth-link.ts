import { completeAuthFromUrl } from "./auth";

const LAST_ERROR_KEY = "trackdown_last_auth_link_error";

/** PKCE codes are single-use — avoid exchanging the same one twice if two sources both deliver it. */
const processedCodes = new Set<string>();

function extractCode(url: string): string | null {
  try {
    return new URL(url).searchParams.get("code");
  } catch {
    return null;
  }
}

export const AUTH_LINK_ERROR_EVENT = "trackdown:auth-link-error";

function recordOutcome(source: string, error: string | null): void {
  if (!error) return;
  console.error(`[auth-link:${source}] failed:`, error);
  const record: AuthLinkError = { source, error, at: new Date().toISOString() };
  try {
    localStorage.setItem(LAST_ERROR_KEY, JSON.stringify(record));
  } catch {
    // localStorage unavailable — best effort only.
  }
  // A failure here almost always happens after LoginScreen has already
  // mounted (e.g. cold-launch getLaunchUrl resolves asynchronously) — a
  // mount-time-only localStorage read would miss it until the next reload.
  window.dispatchEvent(new CustomEvent<AuthLinkError>(AUTH_LINK_ERROR_EVENT, { detail: record }));
}

async function handleIncomingUrl(url: string, source: string): Promise<void> {
  const code = extractCode(url);
  if (!code || processedCodes.has(code)) return;
  processedCodes.add(code);
  const { error } = await completeAuthFromUrl(url);
  recordOutcome(source, error);
}

/**
 * Wires up magic-link completion for both the plain web build and the
 * Capacitor-wrapped native app. detectSessionInUrl is deliberately off (see
 * lib/supabase.ts — it's unsafe in the Capacitor WebView), so every path
 * below completes the session manually via completeAuthFromUrl.
 *
 * Two native sources are checked, not one:
 * - getLaunchUrl(): the app was COLD-launched by the deep link tap. By the
 *   time this JS has loaded (after two chained dynamic imports) and reached
 *   this point, appUrlOpen may already have fired natively and been missed —
 *   this is Capacitor's documented fallback for retrieving that URL.
 * - appUrlOpen listener: the app was already running (warm) and the deep
 *   link just brought it to the foreground — this fires reliably then.
 * Both can end up delivering the same URL for one cold launch on some
 * platforms, hence the processedCodes dedup (a PKCE code is single-use;
 * a second exchange attempt fails and looks identical to this same bug).
 *
 * Any failure is also written to localStorage (LAST_ERROR_KEY) — read via
 * readLastAuthLinkError() — since there's no way to attach a remote console
 * to a tester's physical device after the fact.
 *
 * Returns a cleanup function; safe to call in an environment without
 * @capacitor/app present (e.g. a plain web/test build) — it just no-ops.
 */
export function registerAuthLinkHandling(): () => void {
  if (typeof window === "undefined") return () => {};

  handleIncomingUrl(window.location.href, "web-url").then(() => {
    if (window.location.search.includes("code=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  });

  let cancelled = false;
  let removeListener: (() => void) | undefined;

  import("@capacitor/core")
    .then(({ Capacitor }) => {
      if (cancelled || !Capacitor.isNativePlatform()) return null;
      return import("@capacitor/app");
    })
    .then((mod) => {
      if (!mod || cancelled) return;

      mod.App.getLaunchUrl().then((launch) => {
        if (!cancelled && launch?.url) {
          handleIncomingUrl(launch.url, "cold-launch");
        }
      });

      mod.App.addListener("appUrlOpen", ({ url }) => {
        handleIncomingUrl(url, "warm-resume");
      }).then((handle) => {
        if (cancelled) {
          handle.remove();
        } else {
          removeListener = () => handle.remove();
        }
      });
    })
    .catch(() => {
      // @capacitor/core/app not available in this build — nothing to wire up.
    });

  return () => {
    cancelled = true;
    removeListener?.();
  };
}

export interface AuthLinkError {
  source: string;
  error: string;
  at: string;
}

export function readLastAuthLinkError(): AuthLinkError | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_ERROR_KEY);
    return raw ? (JSON.parse(raw) as AuthLinkError) : null;
  } catch {
    return null;
  }
}

export function clearLastAuthLinkError(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LAST_ERROR_KEY);
  } catch {
    // ignore
  }
}
