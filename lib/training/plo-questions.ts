import { ploPotLimitBreakdown, ploPotLimitWithStraddle } from "./calculations";
import { PloCalculationQuestion } from "./types";

function makePloQuestion(
  id: string,
  difficulty: PloCalculationQuestion["difficulty"],
  type: PloCalculationQuestion["type"],
  pot: number,
  betToCall: number,
  actionHistory: string,
  straddle?: number
): PloCalculationQuestion {
  const effectivePot = straddle ? pot : pot;
  const breakdown = straddle
    ? ploPotLimitWithStraddle(pot, betToCall, straddle)
    : ploPotLimitBreakdown(pot, betToCall);

  let prompt = "";
  let correctAnswer = 0;
  let steps: string[] = [];

  const potNote = straddle ? ` (includes $${straddle} straddle in pot)` : "";

  switch (type) {
    case "call_amount":
      prompt = `Pot is $${pot}${potNote}. Facing a $${betToCall} bet. How much to call?`;
      correctAnswer = breakdown.callAmount;
      steps = [`Call amount = facing bet = $${breakdown.callAmount}`];
      break;
    case "pot_before_raise":
      prompt = `Pot is $${pot}${potNote}. Facing $${betToCall}. What is the pot BEFORE the raise (after calling)?`;
      correctAnswer = breakdown.potAfterCall;
      steps = [
        `Step 1: Call amount = $${breakdown.callAmount}`,
        `Step 2: Pot after call = $${pot} + $${breakdown.callAmount} = $${breakdown.potAfterCall}`,
      ];
      break;
    case "max_raise":
      prompt = `Pot is $${pot}${potNote}. Facing $${betToCall}. What is the maximum raise BY (pot-sized portion)?`;
      correctAnswer = breakdown.maxRaiseBy;
      steps = [
        `Step 1: Call = $${breakdown.callAmount}`,
        `Step 2: Pot after call = $${breakdown.potAfterCall}`,
        `Step 3: Max raise BY = pot after call = $${breakdown.maxRaiseBy}`,
      ];
      break;
    case "total_put_in":
      prompt = `Pot is $${pot}${potNote}. Facing $${betToCall}. Maximum pot-limit raise — total amount put in?`;
      correctAnswer = breakdown.totalPutIn;
      steps = [
        `Step 1: Call = $${breakdown.callAmount}`,
        `Step 2: Pot after call = $${breakdown.potAfterCall}`,
        `Step 3: Raise BY = $${breakdown.maxRaiseBy}`,
        `Step 4: Total put in = $${breakdown.callAmount} + $${breakdown.maxRaiseBy} = $${breakdown.totalPutIn}`,
      ];
      break;
  }

  return { id, difficulty, type, pot, currentBet: betToCall, actionHistory, straddle, prompt, correctAnswer, steps };
}

export const PLO_CALC_QUESTIONS: PloCalculationQuestion[] = [
  makePloQuestion("plo-b1", "beginner", "call_amount", 50, 10, "BTN bets $10 into $50 pot."),
  makePloQuestion("plo-b2", "beginner", "pot_before_raise", 50, 10, "BTN bets $10 into $50 pot."),
  makePloQuestion("plo-b3", "beginner", "max_raise", 50, 10, "BTN bets $10 into $50 pot."),
  makePloQuestion("plo-b4", "beginner", "total_put_in", 50, 10, "BTN bets $10 into $50 pot."),
  makePloQuestion("plo-b5", "beginner", "call_amount", 80, 20, "CO bets $20 into $80 pot."),
  makePloQuestion("plo-b6", "beginner", "total_put_in", 80, 20, "CO bets $20 into $80 pot."),
  makePloQuestion("plo-i1", "intermediate", "max_raise", 120, 40, "MP bets $40 into $120 pot."),
  makePloQuestion("plo-i2", "intermediate", "total_put_in", 120, 40, "MP bets $40 into $120 pot."),
  makePloQuestion("plo-i3", "intermediate", "pot_before_raise", 200, 50, "UTG bets $50 into $200 pot."),
  makePloQuestion("plo-i4", "intermediate", "total_put_in", 200, 50, "UTG bets $50 into $200 pot."),
  makePloQuestion("plo-i5", "intermediate", "call_amount", 150, 75, "SB bets $75 into $150 pot."),
  makePloQuestion("plo-a1", "advanced", "total_put_in", 300, 100, "BTN bets $100 into $300 pot."),
  makePloQuestion("plo-a2", "advanced", "max_raise", 450, 150, "CO bets $150 into $450 pot."),
  makePloQuestion("plo-a3", "advanced", "total_put_in", 450, 150, "CO bets $150 into $450 pot."),
  makePloQuestion("plo-a4", "advanced", "total_put_in", 100, 25, "Straddle pot. Pot $75 + $25 straddle. Facing $25 bet.", 25),
  makePloQuestion("plo-a5", "advanced", "max_raise", 100, 25, "Straddle pot. Pot $75 + $25 straddle. Facing $25 bet.", 25),
];

export function getPloCalcQuestions(difficulty?: string): PloCalculationQuestion[] {
  if (!difficulty || difficulty === "all") return PLO_CALC_QUESTIONS;
  return PLO_CALC_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

export function getRandomPloQuestion(difficulty: string, excludeId?: string): PloCalculationQuestion {
  const pool = getPloCalcQuestions(difficulty === "all" ? undefined : difficulty).filter(
    (q) => q.id !== excludeId
  );
  return pool[Math.floor(Math.random() * pool.length)] || PLO_CALC_QUESTIONS[0];
}
