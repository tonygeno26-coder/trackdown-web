import { findWinningHandIds, findHiLoWinners } from "./hand-evaluator";
import { BoardReadingScenario, HiLoScenario } from "./dealer-types";
import { Difficulty } from "./types";

function boardScenario(
  id: string,
  difficulty: Difficulty,
  gameType: "holdem" | "plo",
  board: string,
  hands: { id: string; cards: string; label: string }[],
  explanation: string,
  caveat?: string
): BoardReadingScenario {
  const winningHandIds = findWinningHandIds(hands, board, gameType);
  return { id, difficulty, gameType, board, hands, winningHandIds, explanation, caveat };
}

const HOLDEM_BOARDS: BoardReadingScenario[] = [
  boardScenario("br-01", "beginner", "holdem", "Ah Kh Qh Jh Th", [
    { id: "h1", cards: "2c 3d", label: "Player 1" },
    { id: "h2", cards: "9s 9c", label: "Player 2" },
  ], "Board is a royal flush — chop with any hole cards.", "Board plays; hole cards irrelevant."),
  boardScenario("br-02", "beginner", "holdem", "Ks Kd 7c 7h 2s", [
    { id: "h1", cards: "Ac Kc", label: "Player 1" },
    { id: "h2", cards: "Qh Qd", label: "Player 2" },
  ], "P1 has full house Kings full of Sevens.", "Kicker does not matter with paired board full house."),
  boardScenario("br-03", "intermediate", "holdem", "9h 8h 7d 6c 5s", [
    { id: "h1", cards: "Tc Jc", label: "Player 1" },
    { id: "h2", cards: "Ah 2h", label: "Player 2" },
  ], "Both have a straight — P1 has Ten-high straight (6-10), P2 has Nine-high (5-9). P1 wins."),
  boardScenario("br-04", "intermediate", "holdem", "Qc Qs 4d 4h Ac", [
    { id: "h1", cards: "Ad Kd", label: "Player 1" },
    { id: "h2", cards: "4c 4s", label: "Player 2" },
  ], "P2 has quad Fours; P1 has two pair. P2 wins."),
  boardScenario("br-05", "advanced", "holdem", "Jh Jd Js 8c 8d", [
    { id: "h1", cards: "Ac Kc", label: "Player 1" },
    { id: "h2", cards: "8h 9h", label: "Player 2" },
  ], "P2 has Jacks full of Eights; P1 has Jacks full of Eights with Ace kicker — actually both use board trips. P2 has full house 888JJ vs P1 AJ888 — P2 wins with higher trips/full house."),
];

const PLO_BOARDS: BoardReadingScenario[] = [
  boardScenario("br-10", "beginner", "plo", "Ah Kh Qd Jc Tc", [
    { id: "h1", cards: "2c 3d 4s 5h", label: "Player 1" },
    { id: "h2", cards: "9s 9c 8d 7h", label: "Player 2" },
  ], "Must use exactly 2 from hand. Evaluate best PLO hand.", "PLO: exactly 2 hole + 3 board."),
  boardScenario("br-11", "intermediate", "plo", "Ts 9s 8d 7c 2h", [
    { id: "h1", cards: "Jh Qh Kd Ac", label: "Player 1" },
    { id: "h2", cards: "6c 6d 5s 4c", label: "Player 2" },
  ], "P1 can make a straight using QJ from hand + T98 board.", "Verify 2+3 rule."),
  boardScenario("br-12", "advanced", "plo", "Kd Kc 7h 7d 3s", [
    { id: "h1", cards: "Ah As 2c 3d", label: "Player 1" },
    { id: "h2", cards: "Kh Qh Jd Tc", label: "Player 2" },
  ], "P2 can use KQ + KK7 for Kings full; evaluate carefully.", "PLO full house reading."),
];

function generateHoldemBatch(): BoardReadingScenario[] {
  const configs = [
    { board: "2h 5d 8c Jc As", hands: [{ id: "h1", cards: "Ah Kd", label: "P1" }, { id: "h2", cards: "Qc Qs", label: "P2" }] },
    { board: "3c 3d 3h 9s 9c", hands: [{ id: "h1", cards: "Ac Ad", label: "P1" }, { id: "h2", cards: "Kc Kd", label: "P2" }] },
    { board: "7h 8h 9d Tc 2s", hands: [{ id: "h1", cards: "6h 5h", label: "P1" }, { id: "h2", cards: "Jd Qc", label: "P2" }] },
    { board: "Ac 2d 3h 4c 5s", hands: [{ id: "h1", cards: "6c 7d", label: "P1" }, { id: "h2", cards: "Ah Kc", label: "P2" }] },
    { board: "Kh Kd Ks 2c 2d", hands: [{ id: "h1", cards: "Ac Qc", label: "P1" }, { id: "h2", cards: "2h 2s", label: "P2" }] },
  ];
  return configs.map((c, i) =>
    boardScenario(`br-${20 + i}`, i % 2 ? "intermediate" : "beginner", "holdem", c.board, c.hands, "Best five-card hand wins.", undefined)
  );
}

