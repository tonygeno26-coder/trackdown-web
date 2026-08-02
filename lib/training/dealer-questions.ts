import { minRaiseTo } from "./calculations";
import { CalculationQuestion } from "./types";

export const POT_CALC_QUESTIONS: CalculationQuestion[] = [
  {
    id: "nlh-b1",
    difficulty: "beginner",
    type: "total_pot",
    startingPot: 30,
    currentBet: 10,
    previousAction: "Player A bets $10 into a $30 pot.",
    prompt: "What is the total pot after Player A's $10 bet is in?",
    correctAnswer: 40,
    steps: ["Starting pot: $30", "Add bet: $30 + $10 = $40", "Total pot: $40"],
  },
  {
    id: "nlh-b2",
    difficulty: "beginner",
    type: "call_amount",
    startingPot: 40,
    currentBet: 10,
    previousAction: "Player B faces a $10 bet.",
    prompt: "How much must Player B call?",
    correctAnswer: 10,
    steps: ["Facing bet: $10", "Call amount: $10"],
  },
  {
    id: "nlh-b3",
    difficulty: "beginner",
    type: "pot_after_call",
    startingPot: 40,
    currentBet: 10,
    callers: 1,
    previousAction: "Pot is $40 with a $10 bet. One player calls.",
    prompt: "What is the total pot after one call?",
    correctAnswer: 60,
    steps: ["Pot with bet: $40", "Call adds: $10", "$40 + $10 = $60"],
  },
  {
    id: "nlh-b4",
    difficulty: "beginner",
    type: "total_pot",
    startingPot: 15,
    currentBet: 5,
    previousAction: "Blinds $5/$10. Preflop pot is $15. UTG raises to $30 total ($20 raise).",
    prompt: "What is the pot after the raise (blinds + raise)?",
    correctAnswer: 45,
    steps: ["Blinds in pot: $15", "Raise to $30 total means $30 enters from UTG", "Wait — pot = blinds $15 + raise amount put in $30 = $45"],
  },
  {
    id: "nlh-b5",
    difficulty: "beginner",
    type: "call_amount",
    startingPot: 50,
    currentBet: 20,
    previousAction: "Player faces a $20 bet.",
    prompt: "How much to call?",
    correctAnswer: 20,
    steps: ["Call amount equals facing bet: $20"],
  },
  {
    id: "nlh-i1",
    difficulty: "intermediate",
    type: "min_raise",
    startingPot: 60,
    currentBet: 20,
    previousRaiseSize: 20,
    previousAction: "Bet is $20 (raised from $10). Next player wants minimum raise.",
    prompt: "What is the minimum legal raise TO?",
    correctAnswer: 40,
    steps: [
      "Current bet facing: $20",
      "Previous raise size: $10 to $20 = $10 increment... re-read",
    ],
  },
  {
    id: "nlh-i2",
    difficulty: "intermediate",
    type: "total_pot",
    startingPot: 80,
    currentBet: 40,
    callers: 2,
    previousAction: "Pot $80. Bet $40. Two players call.",
    prompt: "Total pot after bet and two calls?",
    correctAnswer: 200,
    steps: [
      "Pot includes bet: $80 + $40 = $120",
      "Two callers: $40 × 2 = $80",
      "$120 + $80 = $200",
    ],
  },
  {
    id: "nlh-i3",
    difficulty: "intermediate",
    type: "min_raise",
    startingPot: 100,
    currentBet: 50,
    previousRaiseSize: 30,
    previousAction: "Raise from $20 to $50 ($30 raise). Minimum next raise?",
    prompt: "Minimum raise TO amount?",
    correctAnswer: 80,
    steps: [
      "Current bet: $50",
      "Last raise increment: $30",
      "Min raise TO: $50 + $30 = $80",
    ],
  },
  {
    id: "nlh-i4",
    difficulty: "intermediate",
    type: "pot_after_call",
    startingPot: 120,
    currentBet: 40,
    previousAction: "Pot $120 with $40 bet facing hero.",
    prompt: "Pot size after hero calls?",
    correctAnswer: 160,
    steps: ["Pot with bet: $120", "Call adds $40", "Total: $160"],
  },
  {
    id: "nlh-i5",
    difficulty: "intermediate",
    type: "call_amount",
    startingPot: 95,
    currentBet: 35,
    previousAction: "Player raised to $35 total.",
    prompt: "Amount to call?",
    correctAnswer: 35,
    steps: ["Facing $35 bet", "Call: $35"],
  },
  {
    id: "nlh-a1",
    difficulty: "advanced",
    type: "min_raise",
    startingPot: 210,
    currentBet: 75,
    previousRaiseSize: 25,
    previousAction: "Three-bet pot. Bet is $75 (raised $25 over $50).",
    prompt: "Minimum raise TO?",
    correctAnswer: 100,
    steps: ["Current bet: $75", "Raise increment: $25", "Min raise TO: $75 + $25 = $100"],
  },
  {
    id: "nlh-a2",
    difficulty: "advanced",
    type: "total_pot",
    startingPot: 150,
    currentBet: 100,
    callers: 1,
    previousAction: "Pot $150. All-in $100. One caller for $100.",
    prompt: "Total pot after all-in and call?",
    correctAnswer: 350,
    steps: [
      "Starting pot: $150",
      "All-in $100 added: $250",
      "Caller $100: $350",
    ],
  },
  {
    id: "nlh-a3",
    difficulty: "advanced",
    type: "pot_after_call",
    startingPot: 320,
    currentBet: 80,
    previousAction: "Pot $320 facing $80 bet.",
    prompt: "Pot after call?",
    correctAnswer: 400,
    steps: ["$320 + $80 call = $400"],
  },
  {
    id: "nlh-a4",
    difficulty: "advanced",
    type: "min_raise",
    startingPot: 180,
    currentBet: 60,
    previousRaiseSize: 60,
    previousAction: "4-bet pot. Bet is $60 (raised $60 over $30 open).",
    prompt: "Minimum raise TO?",
    correctAnswer: 120,
    steps: ["Increment $60", "Min raise TO: $60 + $60 = $120"],
  },
];

