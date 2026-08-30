import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadDealingProcedureProgress,
  saveDealingProcedureProgress,
  toggleProcedureReviewed,
  migrateDealingProcedureProgress,
  reviewedCountForGame,
  DEALING_PROCEDURE_PROGRESS_KEY,
} from "@/lib/training/dealing-procedure-progress";
import { procedureCount } from "@/lib/training/dealing-procedures";

describe("dealing procedure progress", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      },
    });
  });

  it("starts empty", () => {
    const p = loadDealingProcedureProgress();
    expect(p.version).toBe(1);
    expect(p.reviewedIds).toEqual([]);
  });

  it("toggles reviewed state", () => {
    const after = toggleProcedureReviewed("he-shuffle");
    expect(after.reviewedIds).toContain("he-shuffle");
    const again = toggleProcedureReviewed("he-shuffle");
    expect(again.reviewedIds).not.toContain("he-shuffle");
  });

  it("persists to versioned localStorage key", () => {
    toggleProcedureReviewed("he-shuffle");
    const raw = localStorage.getItem(DEALING_PROCEDURE_PROGRESS_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).version).toBe(1);
  });

  it("counts reviewed items per game", () => {
    toggleProcedureReviewed("he-shuffle");
    toggleProcedureReviewed("he-button");
    toggleProcedureReviewed("om-shuffle");
    expect(reviewedCountForGame("holdem")).toBe(2);
    expect(reviewedCountForGame("omaha")).toBe(1);
    expect(reviewedCountForGame("mixed")).toBe(0);
  });

  it("prunes stale ids on migrate", () => {
    saveDealingProcedureProgress({ version: 1, reviewedIds: ["he-shuffle", "removed-id"] });
    const migrated = migrateDealingProcedureProgress();
    expect(migrated.reviewedIds).toEqual(["he-shuffle"]);
  });

  it("has checklist content for all three games", () => {
    expect(procedureCount("holdem")).toBeGreaterThan(5);
    expect(procedureCount("omaha")).toBeGreaterThan(5);
    expect(procedureCount("mixed")).toBeGreaterThan(5);
  });
});