function generateMoreBoards(start: number, count: number): BoardReadingScenario[] {
  const presets: { board: string; hands: { id: string; cards: string; label: string }[]; gameType: "holdem" | "plo" }[] = [
    { board: "Qh Jh Th 9c 8d", gameType: "holdem", hands: [{ id: "h1", cards: "Ac Kd", label: "P1" }, { id: "h2", cards: "7s 2c", label: "P2" }] },
    { board: "5c 5d 5h 5s Ac", gameType: "holdem", hands: [{ id: "h1", cards: "Kc Kd", label: "P1" }, { id: "h2", cards: "Qh Jd", label: "P2" }] },
    { board: "9c 8c 7d 6h 3s", gameType: "holdem", hands: [{ id: "h1", cards: "Tc 5d", label: "P1" }, { id: "h2", cards: "Ah 2h", label: "P2" }] },
    { board: "2h 2d 2c 7s 7d", gameType: "holdem", hands: [{ id: "h1", cards: "Ad Kc", label: "P1" }, { id: "h2", cards: "8h 9d", label: "P2" }] },
    { board: "Jh Js Jd 4c 4h", gameType: "holdem", hands: [{ id: "h1", cards: "Ac Qc", label: "P1" }, { id: "h2", cards: "Kh Td", label: "P2" }] },
    { board: "3h 3d 3c Ah Ad", gameType: "holdem", hands: [{ id: "h1", cards: "Kc Qd", label: "P1" }, { id: "h2", cards: "4s 5c", label: "P2" }] },
    { board: "5h 6h 7d 8c 9s", gameType: "holdem", hands: [{ id: "h1", cards: "Tc Jc", label: "P1" }, { id: "h2", cards: "2d 3c", label: "P2" }] },
    { board: "Kh Qh Jh Th 3c", gameType: "holdem", hands: [{ id: "h1", cards: "As 2s", label: "P1" }, { id: "h2", cards: "9d 8d", label: "P2" }] },
    { board: "Ac 2d 3h 4c 6s", gameType: "holdem", hands: [{ id: "h1", cards: "5d 7h", label: "P1" }, { id: "h2", cards: "Kc Qs", label: "P2" }] },
    { board: "8h 8d 8c 3s 3h", gameType: "holdem", hands: [{ id: "h1", cards: "Ad Kd", label: "P1" }, { id: "h2", cards: "Jc Tc", label: "P2" }] },
    { board: "Ts 9s 8d 7c 2h", gameType: "plo", hands: [{ id: "h1", cards: "Ah Kh Qd Jc", label: "P1" }, { id: "h2", cards: "6c 5c 4d 3d", label: "P2" }] },
    { board: "Kd Kc 7h 7d 3s", gameType: "plo", hands: [{ id: "h1", cards: "Ah As 2c 3d", label: "P1" }, { id: "h2", cards: "Qh Jh Td 9c", label: "P2" }] },
    { board: "Qc Qs 4d 4h 2c", gameType: "plo", hands: [{ id: "h1", cards: "Ac Ad Kd Kc", label: "P1" }, { id: "h2", cards: "Jh Th 9d 8c", label: "P2" }] },
    { board: "6c 6d 6h 6s Kd", gameType: "holdem", hands: [{ id: "h1", cards: "Ah Ac", label: "P1" }, { id: "h2", cards: "Qs Js", label: "P2" }] },
    { board: "Tc Td 9h 9c 8s", gameType: "holdem", hands: [{ id: "h1", cards: "Ad Kh", label: "P1" }, { id: "h2", cards: "7c 5d", label: "P2" }] },
  ];
  const out: BoardReadingScenario[] = [];
  for (let i = 0; i < count; i++) {
    const preset = presets[i % presets.length];
    out.push(
      boardScenario(
        `br-${String(start + i).padStart(2, "0")}`,
        i % 3 === 0 ? "advanced" : "beginner",
        preset.gameType,
        preset.board,
        preset.hands,
        "Validated by hand evaluator."
      )
    );
  }
  return out;
}

export const BOARD_READING_SCENARIOS: BoardReadingScenario[] = [
  ...HOLDEM_BOARDS,
  ...PLO_BOARDS,
  ...generateHoldemBatch(),
  ...generateMoreBoards(30, 47),
];

