import { describe, expect, it } from "vitest";
import { fmtStartedLabel } from "@/lib/blocks";
import { hoursPlayed, formatDuration } from "@/lib/playing";

describe("fmtStartedLabel", () => {
  it("shows only the time for a shift that started today", () => {
    const now = new Date();
    now.setHours(6, 0, 0, 0);
    expect(fmtStartedLabel(now.toISOString())).toBe(
      now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  });

  it("includes the date for a shift left running from a prior day", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(6, 0, 0, 0);
    const label = fmtStartedLabel(twoDaysAgo.toISOString());
    expect(label).toContain("·");
    expect(label).not.toBe(
      twoDaysAgo.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  });
});

describe("hoursPlayed / formatDuration (Duration stat)", () => {
  it("reports ~34 minutes for a shift started 34 minutes ago, same day", () => {
    const start = new Date();
    start.setHours(6, 0, 0, 0);
    const now = new Date(start.getTime() + 34 * 60000);

    const hours = hoursPlayed(start.toISOString(), null, now);
    expect(formatDuration(hours)).toBe("34m");
  });

  it("correctly reports 36h35m for a shift genuinely running that long — not a bug, real elapsed time", () => {
    const start = new Date("2026-09-12T06:00:00.000Z");
    const now = new Date(start.getTime() + (36 * 60 + 35) * 60000);

    const hours = hoursPlayed(start.toISOString(), null, now);
    expect(formatDuration(hours)).toBe("36h 35m");
  });
});
