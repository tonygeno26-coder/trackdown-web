import { describe, expect, it } from "vitest";
import { buildBlocks } from "@/lib/blocks";
import { computeWeeklyPay, formatWeekRange, weekStartKey } from "@/lib/pay";
import { Shift, WeeklyRate } from "@/lib/types";

function makeShift(overrides: Partial<Shift> = {}): Shift {
  const start = "2026-08-17T18:00:00.000Z";
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
    ended_at: "2026-08-18T02:00:00.000Z",
    settled_status: null,
    settled_amount: null,
    status: "completed",
    blocks: [],
    role: null,
    tax_model: null,
    tiered_threshold: 1000,
    tiered_rate_below: 25,
    tiered_rate_above: 50,
    turn_ins: [],
    created_at: start,
    is_demo: false,
    ...overrides,
  };
}

function makeRate(weekStart: string, downRate: number): WeeklyRate {
  return { id: `rate-${weekStart}`, week_start: weekStart, down_rate: downRate, created_at: weekStart };
}

describe("weekStartKey", () => {
  it("returns the same date for a Monday", () => {
    expect(weekStartKey("2026-08-17T12:00:00.000Z")).toBe("2026-08-17");
  });

  it("returns the preceding Monday for a Sunday", () => {
    expect(weekStartKey("2026-08-23T12:00:00.000Z")).toBe("2026-08-17");
  });

  it("returns the preceding Monday for a mid-week date", () => {
    expect(weekStartKey("2026-08-19T12:00:00.000Z")).toBe("2026-08-17");
  });
});

describe("formatWeekRange", () => {
  it("formats a Monday-Sunday range", () => {
    expect(formatWeekRange("2026-08-17")).toBe("Aug 17 – Aug 23, 2026");
  });
});

describe("computeWeeklyPay", () => {
  it("sums tournament downs and applies the posted rate", () => {
    const blocks = buildBlocks("2026-08-17T18:00:00.000Z", 30).map((b, i) =>
      i < 3 ? { ...b, status: "done" as const } : b
    );
    const shift = makeShift({ type: "tournament", blocks });
    const rates = [makeRate("2026-08-17", 20)];

    const weeks = computeWeeklyPay([shift], rates);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].weekStart).toBe("2026-08-17");
    expect(weeks[0].tournamentDowns).toBe(3);
    expect(weeks[0].downRate).toBe(20);
    expect(weeks[0].tournamentPay).toBe(60);
    expect(weeks[0].weekTotal).toBe(60);
  });

  it("shows tournament pay as null when no rate has been posted yet", () => {
    const blocks = buildBlocks("2026-08-17T18:00:00.000Z", 30).map((b, i) =>
      i < 2 ? { ...b, status: "done" as const } : b
    );
    const shift = makeShift({ type: "tournament", blocks });

    const [week] = computeWeeklyPay([shift], []);
    expect(week.tournamentDowns).toBe(2);
    expect(week.downRate).toBeNull();
    expect(week.tournamentPay).toBeNull();
    expect(week.weekTotal).toBe(0);
  });

  it("sums cash-shift gross tips with no tax applied", () => {
    const blocks = buildBlocks("2026-08-17T18:00:00.000Z", 30).map((b, i) =>
      i < 2 ? { ...b, status: "done" as const, tips: 50 } : b
    );
    const shift = makeShift({ type: "cash", blocks, house_tax_pct: 10 });

    const [week] = computeWeeklyPay([shift], []);
    expect(week.cashTotal).toBe(100);
  });

  it("nets homegame dealer shifts by the flat house tax", () => {
    const blocks = buildBlocks("2026-08-17T18:00:00.000Z", 30).map((b, i) =>
      i < 1 ? { ...b, status: "done" as const, tips: 200 } : b
    );
    const shift = makeShift({ type: "homegame", role: "dealer", house_tax_pct: 10, blocks });

    const [week] = computeWeeklyPay([shift], []);
    expect(week.homegameTotal).toBe(180);
  });

  it("nets hostess shifts by the tiered tax model", () => {
    const shift = makeShift({
      type: "homegame",
      role: "hostess",
      tax_model: "tiered",
      tiered_threshold: 1000,
      tiered_rate_below: 25,
      tiered_rate_above: 50,
      turn_ins: [{ id: "t1", amount: 1200, timestamp: "2026-08-17T20:00:00.000Z" }],
    });

    const [week] = computeWeeklyPay([shift], []);
    expect(week.homegameTotal).toBe(850);
    expect(week.weekTotal).toBe(850);
  });

  it("excludes demo shifts", () => {
    const shift = makeShift({ is_demo: true });
    expect(computeWeeklyPay([shift], [])).toHaveLength(0);
  });

  it("returns no weeks when there are no shifts", () => {
    expect(computeWeeklyPay([], [])).toHaveLength(0);
  });

  it("orders weeks most-recent-first", () => {
    const older = makeShift({ start_time: "2026-08-10T18:00:00.000Z" });
    const newer = makeShift({ start_time: "2026-08-17T18:00:00.000Z" });

    const weeks = computeWeeklyPay([older, newer], []);
    expect(weeks.map((w) => w.weekStart)).toEqual(["2026-08-17", "2026-08-10"]);
  });
});
