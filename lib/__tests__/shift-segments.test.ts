import { describe, expect, it } from "vitest";
import { buildBlocks } from "@/lib/blocks";
import { computeDealingStats } from "@/lib/dealing-stats";
import {
  combinedShiftEarnings,
  resolveBlockSegment,
  segmentBreakdownLabel,
  segmentDownCounts,
  shiftTotalEarnings,
} from "@/lib/shift-segments";
import { DownBlock, Shift } from "@/lib/types";

function makeShift(overrides: Partial<Shift> = {}): Shift {
  const start = "2026-08-18T18:00:00.000Z";
  return {
    id: "shift-1",
    type: "tournament",
    title: "Test",
    down_length: 30,
    house_tax_pct: 0,
    is_lump_sum: false,
    lump_sum_tips: null,
    hourly_rate: 30,
    start_time: start,
    ended_at: "2026-08-19T02:00:00.000Z",
    settled_status: null,
    settled_amount: null,
    status: "completed",
    blocks: buildBlocks(start, 30),
    created_at: start,
    ...overrides,
  };
}

function markDone(block: DownBlock, extra: Partial<DownBlock> = {}): DownBlock {
  return { ...block, status: "done", ...extra };
}

describe("shift segments", () => {
  it("defaults legacy blocks to shift-level segment", () => {
    const shift = makeShift({ type: "cash" });
    const block = shift.blocks[0];
    expect(resolveBlockSegment(block, shift)).toBe("cash");
  });

  it("tags and resolves per-block segments on combined shifts", () => {
    const shift = makeShift({ type: "tournament_cash", active_segment: "cash" });
    const tournamentBlock = markDone(shift.blocks[0], { segment: "tournament", table: "T1" });
    const cashBlock = markDone(shift.blocks[1], { segment: "cash", game: "1/2", tips: 25 });
    expect(resolveBlockSegment(tournamentBlock, shift)).toBe("tournament");
    expect(resolveBlockSegment(cashBlock, shift)).toBe("cash");
    expect(segmentDownCounts({ ...shift, blocks: [tournamentBlock, cashBlock] })).toEqual({
      tournament: 1,
      cash: 1,
    });
    expect(segmentBreakdownLabel({ ...shift, blocks: [tournamentBlock, cashBlock] })).toBe(
      "Tournament: 1 downs / Cash: 1 downs"
    );
  });

  it("combines tournament hourly earnings with cash tips", () => {
    const shift = makeShift({ type: "tournament_cash", hourly_rate: 40 });
    const blocks = shift.blocks.map((b, i) => {
      if (i < 4) return markDone(b, { segment: "tournament", table: `T${i}` });
      if (i < 6) return markDone(b, { segment: "cash", game: "1/2", tips: 20 });
      return b;
    });
    const combined = combinedShiftEarnings({ ...shift, blocks });
    // 4 tournament downs @ 30 min = 2 hours * $40 = $80
    expect(combined.tournament).toBe(80);
    expect(combined.cash).toBe(40);
    expect(combined.total).toBe(120);
    expect(shiftTotalEarnings({ ...shift, blocks })).toBe(120);
  });

  it("does not retroactively change logged downs when active segment switches", () => {
    const shift = makeShift({ type: "tournament_cash", active_segment: "cash" });
    const logged = markDone(shift.blocks[0], { segment: "tournament", table: "T5" });
    expect(resolveBlockSegment(logged, { ...shift, active_segment: "cash" })).toBe("tournament");
  });

  it("includes combined shift earnings in dealing stats", () => {
    const shift = makeShift({
      type: "tournament_cash",
      hourly_rate: 30,
      blocks: makeShift().blocks.map((b, i) => {
        if (i < 2) return markDone(b, { segment: "tournament", table: "T1" });
        if (i < 4) return markDone(b, { segment: "cash", tips: 15 });
        return b;
      }),
    });
    const stats = computeDealingStats([shift]);
    // 2 tournament downs = 1 hour * $30 = $30 tournament; cash = $30
    expect(stats.tournamentEarnings).toBe(30);
    expect(stats.cashTips).toBe(30);
    expect(stats.totalEarnings).toBe(60);
  });

  it("preserves tournament-only shift earnings", () => {
    const shift = makeShift({
      type: "tournament",
      hourly_rate: 25,
      blocks: makeShift().blocks.slice(0, 4).map((b) => markDone(b, { table: "T1" })),
    });
    expect(shiftTotalEarnings(shift)).toBe(50);
    const stats = computeDealingStats([shift]);
    expect(stats.tournamentEarnings).toBe(50);
    expect(stats.cashTips).toBe(0);
  });

  it("preserves cash-only shift earnings", () => {
    const shift = makeShift({
      type: "cash",
      hourly_rate: null,
      blocks: makeShift().blocks.slice(0, 3).map((b) => markDone(b, { game: "1/2", tips: 10 })),
    });
    expect(shiftTotalEarnings(shift)).toBe(30);
    const stats = computeDealingStats([shift]);
    expect(stats.cashTips).toBe(30);
    expect(stats.tournamentEarnings).toBe(0);
  });
});