export function pickBoardReadingScenario(excludeId?: string): BoardReadingScenario {
  const pool = excludeId ? BOARD_READING_SCENARIOS.filter((s) => s.id !== excludeId) : BOARD_READING_SCENARIOS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function hiLoScenario(
  id: string,
  difficulty: Difficulty,
  board: string,
  hands: { id: string; cards: string; label: string }[],
  explanation: string,
  payoutDescription: string,
  tags: string[],
  caveat?: string
): HiLoScenario {
  const { highWinnerIds, lowWinnerIds } = findHiLoWinners(hands, board);
  return { id, difficulty, board, hands, highWinnerIds, lowWinnerIds, payoutDescription, explanation, tags, caveat };
}

export const HI_LO_SCENARIOS: HiLoScenario[] = [
  hiLoScenario("hl-01", "beginner", "Ah 2c 3d 4h 7s", [
    { id: "h1", cards: "5c 6d Kc Qd", label: "P1" },
    { id: "h2", cards: "8c 9d Tc Jd", label: "P2" },
  ], "P1 can make wheel low (A-2-3-4-5) using 56 from hand.", "High and low split; quarter if same player scoops both.", ["scoop"], "8-or-better low required."),
  hiLoScenario("hl-02", "intermediate", "Kh Qd Jc Ts 2h", [
    { id: "h1", cards: "Ac Ad 3c 4d", label: "P1" },
    { id: "h2", cards: "5c 6d 7h 8c", label: "P2" },
  ], "No qualifying low on this board — high only.", "Entire pot to high winner.", ["no-low"]),
  hiLoScenario("hl-03", "intermediate", "8h 7d 6c 5s 2d", [
    { id: "h1", cards: "Ac 3c Kd Qh", label: "P1" },
    { id: "h2", cards: "4h Ah 9c Td", label: "P2" },
  ], "Both may qualify for low — compare low hands.", "Split high/low; odd chip to high per house rules.", ["split", "odd-chip"], "House rules may vary."),
  hiLoScenario("hl-04", "advanced", "Ah 2h 3d 4c Kh", [
    { id: "h1", cards: "5s 6c 7d 8h", label: "P1" },
    { id: "h2", cards: "5d 6h Ac Kc", label: "P2" },
  ], "Potential quartering if one player scoops high and low vs shared low.", "Quarter pot for scooper vs shared low.", ["quartering"]),
  hiLoScenario("hl-05", "beginner", "9c 8d 7h 6s 5c", [
    { id: "h1", cards: "Ah 2c 3d 4h", label: "P1" },
    { id: "h2", cards: "Kc Qd Jc Td", label: "P2" },
  ], "P1 has strong low; P2 likely high only.", "High/low split between players.", ["split"]),
];

function generateHiLoBatch(start: number, count: number): HiLoScenario[] {
  const boards = [
    "A♣ boards as Ah 2c 5d 7h 9s", "Kh Qd 4c 3h 2d", "8c 7d 6h 5s 2c",
    "Ac 3d 5h 7c 9s", "2h 3d 4c 8s Kd", "Ah 4c 6d 8h Tc",
  ].map((b) => b.replace("A♣ boards as ", "").replace("♣", "c"));
  const out: HiLoScenario[] = [];
  for (let i = 0; i < count; i++) {
    const board = boards[i % boards.length];
    const hands = [
      { id: "h1", cards: "Ac 2c 5d 6h", label: "P1" },
      { id: "h2", cards: "Kc Kd Qh Jd", label: "P2" },
      { id: "h3", cards: "3c 4d 7s 8h", label: "P3" },
    ].slice(0, 2 + (i % 2));
    const { highWinnerIds, lowWinnerIds } = findHiLoWinners(hands, board);
    const scoops = highWinnerIds.length === 1 && lowWinnerIds.length === 1 && highWinnerIds[0] === lowWinnerIds[0];
    out.push({
      id: `hl-${String(start + i).padStart(2, "0")}`,
      difficulty: i % 3 === 0 ? "advanced" : "intermediate",
      board,
      hands,
      highWinnerIds,
      lowWinnerIds,
      payoutDescription: scoops ? "Scoop — wins both halves" : lowWinnerIds.length ? "Split high and low" : "High only",
      explanation: "Computed by Omaha hi-lo evaluator.",
      tags: scoops ? ["scoop"] : lowWinnerIds.length ? ["split"] : ["no-low"],
      caveat: "House rules may vary on odd chips.",
    });
  }
  return out;
}

export const HI_LO_SCENARIOS_ALL: HiLoScenario[] = [
  ...HI_LO_SCENARIOS,
  ...generateHiLoBatch(6, 47),
];

export function pickHiLoScenario(excludeId?: string): HiLoScenario {
  const pool = excludeId ? HI_LO_SCENARIOS_ALL.filter((s) => s.id !== excludeId) : HI_LO_SCENARIOS_ALL;
  return pool[Math.floor(Math.random() * pool.length)];
}
