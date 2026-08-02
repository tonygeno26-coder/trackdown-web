import { SpeedDrillQuestion } from "./dealer-types";
import { numericAnswerMatches } from "./calculations";
import { countSidePots, calculateSidePots } from "./side-pot";
import { SidePotPlayerInput } from "./dealer-types";

function potTotalQuestion(id: string, pot: number, bet: number, callers: number): SpeedDrillQuestion {
  const total = pot + bet * (callers + 1);
  return {
    id,
    type: "pot_total",
    prompt: `Pot $${pot}, player bets $${bet}, ${callers} caller(s). Total pot after calls?`,
    correctAnswer: total,
    difficulty: total > 500 ? "advanced" : "beginner",
  };
}

function sidePotCountQuestion(id: string, players: SidePotPlayerInput[]): SpeedDrillQuestion {
  return {
    id,
    type: "side_pot_count",
    prompt: `How many side pots (excluding main)? ${players.map((p) => `${p.name}: $${p.committed}`).join(", ")}`,
    correctAnswer: countSidePots(players),
    difficulty: players.length > 3 ? "intermediate" : "beginner",
  };
}

function callAmountQuestion(id: string, currentBet: number, playerIn: number): SpeedDrillQuestion {
  return {
    id,
    type: "call_amount",
    prompt: `Current bet $${currentBet}, player has $${playerIn} in. Call amount?`,
    correctAnswer: currentBet - playerIn,
    difficulty: "beginner",
  };
}

const SPEED_QUESTIONS: SpeedDrillQuestion[] = [
  potTotalQuestion("spd-01", 100, 50, 2),
  potTotalQuestion("spd-02", 75, 75, 1),
  potTotalQuestion("spd-03", 200, 100, 3),
  callAmountQuestion("spd-04", 100, 25),
  callAmountQuestion("spd-05", 50, 0),
  sidePotCountQuestion("spd-06", [
    { id: "a", name: "A", stack: 0, committed: 50 },
    { id: "b", name: "B", stack: 0, committed: 100 },
    { id: "c", name: "C", stack: 0, committed: 100 },
  ]),
  sidePotCountQuestion("spd-07", [
    { id: "a", name: "A", stack: 0, committed: 30 },
    { id: "b", name: "B", stack: 0, committed: 90 },
    { id: "c", name: "C", stack: 0, committed: 90 },
    { id: "d", name: "D", stack: 0, committed: 180 },
  ]),
];

function generateSpeedBatch(start: number, count: number): SpeedDrillQuestion[] {
  const out: SpeedDrillQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const type = i % 4;
    if (type === 0) {
      const pot = 25 * (i + 2);
      const bet = 25 * (i + 1);
      out.push(potTotalQuestion(`spd-${String(start + i).padStart(2, "0")}`, pot, bet, i % 3));
    } else if (type === 1) {
      out.push(callAmountQuestion(`spd-${String(start + i).padStart(2, "0")}`, 50 + i * 25, i * 10));
    } else if (type === 2) {
      const levels = [20, 60, 120].slice(0, 2 + (i % 2));
      const players = levels.map((c, j) => ({ id: `p${j}`, name: `P${j + 1}`, stack: 0, committed: c }));
      out.push(sidePotCountQuestion(`spd-${String(start + i).padStart(2, "0")}`, players));
    } else {
      const chipCount = 100 + i * 37;
      out.push({
        id: `spd-${String(start + i).padStart(2, "0")}`,
        type: "chip_count",
        prompt: `Stack: ${Math.floor(chipCount / 25)} red ($25), ${chipCount % 25 === 0 ? 0 : 1} green ($5). Total?`,
        correctAnswer: chipCount,
        difficulty: "intermediate",
      });
    }
  }
  return out;
}

export const SPEED_DRILL_QUESTIONS: SpeedDrillQuestion[] = [
  ...SPEED_QUESTIONS,
  ...generateSpeedBatch(8, 32),
];

export function pickSpeedQuestions(count: number, excludeIds: string[] = []): SpeedDrillQuestion[] {
  const pool = SPEED_DRILL_QUESTIONS.filter((q) => !excludeIds.includes(q.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function gradeSpeedAnswer(question: SpeedDrillQuestion, answer: number): boolean {
  return numericAnswerMatches(answer, question.correctAnswer);
}

export function sidePotTotalForPlayers(players: SidePotPlayerInput[]): number {
  return calculateSidePots(players).totalPot;
}
