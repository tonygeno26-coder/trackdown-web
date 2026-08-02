import { describe, it, expect } from "vitest";
import { shiftInDateRange, sessionInDateRange, parseAmount } from "@/lib/playing";
import { PlayingSession, Shift } from "@/lib/types";

const now = new Date("2026-08-15T12:00:00");

function session(start: string): PlayingSession {
  return {
    id: "s1",
    session_type: "cash",
    status: "completed",
    title: "poker",
    location: "",
    game: "",
    stakes: "",
    start_time: start,
    ended_at: start,
    initial_buy_in: 100,
    additional_buy_ins: 0,
    cash_out: 100,
    expenses: 0,
    notes: "",
    created_at: start,
  };
}

function shift(start: string): Shift {
  return {
    id: "sh1",
    type: "cash",
    title: "",
    down_length: 30,
    house_tax_pct: 0,
    is_lump_sum: false,
    lump_sum_tips: null,
    hourly_rate: null,
    start_time: start,
    ended_at: start,
    settled_status: null,
    settled_amount: null,
    status: "completed",
    blocks: [],
    created_at: start,
  };
}

describe("date range filters", () => {
  it("includes sessions and shifts in the same week", () => {
    const recent = "2026-08-12T10:00:00.000Z";
    expect(sessionInDateRange(session(recent), "week", now)).toBe(true);
    expect(shiftInDateRange(shift(recent), "week", now)).toBe(true);
  });

  it("excludes records older than a week", () => {
    const old = "2026-07-01T10:00:00.000Z";
    expect(sessionInDateRange(session(old), "week", now)).toBe(false);
    expect(shiftInDateRange(shift(old), "week", now)).toBe(false);
  });

  it("filters by calendar month", () => {
    const inMonth = "2026-08-01T10:00:00.000Z";
    const outMonth = "2026-07-31T10:00:00.000Z";
    expect(sessionInDateRange(session(inMonth), "month", now)).toBe(true);
    expect(sessionInDateRange(session(outMonth), "month", now)).toBe(false);
  });
});

describe("parseAmount", () => {
  it("coerces invalid values to zero", () => {
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount("nope")).toBe(0);
    expect(parseAmount(50)).toBe(50);
  });
});
