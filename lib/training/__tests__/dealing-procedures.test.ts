import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadDealingProcedureProgress,
  saveDealingProcedureProgress,
  toggleProcedureReviewed,
  migrateDealingProcedureProgress,
  reviewedCountForGame,
  DEALING_PROCEDURE_PROGRESS_KEY,
} from "@/lib/training/dealing-procedure-progress";
import {
  procedureCount,
  DEALING_PROCEDURE_GAME_ORDER,
  DEALING_PROCEDURES,
} from "@/lib/training/dealing-procedures";

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
    const after = toggleProcedureReviewed("me-shuffle");
    expect(after.reviewedIds).toContain("me-shuffle");
    const again = toggleProcedureReviewed("me-shuffle");
    expect(again.reviewedIds).not.toContain("me-shuffle");
  });

  it("persists to versioned localStorage key", () => {
    toggleProcedureReviewed("me-shuffle");
    const raw = localStorage.getItem(DEALING_PROCEDURE_PROGRESS_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).version).toBe(1);
  });

  it("counts reviewed items per game", () => {
    toggleProcedureReviewed("me-shuffle");
    toggleProcedureReviewed("he-button");
    toggleProcedureReviewed("om-pot-limit");
    expect(reviewedCountForGame("mechanics")).toBe(1);
    expect(reviewedCountForGame("holdem")).toBe(1);
    expect(reviewedCountForGame("omaha")).toBe(1);
    expect(reviewedCountForGame("mixed")).toBe(0);
  });

  it("prunes stale ids on migrate", () => {
    saveDealingProcedureProgress({ version: 1, reviewedIds: ["me-shuffle", "removed-id"] });
    const migrated = migrateDealingProcedureProgress();
    expect(migrated.reviewedIds).toEqual(["me-shuffle"]);
  });

  it("remaps legacy game-specific ids to Dealer Mechanics on migrate", () => {
    saveDealingProcedureProgress({
      version: 1,
      reviewedIds: ["he-shuffle", "om-shuffle", "he-burn-flop", "he-exposed"],
    });
    const migrated = migrateDealingProcedureProgress();
    expect(migrated.reviewedIds).toEqual(["me-shuffle", "me-burn", "me-exposed"]);
  });

  it("lists mechanics first in display order", () => {
    expect(DEALING_PROCEDURE_GAME_ORDER[0]).toBe("mechanics");
    expect(DEALING_PROCEDURE_GAME_ORDER).toEqual(["mechanics", "holdem", "omaha", "mixed"]);
  });

  it("has checklist content for all four categories", () => {
    expect(procedureCount("mechanics")).toBeGreaterThan(5);
    expect(procedureCount("holdem")).toBeGreaterThan(3);
    expect(procedureCount("omaha")).toBeGreaterThan(5);
    expect(procedureCount("mixed")).toBeGreaterThan(5);
  });

  it("uses unique ids across all categories", () => {
    const ids = DEALING_PROCEDURE_GAME_ORDER.flatMap((game) =>
      DEALING_PROCEDURES[game].map((item) => item.id)
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});
