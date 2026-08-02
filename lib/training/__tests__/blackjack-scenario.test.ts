import { describe, it, expect } from "vitest";
import { generateSituation, validateBlackjackScenario } from "@/lib/training/blackjack-hands";
import { BLACKJACK_PRESETS } from "@/lib/training/blackjack";
import { gradeStrategy } from "@/lib/training/blackjack-strategy";

const rules = BLACKJACK_PRESETS[0].rules;
const modes = ["random", "hard", "soft", "pairs", "speed"] as const;

describe("blackjack scenario consistency", () => {
  it("generates 150 internally consistent scenarios across modes", () => {
    for (const mode of modes) {
      for (let i = 0; i < 30; i++) {
        const situation = generateSituation(mode, rules);
        validateBlackjackScenario(situation, rules);
        const grade = gradeStrategy(situation, rules, "hit");
        const handDesc =
          situation.playerHand.category === "pair"
            ? `Pair of ${situation.playerHand.pairRank}s`
            : situation.playerHand.soft
              ? `Soft ${situation.playerHand.total}`
              : `Hard ${situation.playerHand.total}`;
        expect(grade.explanation).toContain(handDesc);
      }
    }
  });
});
