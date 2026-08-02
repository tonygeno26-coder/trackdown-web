import { requiredEquityPct } from "./calculations";
import { PotOddsQuestion } from "./types";

function makePotOdds(
  id: string,
  difficulty: PotOddsQuestion["difficulty"],
  potBefore: number,
  betToCall: number,
  opts?: { estimatedEquity?: number; drawDescription?: string }
): PotOddsQuestion {
  const finalPot = potBefore + betToCall;
  const equity = requiredEquityPct(betToCall, potBefore);
  const steps = [
    `Call amount: $${betToCall}`,
    `Final pot after call: $${potBefore} + $${betToCall} = $${finalPot}`,
    `Required equity: $${betToCall} ÷ $${finalPot} × 100 = ${equity.toFixed(1)}%`,
  ];
  let explanation = `You need ${equity.toFixed(1)}% equity to break even on a call.`;
  if (opts?.estimatedEquity != null && opts.drawDescription) {
    const hasEnough = opts.estimatedEquity >= equity - 0.5;
    explanation += ` With roughly ${opts.estimatedEquity}% equity (${opts.drawDescription}), a call is ${hasEnough ? "profitable" : "unprofitable"}.`;
  }
  return {
    id,
    difficulty,
    potBefore,
    betToCall,
    estimatedEquity: opts?.estimatedEquity,
    drawDescription: opts?.drawDescription,
    prompt: `Pot is $${potBefore}. Opponent bets $${betToCall}. What equity % do you need to call?`,
    correctCallAmount: betToCall,
    correctFinalPot: finalPot,
    correctEquityPct: Math.round(equity * 10) / 10,
    steps,
    explanation,
  };
}

export const POT_ODDS_QUESTIONS: PotOddsQuestion[] = [
  makePotOdds("po-b1", "beginner", 50, 10),
  makePotOdds("po-b2", "beginner", 80, 20),
  makePotOdds("po-b3", "beginner", 100, 25),
  makePotOdds("po-b4", "beginner", 40, 10, { estimatedEquity: 35, drawDescription: "9-out flush draw" }),
  makePotOdds("po-b5", "beginner", 60, 15),
  makePotOdds("po-i1", "intermediate", 120, 40),
  makePotOdds("po-i2", "intermediate", 200, 75),
  makePotOdds("po-i3", "intermediate", 150, 50, { estimatedEquity: 28, drawDescription: "8-out straight draw" }),
  makePotOdds("po-i4", "intermediate", 90, 30),
  makePotOdds("po-i5", "intermediate", 250, 100),
  makePotOdds("po-a1", "advanced", 400, 150),
  makePotOdds("po-a2", "advanced", 320, 120, { estimatedEquity: 32, drawDescription: "combo draw ~15 outs" }),
  makePotOdds("po-a3", "advanced", 180, 90),
  makePotOdds("po-a4", "advanced", 500, 200),
  makePotOdds("po-a5", "advanced", 275, 125),
];

export function getPotOddsQuestions(difficulty?: string): PotOddsQuestion[] {
  if (!difficulty || difficulty === "all") return POT_ODDS_QUESTIONS;
  return POT_ODDS_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

export function getRandomPotOddsQuestion(difficulty: string, excludeId?: string): PotOddsQuestion {
  const pool = getPotOddsQuestions(difficulty === "all" ? undefined : difficulty).filter(
    (q) => q.id !== excludeId
  );
  return pool[Math.floor(Math.random() * pool.length)] || POT_ODDS_QUESTIONS[0];
}
