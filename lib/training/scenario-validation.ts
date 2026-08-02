import { parseCardList, cardKey } from "@/lib/cards";
import { PokerScenario } from "@/lib/training/types";

export function validateScenarioCards(scenario: PokerScenario): string[] {
  const warnings: string[] = [];
  const hero = parseCardList(scenario.heroCards);
  const board = parseCardList(scenario.board);
  const all = [...hero, ...board];

  const seen = new Set<string>();
  for (const card of all) {
    const key = cardKey(card);
    if (seen.has(key)) {
      warnings.push(
        `Scenario ${scenario.id}: duplicate card ${card.notation} in hero hand or board`
      );
    }
    seen.add(key);
  }

  if (hero.length === 0) {
    warnings.push(`Scenario ${scenario.id}: no valid hero cards parsed from "${scenario.heroCards}"`);
  }

  const isPlo = scenario.gameType.toLowerCase().includes("plo") || scenario.tags.includes("plo");
  if (isPlo && hero.length > 0 && hero.length !== 4) {
    warnings.push(`Scenario ${scenario.id}: PLO scenario expected 4 hole cards, got ${hero.length}`);
  }
  if (!isPlo && hero.length > 0 && hero.length !== 2) {
    warnings.push(`Scenario ${scenario.id}: hold'em scenario expected 2 hole cards, got ${hero.length}`);
  }

  return warnings;
}

export function logScenarioValidationWarnings(scenario: PokerScenario): void {
  const warnings = validateScenarioCards(scenario);
  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    for (const w of warnings) console.warn(`[Trackdown training] ${w}`);
  }
}

export function getStreetFromBoard(boardCount: number): "preflop" | "flop" | "turn" | "river" {
  if (boardCount === 0) return "preflop";
  if (boardCount === 3) return "flop";
  if (boardCount === 4) return "turn";
  if (boardCount >= 5) return "river";
  return "flop";
}
