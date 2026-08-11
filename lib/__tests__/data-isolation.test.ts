import { describe, it, expect } from "vitest";
import { excludeDemoRecords } from "@/lib/data-filters";
import { DEV_LOCAL_STORAGE_KEYS, USER_LOCAL_STORAGE_KEYS } from "@/lib/user-storage";
import { readFileSync } from "fs";
import path from "path";

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
});
