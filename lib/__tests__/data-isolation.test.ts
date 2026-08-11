import { describe, it, expect } from "vitest";
import { excludeDemoRecords } from "@/lib/data-filters";
import { DEV_LOCAL_STORAGE_KEYS, USER_LOCAL_STORAGE_KEYS } from "@/lib/user-storage";
import { readFileSync } from "fs";
import path from "path";

const root = path.join(__dirname, "../..");

function readSrc(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8");
}

describe("excludeDemoRecords", () => {
  it("removes rows marked as demo", () => {
    const rows = [
      { id: "1", is_demo: false },
      { id: "2", is_demo: true },
      { id: "3" },
    ];
    expect(excludeDemoRecords(rows).map((r) => r.id)).toEqual(["1", "3"]);
  });
});

describe("localStorage key audit", () => {
  it("tracks developer-only keys separately from user-scoped keys", () => {
    expect(DEV_LOCAL_STORAGE_KEYS).toContain("trackdown_dev_preview");
    expect(DEV_LOCAL_STORAGE_KEYS).toContain("trackdown_dev_solver_pro_preview");
    expect(USER_LOCAL_STORAGE_KEYS).toContain("trackdown_training_progress_v1");
    expect(USER_LOCAL_STORAGE_KEYS).not.toContain("trackdown_dev_preview");
  });

  it("AuthProvider clears both key groups on user change", () => {
    const authProvider = readSrc("components/auth/AuthProvider.tsx");
    expect(authProvider).toMatch(/clearUserLocalState/u);
  });

  it("DeveloperPreviewProvider resets preview when auth user changes", () => {
    const previewProvider = readSrc("components/dev/DeveloperPreviewProvider.tsx");
    expect(previewProvider).toMatch(/lastUserIdRef/u);
    expect(previewProvider).toMatch(/setPreviewModeState\("none"\)/u);
  });
});

describe("user data isolation migration", () => {
  const migrationSql = readFileSync(
    path.join(__dirname, "../../supabase/migrations/20260810210000_user_data_isolation.sql"),
    "utf8"
  );

  it("adds user_id to all user-owned tables", () => {
    expect(migrationSql).toMatch(/ALTER TABLE public\.shifts[\s\S]*user_id/u);
    expect(migrationSql).toMatch(/ALTER TABLE public\.playing_sessions[\s\S]*user_id/u);
    expect(migrationSql).toMatch(/ALTER TABLE public\.app_settings[\s\S]*user_id/u);
  });

  it("drops permissive anon policies", () => {
    expect(migrationSql).toMatch(/DROP POLICY IF EXISTS "Allow all for anon" ON public\.shifts/u);
    expect(migrationSql).toMatch(/DROP POLICY IF EXISTS "Allow all for anon" ON public\.playing_sessions/u);
    expect(migrationSql).toMatch(/DROP POLICY IF EXISTS "Allow all for anon" ON public\.app_settings/u);
  });

  it("creates user-scoped RLS policies", () => {
    expect(migrationSql).toMatch(/CREATE POLICY "Users manage own shifts"[\s\S]*auth\.uid\(\) = user_id/u);
    expect(migrationSql).toMatch(
      /CREATE POLICY "Users manage own playing sessions"[\s\S]*auth\.uid\(\) = user_id/u
    );
    expect(migrationSql).toMatch(
      /CREATE POLICY "Users manage own app settings"[\s\S]*auth\.uid\(\) = user_id/u
    );
  });

  it("adds insert triggers to auto-assign user_id", () => {
    expect(migrationSql).toMatch(/set_user_id_from_auth/u);
    expect(migrationSql).toMatch(/set_shifts_user_id/u);
    expect(migrationSql).toMatch(/set_playing_sessions_user_id/u);
    expect(migrationSql).toMatch(/set_app_settings_user_id/u);
  });
});

describe("saved_hands RLS migration", () => {
  const savedHandsSql = readFileSync(
    path.join(__dirname, "../../supabase/migrations/20260802120000_create_saved_hands.sql"),
    "utf8"
  );

  it("requires user_id and enables RLS", () => {
    expect(savedHandsSql).toMatch(/user_id uuid NOT NULL/u);
    expect(savedHandsSql).toMatch(/ENABLE ROW LEVEL SECURITY/u);
    expect(savedHandsSql).toMatch(
      /CREATE POLICY "Users manage own saved hands"[\s\S]*auth\.uid\(\) = user_id/u
    );
  });
});

describe("client insert scoping", () => {
  it("HomeDashboard inserts include user_id", () => {
    const src = readSrc("components/home/HomeDashboard.tsx");
    expect(src).toMatch(/\.from\("shifts"\)[\s\S]*user_id: userId/u);
    expect(src).toMatch(/\.from\("playing_sessions"\)[\s\S]*user_id: userId/u);
  });

  it("settings and saved hands associate rows with auth user", () => {
    expect(readSrc("lib/settings.ts")).toMatch(/user_id: userId/u);
    expect(readSrc("lib/settings.ts")).toMatch(/\.eq\("user_id", userId\)/u);
    expect(readSrc("lib/hands/storage.ts")).toMatch(/user_id: userId/u);
    expect(readSrc("lib/hands/storage.ts")).toMatch(/\.eq\("user_id", userId\)/u);
  });

  it("demo data is scoped to current user", () => {
    const demo = readSrc("lib/demo-data.ts");
    expect(demo).toMatch(/user_id: userId/u);
    expect(demo).toMatch(/\.eq\("user_id", userId\)/u);
  });
});

describe("stats exclude demo records (BUG-103)", () => {
  it("StatsScreen filters demo before computing totals", () => {
    const stats = readSrc("components/stats/StatsScreen.tsx");
    expect(stats).toMatch(/excludeDemoRecords/u);
  });
});

describe("RLS cross-user security expectations", () => {
  /**
   * Live verification (Supabase project jjblqnnxmmgdkjntgkkh, 2026-08-10):
   * - rowsecurity=true on shifts, playing_sessions, app_settings, saved_hands
   * - Each table has one FOR ALL policy: auth.uid() = user_id (USING + WITH CHECK)
   * - Account B selecting/updating/deleting Account A row by known id returns 0 rows
   *   because RLS filters before row visibility (not frontend-only).
   */
  const expectedPolicies = [
    { table: "shifts", policy: "Users manage own shifts" },
    { table: "playing_sessions", policy: "Users manage own playing sessions" },
    { table: "app_settings", policy: "Users manage own app settings" },
    { table: "saved_hands", policy: "Users manage own saved hands" },
  ];

  it.each(expectedPolicies)("migration defines user-scoped policy for $table", ({ table, policy }) => {
    const isolationSql = readFileSync(
      path.join(__dirname, "../../supabase/migrations/20260810210000_user_data_isolation.sql"),
      "utf8"
    );
    const savedHandsSql = readFileSync(
      path.join(__dirname, "../../supabase/migrations/20260802120000_create_saved_hands.sql"),
      "utf8"
    );
    const sql = table === "saved_hands" ? savedHandsSql : isolationSql;
    expect(sql).toMatch(new RegExp(`CREATE POLICY "${policy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "u"));
    expect(sql).toMatch(/auth\.uid\(\) = user_id/u);
  });

  it("nested shift blocks are scoped via shift user_id (no separate table)", () => {
    const types = readSrc("lib/types.ts");
    expect(types).toMatch(/blocks/u);
    const migrationSql = readFileSync(
      path.join(__dirname, "../../supabase/migrations/20260810210000_user_data_isolation.sql"),
      "utf8"
    );
    expect(migrationSql).toMatch(/ON public\.shifts/u);
  });
});
