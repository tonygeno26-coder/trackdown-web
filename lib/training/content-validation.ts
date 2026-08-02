import { SIDE_POT_QUESTIONS } from "./side-pot-questions";
import { MISDEAL_SCENARIOS_ALL } from "./dealer-procedure-scenarios";
import { TOURNAMENT_QUIZ_QUESTIONS } from "./tournament-procedure-quiz";
import { CASH_GAME_QUIZ_QUESTIONS } from "./cash-game-procedure-quiz";
import { BOARD_READING_SCENARIOS } from "./board-reading-scenarios";
import { HI_LO_SCENARIOS_ALL } from "./board-reading-scenarios";
import { calculateSidePots, layersMatchExpected } from "./side-pot";
import { DEALER_TIPS } from "./dealer-tips";
import { parseCardList, cardKey } from "@/lib/cards";
import { findWinningHandIds } from "./hand-evaluator";

export interface ValidationError {
  source: string;
  message: string;
}

function validateUniqueIds(ids: string[], source: string, errors: ValidationError[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push({ source, message: `Duplicate ID: ${id}` });
    seen.add(id);
  }
}

function validateMcq(questions: { id: string; options: { id: string }[]; correctOptionId: string }[], source: string, errors: ValidationError[]): void {
  for (const q of questions) {
    const optIds = q.options.map((o) => o.id);
    if (new Set(optIds).size !== optIds.length) {
      errors.push({ source, message: `${q.id}: duplicate option IDs` });
    }
    if (!optIds.includes(q.correctOptionId)) {
      errors.push({ source, message: `${q.id}: correctOptionId not in options` });
    }
  }
}

function validateSidePots(errors: ValidationError[]): void {
  for (const q of SIDE_POT_QUESTIONS) {
    const calc = calculateSidePots(q.players);
    if (!layersMatchExpected(calc.layers, q.expectedLayers)) {
      errors.push({ source: "side-pot", message: `${q.id}: expected layers don't match calculation` });
    }
    if (Math.abs(calc.totalPot - q.totalPot) > 0.01) {
      errors.push({ source: "side-pot", message: `${q.id}: totalPot mismatch` });
    }
  }
}

function validateBoardReading(errors: ValidationError[]): void {
  for (const s of BOARD_READING_SCENARIOS) {
    const allCards = [...parseCardList(s.board)];
    for (const h of s.hands) allCards.push(...parseCardList(h.cards));
    const keys = new Set<string>();
    for (const c of allCards) {
      const k = cardKey(c);
      if (keys.has(k)) errors.push({ source: "board-reading", message: `${s.id}: duplicate card ${c.notation}` });
      keys.add(k);
    }
    const winners = findWinningHandIds(s.hands, s.board, s.gameType === "plo" ? "plo" : "holdem");
    for (const w of s.winningHandIds) {
      if (!winners.includes(w)) {
        errors.push({ source: "board-reading", message: `${s.id}: winner ${w} doesn't match evaluator [${winners.join(",")}]` });
      }
    }
  }
}

export function validateTrainingContent(): ValidationError[] {
  const errors: ValidationError[] = [];

  validateUniqueIds(SIDE_POT_QUESTIONS.map((q) => q.id), "side-pot", errors);
  validateUniqueIds(MISDEAL_SCENARIOS_ALL.map((q) => q.id), "misdeal", errors);
  validateUniqueIds(TOURNAMENT_QUIZ_QUESTIONS.map((q) => q.id), "tournament-quiz", errors);
  validateUniqueIds(CASH_GAME_QUIZ_QUESTIONS.map((q) => q.id), "cash-quiz", errors);
  validateUniqueIds(BOARD_READING_SCENARIOS.map((q) => q.id), "board-reading", errors);
  validateUniqueIds(HI_LO_SCENARIOS_ALL.map((q) => q.id), "hi-lo", errors);
  validateUniqueIds(DEALER_TIPS.map((t) => t.id), "dealer-tips", errors);

  validateMcq(MISDEAL_SCENARIOS_ALL, "misdeal", errors);
  validateMcq(TOURNAMENT_QUIZ_QUESTIONS, "tournament-quiz", errors);
  validateMcq(CASH_GAME_QUIZ_QUESTIONS, "cash-quiz", errors);

  validateSidePots(errors);
  validateBoardReading(errors);

  const counts = {
    sidePot: SIDE_POT_QUESTIONS.length,
    misdeal: MISDEAL_SCENARIOS_ALL.length,
    tournament: TOURNAMENT_QUIZ_QUESTIONS.length,
    cash: CASH_GAME_QUIZ_QUESTIONS.length,
    boardReading: BOARD_READING_SCENARIOS.length,
    hiLo: HI_LO_SCENARIOS_ALL.length,
    tips: DEALER_TIPS.length,
  };
  if (counts.sidePot < 40) errors.push({ source: "counts", message: `side-pot: ${counts.sidePot} < 40` });
  if (counts.misdeal < 50) errors.push({ source: "counts", message: `misdeal: ${counts.misdeal} < 50` });
  if (counts.tournament < 75) errors.push({ source: "counts", message: `tournament: ${counts.tournament} < 75` });
  if (counts.cash < 75) errors.push({ source: "counts", message: `cash: ${counts.cash} < 75` });
  if (counts.boardReading < 60) errors.push({ source: "counts", message: `board-reading: ${counts.boardReading} < 60` });
  if (counts.hiLo < 50) errors.push({ source: "counts", message: `hi-lo: ${counts.hiLo} < 50` });
  if (counts.tips < 100) errors.push({ source: "counts", message: `tips: ${counts.tips} < 100` });

  return errors;
}

export function assertTrainingContentValid(): void {
  const errors = validateTrainingContent();
  if (errors.length > 0) {
    const msg = errors.map((e) => `[${e.source}] ${e.message}`).join("\n");
    throw new Error(`Training content validation failed:\n${msg}`);
  }
}
