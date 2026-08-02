import { ProcedureQuizQuestion } from "./dealer-types";
import { Difficulty } from "./types";

function quiz(
  id: string,
  difficulty: Difficulty,
  prompt: string,
  correct: string,
  wrong: string[],
  explanation: string,
  tags: string[],
  caveat?: string
): ProcedureQuizQuestion {
  const options = [
    { id: "a", text: correct },
    ...wrong.map((w, i) => ({ id: String.fromCharCode(98 + i), text: w })),
  ];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return {
    id,
    difficulty,
    prompt,
    options: shuffled,
    correctOptionId: shuffled.find((o) => o.text === correct)!.id,
    explanation,
    tags,
    caveat,
  };
}

const CASH_TOPICS = [
  { prompt: "When must a cash game player buy in?", correct: "Before receiving cards, with approved chips at table minimum.", wrong: ["Anytime mid-hand.", "Only at shift change."], explanation: "Buy-in rules prevent under-funded play.", tags: ["buy-in"] },
  { prompt: "How are missed blinds typically handled?", correct: "Missed blind button or post according to house rules.", wrong: ["No penalty.", "Player sits out forever."], explanation: "Blind posting policies vary by room.", tags: ["blinds"], caveat: "Room variation — verify local rules." },
  { prompt: "What is a 'kill' game adjustment?", correct: "Increased stakes trigger after a pot threshold per house rules.", wrong: ["Eliminating a player.", "Changing dealers."], explanation: "Kill pots are common in limit games.", tags: ["kill"], caveat: "Room variation." },
  { prompt: "When may chips be removed from play (cash out)?", correct: "Between hands, with proper rack procedure per house rules.", wrong: ["Mid-hand anytime.", "Never during a session."], explanation: "Chip removal affects table stakes.", tags: ["cash-out"] },
  { prompt: "How should straddles be handled?", correct: "Per posted house rules — UTG or button straddle as defined.", wrong: ["Dealer decides each time.", "Never allowed."], explanation: "Straddle rules differ widely.", tags: ["straddle"], caveat: "Room variation." },
  { prompt: "What if a player has fewer chips than the blind?", correct: "All-in for available chips; side pots created as needed.", wrong: ["Cannot play the hand.", "Room covers the difference."], explanation: "Short stacks play for what they have.", tags: ["all-in"] },
  { prompt: "When is table change allowed?", correct: "Between hands with floor approval.", wrong: ["Mid-hand freely.", "Never."], explanation: "Table balance is a floor function.", tags: ["seating"] },
  { prompt: "How are rabbit hunting cards handled?", correct: "Per house policy — often not dealt or shown only if room allows.", wrong: ["Always show remaining cards.", "Dealer decides."], explanation: "Rabbit hunting varies by room.", tags: ["showdown"], caveat: "Room variation." },
  { prompt: "What is proper procedure for a boxed card?", correct: "Replace with burn card per procedure; call floor if stub affected.", wrong: ["Use as play card.", "Ignore."], explanation: "Damaged cards must be replaced.", tags: ["deck"] },
  { prompt: "How should prop bets be handled by the dealer?", correct: "Do not facilitate unless house approved; stay neutral.", wrong: ["Collect and hold prop bets.", "Encourage side betting."], explanation: "Dealers maintain game neutrality.", tags: ["professionalism"] },
];

function generateCashQuiz(start: number, count: number): ProcedureQuizQuestion[] {
  const out: ProcedureQuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const t = CASH_TOPICS[i % CASH_TOPICS.length];
    const variant = Math.floor(i / CASH_TOPICS.length);
    out.push(
      quiz(
        `cq-${String(start + i).padStart(2, "0")}`,
        i % 3 === 0 ? "advanced" : i % 2 === 0 ? "intermediate" : "beginner",
        variant > 0 ? `[Variation ${variant + 1}] ${t.prompt}` : t.prompt,
        t.correct,
        t.wrong,
        t.explanation,
        t.tags,
        t.caveat
      )
    );
  }
  return out;
}

export const CASH_GAME_QUIZ_QUESTIONS: ProcedureQuizQuestion[] = generateCashQuiz(1, 78);

export function pickCashQuestions(mode: "quick" | "full" | "mistakes" | "timed", mistakeIds?: string[]): ProcedureQuizQuestion[] {
  if (mode === "mistakes" && mistakeIds?.length) {
    return CASH_GAME_QUIZ_QUESTIONS.filter((q) => mistakeIds.includes(q.id));
  }
  const count = mode === "quick" ? 10 : mode === "timed" ? 15 : CASH_GAME_QUIZ_QUESTIONS.length;
  const shuffled = [...CASH_GAME_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
