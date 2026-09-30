import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import {
  mapGuestLinkSendError,
  mapReturningSignInSendError,
  mapLinkExchangeError,
} from "@/lib/auth-email-flow";
import {
  resetProcessedAuthCodesForTests,
  handleAuthLinkUrl,
} from "@/lib/native-auth-link";

const root = path.join(__dirname, "../..");

function readSrc(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8");
}

vi.mock("@/lib/auth", () => ({
  completeAuthFromUrl: vi.fn(),
  AUTH_CALLBACK_URL: "com.desertspore.trackdown://auth-callback",
}));

import { completeAuthFromUrl } from "@/lib/auth";

const mockedComplete = vi.mocked(completeAuthFromUrl);

describe("auth email error mapping", () => {
  it("maps rate limits for guest and returning flows", () => {
    expect(mapGuestLinkSendError({ message: "Too many requests", status: 429 }).kind).toBe("rate_limited");
    expect(mapReturningSignInSendError({ message: "Email rate limit exceeded" }).kind).toBe("rate_limited");
  });

  it("maps nonexistent returning accounts without leaking internals", () => {
    const result = mapReturningSignInSendError({ message: "Signups not allowed for otp" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("account_not_found");
      expect(result.message).not.toMatch(/signups not allowed/i);
    }
  });

  it("maps expired PKCE codes for link completion", () => {
    expect(mapLinkExchangeError("Code expired")).toMatch(/expired/i);
  });

  it("guest already-registered hint steers to returning sign-in", () => {
    const result = mapGuestLinkSendError({ message: "User already registered" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/Already have an account/i);
    }
  });
});

describe("auth email send implementation", () => {
  it("guest linking uses updateUser with AUTH_CALLBACK_URL", () => {
    const auth = readSrc("lib/auth.ts");
    expect(auth).toMatch(/sendGuestEmailLink/u);
    expect(auth).toMatch(/updateUser\s*\(\s*\{\s*email/u);
    expect(auth).toMatch(/emailRedirectTo:\s*AUTH_CALLBACK_URL/u);
  });

  it("returning sign-in uses signInWithOtp with shouldCreateUser false", () => {
    const auth = readSrc("lib/auth.ts");
    expect(auth).toMatch(/sendReturningUserSignIn/u);
    expect(auth).toMatch(/signInWithOtp/u);
    expect(auth).toMatch(/shouldCreateUser:\s*false/u);
  });

  it("guest flow does not call signInWithOtp", () => {
    const guestBlock = readSrc("lib/auth.ts").split("sendGuestEmailLink")[1]?.split("sendReturningUserSignIn")[0];
    expect(guestBlock).toBeDefined();
    expect(guestBlock).not.toMatch(/signInWithOtp/u);
  });

  it("returning flow does not call updateUser", () => {
    const returningBlock = readSrc("lib/auth.ts").split("sendReturningUserSignIn")[1]?.split("sendMagicLink")[0];
    expect(returningBlock).toBeDefined();
    expect(returningBlock).not.toMatch(/updateUser/u);
  });

  it("App Review account still uses signInWithPassword", () => {
    const auth = readSrc("lib/auth.ts");
    expect(auth).toMatch(/tryAppReviewPasswordSignIn/u);
    expect(auth).toMatch(/signInWithPassword/u);
    expect(auth).toMatch(/APP_REVIEW_EMAIL/u);
  });

  it("completeAuthFromUrl refreshes session after exchange", () => {
    const auth = readSrc("lib/auth.ts");
    expect(auth).toMatch(/exchangeCodeForSession/u);
    expect(auth).toMatch(/refreshSession/u);
  });

  it("LoginScreen separates guest save vs returning sign-in", () => {
    const login = readSrc("components/auth/LoginScreen.tsx");
    expect(login).toMatch(/sendGuestEmailLink/u);
    expect(login).toMatch(/sendReturningUserSignIn/u);
    expect(login).toMatch(/Save guest account with email/u);
    expect(login).toMatch(/Already have an account\? Sign in/u);
    expect(login).toMatch(/if \("ok" in result && !result\.ok\)/u);
    expect(login).toMatch(/if \("ok" in result && result\.ok\)/u);
  });
});

describe("native auth link PKCE handling", () => {
  beforeEach(() => {
    resetProcessedAuthCodesForTests();
    mockedComplete.mockReset();
  });

  it("records success only after exchange succeeds and dedupes repeats", async () => {
    mockedComplete.mockResolvedValueOnce({ error: null });
    const url = "com.desertspore.trackdown://auth-callback?code=abc123";
    expect(await handleAuthLinkUrl(url, "cold-launch")).toBe("success");
    expect(await handleAuthLinkUrl(url, "warm-resume")).toBe("skipped");
    expect(mockedComplete).toHaveBeenCalledTimes(1);
  });

  it("allows retry after a failed exchange", async () => {
    mockedComplete.mockResolvedValueOnce({ error: "expired" });
    const url = "com.desertspore.trackdown://auth-callback?code=retry-me";
    expect(await handleAuthLinkUrl(url, "cold-launch")).toBe("error");
    mockedComplete.mockResolvedValueOnce({ error: null });
    expect(await handleAuthLinkUrl(url, "cold-launch")).toBe("success");
    expect(mockedComplete).toHaveBeenCalledTimes(2);
  });

  it("registers cold-start and warm-resume native handlers", () => {
    const link = readSrc("lib/native-auth-link.ts");
    expect(link).toMatch(/getLaunchUrl/u);
    expect(link).toMatch(/appUrlOpen/u);
    expect(link).toMatch(/cold-launch/u);
    expect(link).toMatch(/warm-resume/u);
  });
});
