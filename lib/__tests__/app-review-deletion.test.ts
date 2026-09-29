import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import {
  USER_OWNED_TABLES,
  assertNoClientUserId,
  rejectDeletion,
  deletionTargetUserId,
  storagePrefixForUser,
} from "@/lib/server/account-deletion";
import {
  APP_REVIEW_EMAIL,
  isAppReviewEmail,
  shouldShowSubscriptionPaywallFromSettings,
} from "@/lib/app-review";

const root = path.join(__dirname, "../..");

function readSrc(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8");
}

describe("account deletion server contract", () => {
  it("lists all user-owned tables with auth.users cascade", () => {
    expect(USER_OWNED_TABLES).toEqual([
      "profiles",
      "entitlements",
      "shifts",
      "playing_sessions",
      "app_settings",
      "weekly_rates",
      "saved_hands",
    ]);
  });

  it("rejects missing and invalid sessions", () => {
    expect(rejectDeletion("missing_authorization").status).toBe(401);
    expect(rejectDeletion("invalid_session").status).toBe(401);
  });

  it("deletes only the verified JWT subject, not an arbitrary id", () => {
    const jwtUser = "11111111-1111-1111-1111-111111111111";
    expect(deletionTargetUserId(jwtUser)).toBe(jwtUser);
    expect(deletionTargetUserId(jwtUser)).not.toBe("22222222-2222-2222-2222-222222222222");
  });

  it("rejects client-supplied user ids", () => {
    expect(() => assertNoClientUserId({ userId: "evil" })).toThrow(/not allowed/u);
    expect(() => assertNoClientUserId({ user_id: "evil" })).toThrow(/not allowed/u);
    expect(() => assertNoClientUserId({ confirm: true })).not.toThrow();
  });

  it("uses per-user storage prefixes", () => {
    expect(storagePrefixForUser("abc-123")).toBe("abc-123/");
  });
});

describe("delete-account edge function", () => {
  const fn = readSrc("supabase/functions/delete-account/index.ts");

  it("derives user id from JWT via getUser, not request body", () => {
    expect(fn).toMatch(/auth\.getUser/u);
    expect(fn).not.toMatch(/req\.json\(\).*user_id/u);
    expect(fn).toMatch(/userId.*in record/);
    expect(fn).toMatch(/user_id.*in record/);
  });

  it("uses service role only on the server", () => {
    expect(fn).toMatch(/SUPABASE_SERVICE_ROLE_KEY/u);
    expect(fn).toMatch(/auth\.admin\.deleteUser/u);
    expect(fn).not.toMatch(/NEXT_PUBLIC_/u);
  });

  it("removes storage objects before deleting the auth user", () => {
    const storageIdx = fn.indexOf("removeUserStorageObjects");
    const deleteIdx = fn.indexOf("auth.admin.deleteUser");
    expect(storageIdx).toBeGreaterThan(-1);
    expect(deleteIdx).toBeGreaterThan(storageIdx);
  });

  it("allows authenticated anonymous users to delete their own account", () => {
    expect(fn).not.toMatch(/user\.is_anonymous/u);
    expect(fn).toMatch(/const userId = user\.id/u);
    expect(fn).toMatch(/auth\.admin\.deleteUser\(userId\)/u);
  });

  it("rejects unauthenticated requests", () => {
    expect(fn).toMatch(/Missing authorization/u);
    expect(fn).toMatch(/Invalid or expired session/u);
  });
});

