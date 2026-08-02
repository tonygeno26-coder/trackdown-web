import { ProcedureScenario } from "./dealer-types";
import { Difficulty } from "./types";

function scenario(
  id: string,
  difficulty: Difficulty,
  title: string,
  situation: string,
  correct: string,
  wrong: string[],
  explanation: string,
  tags: string[],
  caveat?: string
): ProcedureScenario {
  const options = [
    { id: "a", text: correct },
    ...wrong.map((w, i) => ({ id: String.fromCharCode(98 + i), text: w })),
  ].sort(() => Math.random() - 0.5);
  const correctOptionId = options.find((o) => o.text === correct)!.id;
  return { id, difficulty, title, situation, options, correctOptionId, explanation, tags, caveat };
}

const MISDEAL_SCENARIOS: ProcedureScenario[] = [
  scenario("md-01", "beginner", "Exposed hole card", "You accidentally expose one player's hole card while pitching.", "Stop dealing, announce the exposed card, and call the floor.", ["Continue dealing and let the player replace the card.", "Shuffle the stub and redealt the entire hand without floor involvement."], "Exposed cards require floor ruling. Do not continue standard dealing.", ["misdeal", "exposed"], "House rules may vary."),
  scenario("md-02", "beginner", "Two cards to one player", "One player receives two cards; others have one.", "Stop immediately and call the floor for misdeal procedure.", ["Give the extra card to the next player.", "Burn and continue dealing."], "Dealing errors to fewer/more cards are floor matters.", ["misdeal", "pitching"]),
  scenario("md-03", "intermediate", "Premature board card", "You deal a flop card before the action is complete.", "Stop, protect the board, and call the floor.", ["Leave the card and continue.", "Return the card to the stub and burn again on your own."], "Premature board cards require floor decision.", ["misdeal", "board"]),
  scenario("md-04", "intermediate", "Card off the table", "A hole card lands on the floor.", "Announce 'card off the table,' protect it, and call the floor.", ["Treat it as dead immediately without announcement.", "Let the player retrieve it and continue."], "Security and procedure require floor involvement.", ["exposed", "security"]),
  scenario("md-05", "advanced", "Fouled deck", "Two identical cards appear in the same hand.", "Stop the game, spread the deck for inspection, call the floor.", ["Remove one duplicate and continue.", "Ask players if they want to continue."], "Duplicate cards indicate a fouled deck.", ["misdeal", "deck"], "House rules may vary."),
  scenario("md-06", "beginner", "Action out of turn", "Player B acts before Player A who has not acted.", "Announce the action may be binding or subject to floor ruling; call floor if needed.", ["Allow the action without comment.", "Automatically kill the action."], "Out-of-turn action rules vary by room.", ["action", "floor"], "House rules may vary."),
  scenario("md-07", "intermediate", "Uncalled bet return", "All players fold to a bet; bettor's uncalled chips remain.", "Return uncalled amount to the bettor before pushing the pot.", ["Push entire pot including uncalled bet.", "Let the bettor take it themselves."], "Uncalled bets are returned per standard procedure.", ["pot", "cash"]),
  scenario("md-08", "beginner", "Premature muck", "Player mucks before winner is determined at showdown.", "Protect all hands; call floor if muck affects award.", ["Award pot to remaining player immediately without verification.", "Allow muck and proceed."], "Premature muck may still be retrievable per house rules.", ["showdown"], "House rules may vary."),
  scenario("md-09", "intermediate", "String raise", "Player puts chips in multiple motions without clear declaration.", "Announce that only the first motion may bind; call floor if disputed.", ["Accept the full amount as a raise.", "Kill the entire action."], "String bet rules protect other players.", ["betting", "cash"], "House rules may vary."),
  scenario("md-10", "advanced", "Side pot award error discovered", "After pushing pot, you realize a side pot was missed.", "Stop payouts, call floor, reconstruct pots before any chips leave.", ["Let players sort it out.", "Take from winner's stack to fix."], "Floor must supervise pot reconstruction.", ["side-pot", "pot"]),
];

function generateMisdealBatch(start: number, count: number): ProcedureScenario[] {
  const templates = [
    { title: "Burn card exposed", situation: "The burn card is exposed while dealing the turn.", correct: "Complete the burn procedure per house rules and call floor if required.", wrong: ["Use the exposed burn as the turn.", "Skip the burn."], explanation: "Burn procedures protect game integrity.", tags: ["burn", "board"] },
    { title: "Dealer button error", situation: "The button was placed on the wrong seat.", correct: "Call the floor before significant action occurs.", wrong: ["Move button mid-hand.", "Ignore if no one noticed."], explanation: "Button placement affects blinds and action order.", tags: ["button", "tournament"] },
    { title: "Short deck dealt", situation: "Stub has fewer cards than needed for remaining players.", correct: "Stop and call floor for misdeal.", wrong: ["Deal from another deck without approval.", "Skip the shorted player."], explanation: "Insufficient cards require misdeal ruling.", tags: ["misdeal", "deck"] },
    { title: "Verbal declaration dispute", situation: "Player says 'call' but puts in raise amount.", correct: "Announce the discrepancy and call floor.", wrong: ["Force call.", "Force raise."], explanation: "Verbal vs chip disputes need floor.", tags: ["betting"], caveat: "House rules may vary." },
    { title: "Show one show all", situation: "One player tables at showdown; others ask to see mucked hands.", correct: "Follow house show-one-show-all policy; call floor if unclear.", wrong: ["Show all mucked hands always.", "Never show mucked hands."], explanation: "Show rules vary by jurisdiction.", tags: ["showdown"], caveat: "House rules may vary." },
  ];
  const out: ProcedureScenario[] = [];
  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length];
    const id = `md-${String(start + i).padStart(2, "0")}`;
    out.push(scenario(id, i % 3 === 0 ? "advanced" : i % 2 === 0 ? "intermediate" : "beginner", t.title, t.situation, t.correct, t.wrong, t.explanation, t.tags, t.caveat));
  }
  return out;
}

export const MISDEAL_SCENARIOS_ALL: ProcedureScenario[] = [
  ...MISDEAL_SCENARIOS,
  ...generateMisdealBatch(11, 42),
];

export function pickMisdealScenario(excludeId?: string, mistakeIds?: string[]): ProcedureScenario {
  if (mistakeIds?.length) {
    const pool = MISDEAL_SCENARIOS_ALL.filter((s) => mistakeIds.includes(s.id) && s.id !== excludeId);
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  }
  const pool = excludeId ? MISDEAL_SCENARIOS_ALL.filter((s) => s.id !== excludeId) : MISDEAL_SCENARIOS_ALL;
  return pool[Math.floor(Math.random() * pool.length)];
}
