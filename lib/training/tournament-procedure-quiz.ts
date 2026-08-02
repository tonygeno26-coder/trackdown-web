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

const TDA_TOPICS = [
  { prompt: "When should a player be seated for antes in a tournament?", correct: "When they have chips on the table and are present or according to house/TDA policy.", wrong: ["Only after receiving cards.", "Never if late to the level."], explanation: "Ante eligibility follows posted tournament rules.", tags: ["antes", "seating"] },
  { prompt: "What happens when a player is all-in for less than a full raise?", correct: "It does not reopen betting for players who already acted, unless house rules specify otherwise.", wrong: ["It always reopens action.", "The hand is dead."], explanation: "Short all-ins have specific action implications.", tags: ["all-in", "betting"], caveat: "TDA and house rules may vary." },
  { prompt: "When may a tournament clock be paused?", correct: "At floor discretion for significant issues affecting play.", wrong: ["Never.", "Whenever a player requests."], explanation: "Clock management is a floor function.", tags: ["clock"] },
  { prompt: "How are odd chips awarded in tournament split pots?", correct: "First seat past the button (or per house rules).", wrong: ["Always to the biggest stack.", "Split among all players."], explanation: "Odd chip rules are standardized but verify locally.", tags: ["payout"], caveat: "House rules may vary." },
  { prompt: "When must players table their cards at showdown?", correct: "When called or when establishing a winning hand per house policy.", wrong: ["Never unless they choose.", "Only on the river before action."], explanation: "Showdown order protects hand integrity.", tags: ["showdown"] },
  { prompt: "Can a player raise after calling if not all-in?", correct: "No — a call closes their action unless a full raise reopens.", wrong: ["Yes, always.", "Only in heads-up."], explanation: "Action sequence rules prevent string raises.", tags: ["betting"] },
  { prompt: "What is the typical penalty for exposing cards with action pending?", correct: "Hand may be dead or subject to penalty per floor ruling.", wrong: ["No penalty.", "Automatic win."], explanation: "Penalties vary by severity and intent.", tags: ["penalty"], caveat: "TDA rules may vary." },
  { prompt: "When is a player eliminated from a tournament?", correct: "When they have zero chips and no pending all-in survival.", wrong: ["Immediately upon going all-in.", "At end of the level."], explanation: "Elimination follows chip count resolution.", tags: ["elimination"] },
  { prompt: "How should level changes be announced?", correct: "Clear verbal announcement of blinds, antes, and duration.", wrong: ["Silent update on the clock only.", "Only when players ask."], explanation: "Announcements keep the room synchronized.", tags: ["levels"] },
  { prompt: "What if the dealer deals the flop before preflop action completes?", correct: "Stop, retrieve cards per floor instruction, and restore action.", wrong: ["Play the flop.", "Muck all hands."], explanation: "Premature deals require floor correction.", tags: ["misdeal"] },
];

function generateTournamentQuiz(start: number, count: number): ProcedureQuizQuestion[] {
  const out: ProcedureQuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const t = TDA_TOPICS[i % TDA_TOPICS.length];
    const variant = Math.floor(i / TDA_TOPICS.length);
    out.push(
      quiz(
        `tq-${String(start + i).padStart(2, "0")}`,
        i % 3 === 0 ? "advanced" : i % 2 === 0 ? "intermediate" : "beginner",
        variant > 0 ? `[Scenario ${variant + 1}] ${t.prompt}` : t.prompt,
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

export const TOURNAMENT_QUIZ_QUESTIONS: ProcedureQuizQuestion[] = generateTournamentQuiz(1, 78);

export function pickTournamentQuestions(mode: "quick" | "full" | "mistakes" | "timed", mistakeIds?: string[]): ProcedureQuizQuestion[] {
  if (mode === "mistakes" && mistakeIds?.length) {
    return TOURNAMENT_QUIZ_QUESTIONS.filter((q) => mistakeIds.includes(q.id));
  }
  const count = mode === "quick" ? 10 : mode === "timed" ? 15 : TOURNAMENT_QUIZ_QUESTIONS.length;
  const shuffled = [...TOURNAMENT_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
