import { describe, it, expect } from "vitest";
import { classifyAuthError } from "@/lib/auth-diagnostics";
import { readFileSync } from "fs";
import path from "path";

const root = path.join(__dirname, "../..");

function readSrc(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8");
}

describe("classifyAuthError", () => {
  it("maps network failures to AUTH_NETWORK_FAILED", () => {
    expect(classifyAuthError({ message: "Failed to fetch" })).toBe("AUTH_NETWORK_FAILED");
    expect(classifyAuthError({ message: "Network request failed", status: 0 })).toBe(
      "AUTH_NETWORK_FAILED"
    );
  });

  it("maps auth failures to AUTH_SESSION_FAILED", () => {
    expect(classifyAuthError({ message: "Anonymous sign-ins are disabled" })).toBe(
      "AUTH_SESSION_FAILED"
    );
    expect(classifyAuthError(null)).toBe("AUTH_SESSION_FAILED");
  });
});

describe("auth recovery implementation", () => {
  it("validates cached sessions with getUser before trusting getSession", () => {
    const auth = readSrc("lib/auth.ts");
    expect(auth).toMatch(/getUser/u);
    expect(auth).toMatch(/clearSupabaseAuthStorage/u);
    expect(auth).toMatch(/signInAnonymouslyOnce/u);
  });

  it("clears only Supabase auth keys, not Trackdown user data", () => {
    const storage = readSrc("lib/auth-storage.ts");
    expect(storage).toMatch(/sb-/u);
    expect(storage).toMatch(/auth-token/u);
    expect(storage).not.toMatch(/trackdown_/u);
  });

  it("AuthProvider clears stale auth on retry and exposes diagnostic codes", () => {
    const provider = readSrc("components/auth/AuthProvider.tsx");
    expect(provider).toMatch(/ensureAuthSession\(forceClear\)/u);
    expect(provider).toMatch(/authDiagnosticCode/u);
    expect(provider).toMatch(/initAuth\(true\)/u);
  });

  it("supabase client disables URL session detection for Capacitor WebView", () => {
    const supabase = readSrc("lib/supabase.ts");
    expect(supabase).toMatch(/detectSessionInUrl:\s*false/u);
    expect(supabase).toMatch(/isSupabaseConfigured/u);
  });

  it("ErrorState shows safe AUTH diagnostic codes in production beta builds", () => {
    const errorState = readSrc("components/ui/ErrorState.tsx");
    expect(errorState).toMatch(/diagnosticCode/u);
    expect(errorState).toMatch(/AUTH_/u);
  });
});