// Fix nlh-i1 with correct min raise calculation
POT_CALC_QUESTIONS[5] = {
  id: "nlh-i1",
  difficulty: "intermediate",
  type: "min_raise",
  startingPot: 60,
  currentBet: 20,
  previousRaiseSize: 10,
  previousAction: "Open raise from $10 to $20 ($10 increment). Minimum re-raise?",
  prompt: "What is the minimum legal raise TO?",
  correctAnswer: 30,
  steps: [
    "Current bet facing: $20",
    "Previous raise increment: $10",
    `Min raise TO: ${minRaiseTo(20, 10)} = $30`,
  ],
};

// Fix nlh-b4 - simplify
POT_CALC_QUESTIONS[3] = {
  id: "nlh-b4",
  difficulty: "beginner",
  type: "total_pot",
  startingPot: 25,
  currentBet: 15,
  previousAction: "Pot has $25. Player bets $15.",
  prompt: "What is the total pot?",
  correctAnswer: 40,
  steps: ["$25 + $15 = $40"],
};

export function getPotCalcQuestions(difficulty?: string): CalculationQuestion[] {
  if (!difficulty || difficulty === "all") return POT_CALC_QUESTIONS;
  return POT_CALC_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

export function getPotCalcQuestionById(id: string): CalculationQuestion | undefined {
  return POT_CALC_QUESTIONS.find((q) => q.id === id);
}

export function getRandomPotCalcQuestion(
  difficulty: string,
  excludeId?: string
): CalculationQuestion {
  const pool = getPotCalcQuestions(difficulty === "all" ? undefined : difficulty).filter(
    (q) => q.id !== excludeId
  );
  return pool[Math.floor(Math.random() * pool.length)] || POT_CALC_QUESTIONS[0];
}