describe("delete account client flow", () => {
  it("never sends a user id to the edge function", () => {
    const client = readSrc("lib/account-deletion.ts");
    expect(client).toMatch(/functions\/v1\/delete-account/u);
    expect(client).not.toMatch(/user_id/u);
    expect(client).not.toMatch(/userId/u);
    expect(client).toMatch(/session\.access_token/u);
  });

  it("shows warning, Apple subscription link, and second confirmation", () => {
    const ui = readSrc("components/settings/DeleteAccountFlow.tsx");
    expect(ui).toMatch(/permanently deletes/u);
    expect(ui).toMatch(/cancel an[\s\S]*Apple subscription/);
    expect(ui).toMatch(/MANAGE_APPLE_SUBSCRIPTIONS_URL/u);
    expect(ui).toMatch(/Final confirmation/u);
    expect(ui).toMatch(/disabled=\{deleting\}/u);
    expect(ui).toMatch(/role="status"/u);
    expect(ui).toMatch(/role="alert"/u);
  });

  it("does not treat deletion failure as success", () => {
    const ui = readSrc("components/settings/DeleteAccountFlow.tsx");
    expect(ui).toMatch(/if \(!result\.ok\)/u);
    expect(ui).toMatch(/await signOut\(\)/u);
    expect(ui).toMatch(/resetPurchasesClient/u);
  });

  it("shows delete account for anonymous guests on the sign-in screen", () => {
    const login = readSrc("components/auth/LoginScreen.tsx");
    expect(login).toMatch(/AccountSection/u);
    const account = readSrc("components/settings/AccountSection.tsx");
    expect(account).not.toMatch(/if \(isAnonymous\) return null/u);
    expect(account).toMatch(/DeleteAccountFlow isGuest=\{isAnonymous\}/u);
  });

  it("shows delete account for email-linked users in Settings", () => {
    const settings = readSrc("components/settings/SettingsScreen.tsx");
    expect(settings).toMatch(/AccountSection/u);
    const account = readSrc("components/settings/AccountSection.tsx");
    expect(account).toMatch(/Sign Out/u);
  });

  it("warns guest users that deleted data cannot be recovered", () => {
    const ui = readSrc("components/settings/DeleteAccountFlow.tsx");
    expect(ui).toMatch(/isGuest/u);
    expect(ui).toMatch(/cannot be recovered after deletion/u);
  });
});

describe("Trackdown Pro discoverability", () => {
  it("exposes Trackdown Pro from Settings", () => {
    const settings = readSrc("components/settings/SettingsScreen.tsx");
    expect(settings).toMatch(/TrackdownProSection/u);
    const pro = readSrc("components/settings/TrackdownProSection.tsx");
    expect(pro).toMatch(/Trackdown Pro/u);
  });

  it("shows paywall with monthly offer, trial, restore, terms, and privacy", () => {
    const paywall = readSrc("components/paywall/PaywallScreen.tsx");
    expect(paywall).toMatch(/Trackdown Pro Monthly/u);
    expect(paywall).toMatch(/7-day free trial/u);
    expect(paywall).toMatch(/Start Free Trial/u);
    expect(paywall).toMatch(/Restore Purchases/u);
    expect(paywall).toMatch(/TERMS_OF_USE_URL/u);
    expect(paywall).toMatch(/PRIVACY_POLICY_URL/u);
  });

  it("forces App Review account to see subscription UI from Settings", () => {
    expect(isAppReviewEmail(APP_REVIEW_EMAIL)).toBe(true);
    expect(shouldShowSubscriptionPaywallFromSettings(APP_REVIEW_EMAIL, true)).toBe(true);
    expect(shouldShowSubscriptionPaywallFromSettings("beta@test.com", true)).toBe(false);
    expect(shouldShowSubscriptionPaywallFromSettings("beta@test.com", false)).toBe(true);
  });

  it("keeps main-app grandfather bypass unchanged for beta testers", () => {
    const page = readSrc("app/page.tsx");
    expect(page).toMatch(/isGrandfathered\(userId\)/u);
    expect(page).not.toMatch(/isAppReviewEmail/u);
  });
});

describe("App Review grandfathering location", () => {
  it("documents production entitlements row (not client code) for appreview account", () => {
    const migration = readFileSync(
      path.join(root, "supabase/migrations/20260918000000_create_entitlements_table.sql"),
      "utf8"
    );
    expect(migration).toMatch(/App Review account/u);
    expect(migration).toMatch(/grandfathered/u);
  });
});
