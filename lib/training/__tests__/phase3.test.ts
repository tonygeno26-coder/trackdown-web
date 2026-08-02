import { describe, it, expect } from "vitest";
import { calculateSidePots, countSidePots, distributeOddChips, quarterPot, splitPotEvenly, layersMatchExpected } from "@/lib/training/side-pot";
import { compareHands, evaluateHoldem, evaluatePlo, evaluateOmahaLow, findWinningHandIds } from "@/lib/training/hand-evaluator";
import { pickAdaptiveDealerModule, buildTodaysFocus } from "@/lib/training/adaptive-dealer";
import { createDefaultDealerSkillProgress, migrateDealerV2ToV3 } from "@/lib/training/dealer-progress";
import { createDefaultProgress, loadTrainingProgress } from "@/lib/training/progress";
import { SIDE_POT_QUESTIONS } from "@/lib/training/side-pot-questions";
import { validateTrainingContent } from "@/lib/training/content-validation";

describe("side pot calculations", () => {
  it("calculates two-way all-in with side pot", () => {
    const result = calculateSidePots([
      { id: "a", name: "A", stack: 0, committed: 100 },
      { id: "b", name: "B", stack: 0, committed: 50 },
      { id: "c", name: "C", stack: 100, committed: 100 },
    ]);
    expect(result.layers.length).toBe(2);
    expect(result.totalPot).toBe(250);
    expect(result.layers[0].amount).toBe(150);
    expect(result.layers[1].amount).toBe(100);
  });

  it("excludes folded players from eligibility", () => {
    const result = calculateSidePots([
      { id: "a", name: "A", stack: 0, committed: 50 },
      { id: "b", name: "B", stack: 50, committed: 100, folded: true },
    ]);
    expect(result.layers[0].eligibleIds).toEqual(["a"]);
  });

  it("counts side pots correctly", () => {
    expect(countSidePots([
      { id: "a", name: "A", stack: 0, committed: 30 },
      { id: "b", name: "B", stack: 0, committed: 60 },
      { id: "c", name: "C", stack: 0, committed: 90 },
    ])).toBe(2);
  });

  it("validates all side pot questions match calculator", () => {
    for (const q of SIDE_POT_QUESTIONS) {
      const calc = calculateSidePots(q.players);
      expect(layersMatchExpected(calc.layers, q.expectedLayers)).toBe(true);
      expect(calc.totalPot).toBe(q.totalPot);
    }
  });
});

describe("hand evaluator", () => {
  it("evaluates holdem pair vs high card", () => {
    const pair = evaluateHoldem("Ac Ad", "2h 3d 4c 5s 9h");
    const high = evaluateHoldem("Kc Qd", "2h 3d 4c 5s 9h");
    expect(compareHands(pair, high)).toBeGreaterThan(0);
  });

  it("evaluates PLO with 2+3 rule", () => {
    const hand = evaluatePlo("Ah Kh Qd Jc", "Ts 9s 8d 7c 2h");
    expect(hand.rank).toBeGreaterThanOrEqual(4);
  });

  it("finds holdem winner on paired board", () => {
    const winners = findWinningHandIds(
      [
        { id: "h1", cards: "Ac Kc" },
        { id: "h2", cards: "Qh Qd" },
      ],
      "Ks Kd 7c 7h 2s",
      "holdem"
    );
    expect(winners).toContain("h1");
  });

  it("detects qualifying omaha low", () => {
    const low = evaluateOmahaLow("5c 6d Kc Qd", "Ah 2c 3d 4h 7s");
    expect(low.qualifies).toBe(true);
  });
});

describe("hi-lo payouts", () => {
  it("quarters pot correctly", () => {
    expect(quarterPot(100)).toBe(25);
    expect(quarterPot(103)).toBe(25);
  });

  it("splits pot with odd chip remainder", () => {
    const { each, remainder } = splitPotEvenly(101, 3);
    expect(each).toBe(33);
    expect(remainder).toBe(2);
  });

  it("distributes odd chips by seat order", () => {
    const payouts = distributeOddChips(101, 3, 1, [1, 2, 3, 4, 5]);
    const total = [...payouts.values()].reduce((s, v) => s + v, 0);
    expect(total).toBe(101);
  });
});

describe("adaptive dealer weighting", () => {
  it("returns a valid module key", () => {
    const dealer = createDefaultDealerSkillProgress();
    const mod = pickAdaptiveDealerModule(dealer);
    expect(mod).toBeTruthy();
  });

  it("builds todays focus with primary item", () => {
    const focus = buildTodaysFocus(createDefaultDealerSkillProgress());
    expect(focus.length).toBeGreaterThan(0);
    expect(focus[0].moduleLabel).toBeTruthy();
  });
});

describe("progress migration", () => {
  it("migrates v2 dealer with completedTipIds", () => {
    const migrated = migrateDealerV2ToV3({
      completedTipIds: ["tip-01", "tip-02"],
      potCalc: { attempted: 5, correct: 4, currentStreak: 1, bestStreak: 3 },
      ploCalc: { attempted: 0, correct: 0, currentStreak: 0, bestStreak: 0 },
    });
    expect(migrated.tips.completedIds).toEqual(["tip-01", "tip-02"]);
    expect(migrated.potCalc.attempted).toBe(5);
    expect(migrated.sidePot.attempted).toBe(0);
  });

  it("creates v3 default progress", () => {
    const p = createDefaultProgress();
    expect(p.version).toBe(3);
    expect(p.dealer.tips.completedIds).toEqual([]);
  });
});

describe("content validation", () => {
  it("passes all content checks", () => {
    const errors = validateTrainingContent();
    expect(errors).toEqual([]);
  });
});
