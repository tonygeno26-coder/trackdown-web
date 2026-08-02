import {
  BlackjackAction,
  BlackjackCard,
  BlackjackHand,
  BlackjackRules,
  BlackjackSituation,
  CardRank,
  HandCategory,
  StrategyGrade,
  cardValue,
} from "./blackjack";

type Up = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

function up(card: BlackjackCard): Up {
  const v = cardValue(card.rank);
  return (v === 1 ? 11 : v) as Up;
}

function upLabel(u: Up): string {
  return u === 11 ? "Ace" : String(u);
}

/** Standard S17 basic strategy action codes: H,S,D,P,R */
type Code = "H" | "S" | "D" | "P" | "R";

const HARD_S17: Record<number, Record<Up, Code>> = {
  8: { 2: "H", 3: "H", 4: "H", 5: "H", 6: "H", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  9: { 2: "H", 3: "D", 4: "D", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  10: { 2: "D", 3: "D", 4: "D", 5: "D", 6: "D", 7: "D", 8: "D", 9: "D", 10: "H", 11: "H" },
  11: { 2: "D", 3: "D", 4: "D", 5: "D", 6: "D", 7: "D", 8: "D", 9: "D", 10: "D", 11: "H" },
  12: { 2: "H", 3: "H", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  13: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  14: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  15: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "R", 11: "H" },
  16: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "R", 10: "R", 11: "R" },
  17: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
};

const SOFT_S17: Record<number, Record<Up, Code>> = {
  13: { 2: "H", 3: "H", 4: "H", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  14: { 2: "H", 3: "H", 4: "H", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  15: { 2: "H", 3: "H", 4: "D", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  16: { 2: "H", 3: "H", 4: "D", 5: "D", 6: "D", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  17: { 2: "H", 3: "D", 4: "D", 5: "D", 6: "D", 7: "S", 8: "S", 9: "H", 10: "H", 11: "H" },
  18: { 2: "S", 3: "D", 4: "D", 5: "D", 6: "D", 7: "S", 8: "S", 9: "H", 10: "H", 11: "H" },
  19: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  20: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
};

const PAIRS_S17: Record<CardRank, Record<Up, Code>> = {
  A: { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P" },
  "2": { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 7: "P", 8: "H", 9: "H", 10: "H", 11: "H" },
  "3": { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 7: "P", 8: "H", 9: "H", 10: "H", 11: "H" },
  "4": { 2: "H", 3: "H", 4: "H", 5: "P", 6: "P", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  "5": { 2: "D", 3: "D", 4: "D", 5: "D", 6: "D", 7: "D", 8: "D", 9: "D", 10: "H", 11: "H" },
  "6": { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
  "7": { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 7: "P", 8: "H", 9: "H", 10: "H", 11: "H" },
  "8": { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 7: "P", 8: "P", 9: "P", 10: "P", 11: "P" },
  "9": { 2: "P", 3: "P", 4: "P", 5: "P", 6: "P", 7: "S", 8: "P", 9: "P", 10: "S", 11: "S" },
  "10": { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  J: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  Q: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
  K: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "S", 8: "S", 9: "S", 10: "S", 11: "S" },
};

function codeToAction(code: Code, canDouble: boolean, canSplit: boolean, canSurrender: boolean): BlackjackAction {
  if (code === "R" && canSurrender) return "surrender";
  if (code === "R") return "hit";
  if (code === "P" && canSplit) return "split";
  if (code === "P") return "hit";
  if (code === "D" && canDouble) return "double";
  if (code === "D") return "hit";
  if (code === "S") return "stand";
  return "hit";
}

function applyH17Adjustments(code: Code, hand: BlackjackHand, dealer: Up, rules: BlackjackRules): Code {
  if (rules.dealerSoft17 !== "hit") return code;
  // H17 strategy deviations
  if (hand.category === "hard" && hand.total === 11 && dealer === 11) return "H";
  if (hand.category === "soft" && hand.total === 18 && dealer === 2) return "D";
  if (hand.category === "soft" && hand.total === 18 && dealer === 11) return "H";
  if (hand.category === "hard" && hand.total === 17 && dealer === 11 && rules.surrender) return "R";
  return code;
}

function lookupCode(hand: BlackjackHand, dealer: Up, rules: BlackjackRules): Code {
  let code: Code;
  if (hand.category === "pair" && hand.pairRank) {
    if (hand.pairRank === "5") {
      code = HARD_S17[10]?.[dealer] ?? "H";
    } else {
      code = PAIRS_S17[hand.pairRank][dealer];
    }
  } else if (hand.category === "soft") {
    code = SOFT_S17[hand.total]?.[dealer] ?? "H";
  } else {
    const total = Math.min(Math.max(hand.total, 8), 17);
    code = HARD_S17[total][dealer];
  }
  return applyH17Adjustments(code, hand, dealer, rules);
}

function buildExplanation(
  action: BlackjackAction,
  hand: BlackjackHand,
  dealer: Up,
  rules: BlackjackRules,
  category: HandCategory | "surrender"
): string {
  const d = upLabel(dealer);
  const handDesc =
    hand.category === "pair"
      ? `Pair of ${hand.pairRank}s`
      : hand.soft
        ? `Soft ${hand.total}`
        : `Hard ${hand.total}`;

  const actionVerb: Record<BlackjackAction, string> = {
    hit: "Hit",
    stand: "Stand",
    double: "Double down",
    split: "Split",
    surrender: "Surrender",
  };

  let reason = "";
  if (action === "stand" && hand.total >= 12 && hand.total <= 16 && dealer >= 2 && dealer <= 6) {
    reason = ` because the dealer ${d} is a weak upcard with high bust probability.`;
  } else if (action === "hit" && hand.total >= 12 && hand.total <= 16 && dealer >= 7) {
    reason = ` because the dealer ${d} is strong and your total is unlikely to win standing.`;
  } else if (action === "double") {
    reason = ` to maximize value in a favorable spot against dealer ${d}.`;
  } else if (action === "split") {
    reason = ` — splitting improves expected value against dealer ${d}.`;
  } else if (action === "surrender") {
    reason = ` — surrender saves half your bet against a strong dealer ${d}.`;
  } else {
    reason = `.`;
  }

  let ruleNote = "";
  if (rules.dealerSoft17 === "hit") {
    ruleNote = " Strategy adjusted for dealer hits soft 17.";
  }
  if (action === "surrender" && rules.surrender) {
    ruleNote += " Late surrender is enabled.";
  }

  return `${actionVerb[action]}. ${handDesc} vs dealer ${d}${reason}${ruleNote}`.trim();
}

export function getAvailableActions(situation: BlackjackSituation): BlackjackAction[] {
  const actions: BlackjackAction[] = ["hit", "stand"];
  if (situation.canDouble) actions.push("double");
  if (situation.canSplit) actions.push("split");
  if (situation.canSurrender) actions.push("surrender");
  return actions;
}

export function gradeStrategy(
  situation: BlackjackSituation,
  rules: BlackjackRules,
  userAction: BlackjackAction
): StrategyGrade & { correct: boolean } {
  const dealer = up(situation.dealerUpcard);
  const code = lookupCode(situation.playerHand, dealer, rules);
  const recommended = codeToAction(
    code,
    situation.canDouble,
    situation.canSplit,
    situation.canSurrender
  );

  const alternatives: BlackjackAction[] = [];
  // Double-down fallback: hit is acceptable when double recommended but user hits
  if (recommended === "double" && userAction === "hit") alternatives.push("hit");
  // Split/hit equivalence for some close spots
  if (recommended === "split" && userAction === "hit") {
    /* not acceptable */
  }

  const category: HandCategory | "surrender" =
    recommended === "surrender" ? "surrender" : situation.playerHand.category;

  const ruleNote =
    rules.dealerSoft17 === "hit"
      ? "Dealer hits soft 17 — strategy differs from S17 charts."
      : undefined;

  const explanation = buildExplanation(
    recommended,
    situation.playerHand,
    dealer,
    rules,
    category
  );

  const correct =
    userAction === recommended || alternatives.includes(userAction);

  return { recommended, alternatives, explanation, category, ruleNote, correct };
}

export function getStrategyRecommendation(
  situation: BlackjackSituation,
  rules: BlackjackRules
): StrategyGrade {
  const dealer = up(situation.dealerUpcard);
  const code = lookupCode(situation.playerHand, dealer, rules);
  const recommended = codeToAction(
    code,
    situation.canDouble,
    situation.canSplit,
    situation.canSurrender
  );
  const category: HandCategory | "surrender" =
    recommended === "surrender" ? "surrender" : situation.playerHand.category;
  return {
    recommended,
    alternatives: [],
    explanation: buildExplanation(recommended, situation.playerHand, dealer, rules, category),
    category,
    ruleNote:
      rules.dealerSoft17 === "hit"
        ? "Dealer hits soft 17 — strategy differs from S17 charts."
        : undefined,
  };
}

export function situationKey(situation: BlackjackSituation): string {
  const cards = situation.playerHand.cards.map((c) => c.rank).join("-");
  return `${cards}_vs_${situation.dealerUpcard.rank}`;
}
