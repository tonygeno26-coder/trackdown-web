import { calculateSidePots } from "./side-pot";
import { SidePotPlayerInput, SidePotQuestion } from "./dealer-types";
import { Difficulty } from "./types";

function q(
  id: string,
  difficulty: Difficulty,
  title: string,
  description: string,
  players: SidePotPlayerInput[],
  steps: string[],
  caveat?: string
): SidePotQuestion {
  const calc = calculateSidePots(players);
  return {
    id,
    difficulty,
    title,
    description,
    players,
    expectedLayers: calc.layers.map((l) => ({ amount: l.amount, eligibleIds: l.eligibleIds })),
    totalPot: calc.totalPot,
    steps,
    caveat,
  };
}

const BASE: SidePotQuestion[] = [
  q("sp-01", "beginner", "Two-way all-in", "Player A ($100) and Player B ($50) are all-in. C ($200) calls both.", [
    { id: "a", name: "A", stack: 0, committed: 100 },
    { id: "b", name: "B", stack: 0, committed: 50, folded: false },
    { id: "c", name: "C", stack: 100, committed: 100 },
  ], ["B is eligible for $50×3 = $150 main pot", "A and C contest $50 side pot ($50×2 = $100)"]),
  q("sp-02", "beginner", "Short stack side pot", "Three players: A ($30), B ($100), C ($100).", [
    { id: "a", name: "A", stack: 0, committed: 30 },
    { id: "b", name: "B", stack: 0, committed: 100 },
    { id: "c", name: "C", stack: 0, committed: 100 },
  ], ["Main: $30×3 = $90 (A,B,C eligible)", "Side: $70×2 = $140 (B,C only)"]),
  q("sp-03", "intermediate", "Folded short stack", "A ($25 all-in), B ($100), C folded after putting $25.", [
    { id: "a", name: "A", stack: 0, committed: 25 },
    { id: "b", name: "B", stack: 75, committed: 100 },
    { id: "c", name: "C", stack: 0, committed: 25, folded: true },
  ], ["C's $25 stays in pot but C is not eligible", "Main $75 among A and B", "Side $75 for B only"], "Folded players' chips remain but they cannot win."),
  q("sp-04", "intermediate", "Three different stacks", "A ($40), B ($120), C ($200) all-in for their amounts.", [
    { id: "a", name: "A", stack: 0, committed: 40 },
    { id: "b", name: "B", stack: 0, committed: 120 },
    { id: "c", name: "C", stack: 80, committed: 200 },
  ], ["Layer 1: $40×3", "Layer 2: $80×2 (B,C)", "Layer 3: $80×1 (C only)"]),
  q("sp-05", "advanced", "Four-way mixed", "A ($50), B ($150), C ($150), D ($300).", [
    { id: "a", name: "A", stack: 0, committed: 50 },
    { id: "b", name: "B", stack: 0, committed: 150 },
    { id: "c", name: "C", stack: 0, committed: 150 },
    { id: "d", name: "D", stack: 150, committed: 300 },
  ], ["Four layers from $50 increments", "Award smallest pot first"]),
];

function generateVariations(): SidePotQuestion[] {
  const out: SidePotQuestion[] = [];
  const stacks = [
    [20, 50, 100],
    [15, 45, 90, 180],
    [10, 30, 60],
    [25, 75, 150, 300],
    [40, 80, 160],
    [5, 15, 45, 135],
    [100, 250, 500],
    [12, 36, 108],
    [8, 24, 72, 216],
    [35, 70, 140, 280],
  ];
  let idx = 6;
  for (const levels of stacks) {
    const players: SidePotPlayerInput[] = levels.map((amt, i) => ({
      id: String.fromCharCode(97 + i),
      name: String.fromCharCode(65 + i),
      stack: 0,
      committed: amt,
    }));
    out.push(
      q(
        `sp-${String(idx).padStart(2, "0")}`,
        idx % 3 === 0 ? "advanced" : idx % 2 === 0 ? "intermediate" : "beginner",
        `${levels.length}-way all-in`,
        `Stacks: ${levels.map((l) => `$${l}`).join(", ")}.`,
        players,
        [`Identify ${levels.length} pot layer(s)`, "Award from main pot outward"]
      )
    );
    idx++;
  }
  return out;
}

function generateFoldedVariations(): SidePotQuestion[] {
  const out: SidePotQuestion[] = [];
  let idx = 20;
  const configs = [
    { levels: [30, 90], foldIdx: 1 },
    { levels: [25, 75, 150], foldIdx: 0 },
    { levels: [50, 100], foldIdx: 1 },
    { levels: [20, 60, 120], foldIdx: 2 },
    { levels: [40, 120, 240], foldIdx: 1 },
  ];
  for (const { levels, foldIdx } of configs) {
    const players: SidePotPlayerInput[] = levels.map((amt, i) => ({
      id: String.fromCharCode(97 + i),
      name: String.fromCharCode(65 + i),
      stack: 0,
      committed: amt,
      folded: i === foldIdx,
    }));
    out.push(
      q(
        `sp-${String(idx).padStart(2, "0")}`,
        "intermediate",
        "Folded player in side pot",
        `${String.fromCharCode(65 + foldIdx)} folded but has chips in the pot.`,
        players,
        ["Folded player's chips stay in pot", "They cannot win any layer"],
        "House rules may vary on dead money handling."
      )
    );
    idx++;
  }
  return out;
}

function generateExtra(): SidePotQuestion[] {
  const out: SidePotQuestion[] = [];
  let idx = 30;
  for (let n = 2; n <= 6; n++) {
    const base = 10 * n;
    const levels = Array.from({ length: n }, (_, i) => base * Math.pow(2, i));
    const players: SidePotPlayerInput[] = levels.map((amt, i) => ({
      id: `p${i}`,
      name: `P${i + 1}`,
      stack: 0,
      committed: amt,
    }));
    out.push(
      q(
        `sp-${String(idx).padStart(2, "0")}`,
        n >= 5 ? "advanced" : "intermediate",
        `${n}-player ladder`,
        `Geometric stack ladder starting at $${base}.`,
        players,
        [`${n} commitment levels`, `Total pot $${levels.reduce((s, l, i) => s + l * (n - i), 0)}`]
      )
    );
    idx++;
  }
  // Additional fixed scenarios to reach 40+
  const extras: SidePotPlayerInput[][] = [
    [
      { id: "a", name: "A", stack: 0, committed: 75 },
      { id: "b", name: "B", stack: 0, committed: 150 },
      { id: "c", name: "C", stack: 0, committed: 225 },
    ],
    [
      { id: "a", name: "A", stack: 0, committed: 45 },
      { id: "b", name: "B", stack: 0, committed: 90 },
      { id: "c", name: "C", stack: 0, committed: 135 },
      { id: "d", name: "D", stack: 0, committed: 180 },
    ],
    [
      { id: "a", name: "A", stack: 0, committed: 60, folded: true },
      { id: "b", name: "B", stack: 0, committed: 120 },
      { id: "c", name: "C", stack: 0, committed: 120 },
    ],
    [
      { id: "a", name: "A", stack: 0, committed: 18 },
      { id: "b", name: "B", stack: 0, committed: 54 },
      { id: "c", name: "C", stack: 0, committed: 162 },
    ],
    [
      { id: "a", name: "A", stack: 0, committed: 200 },
      { id: "b", name: "B", stack: 0, committed: 400 },
      { id: "c", name: "C", stack: 0, committed: 600 },
      { id: "d", name: "D", stack: 0, committed: 800 },
    ],
  ];
  for (const players of extras) {
    out.push(
      q(
        `sp-${String(idx).padStart(2, "0")}`,
        "intermediate",
        `${players.length}-way side pot drill`,
        `All-in stacks: ${players.map((p) => `$${p.committed}`).join(", ")}.`,
        players,
        ["Calculate layers from smallest commitment", "Verify eligible players per layer"]
      )
    );
    idx++;
  }
  // Pad to 40+ with simple two- and three-way scenarios
  for (let i = 0; i < 12; i++) {
    const short = 15 + i * 5;
    const deep = short * 2;
    out.push(
      q(
        `sp-${String(idx).padStart(2, "0")}`,
        i % 2 ? "beginner" : "intermediate",
        `Short vs deep ${i + 1}`,
        `A ($${short}) vs B ($${deep}).`,
        [
          { id: "a", name: "A", stack: 0, committed: short },
          { id: "b", name: "B", stack: 0, committed: deep },
        ],
        ["Main pot = short × 2", "Side pot = (deep − short) × 1"]
      )
    );
    idx++;
  }
  return out;
}

export const SIDE_POT_QUESTIONS: SidePotQuestion[] = [
  ...BASE,
  ...generateVariations(),
  ...generateFoldedVariations(),
  ...generateExtra(),
];

export function getSidePotQuestion(id: string): SidePotQuestion | undefined {
  return SIDE_POT_QUESTIONS.find((q) => q.id === id);
}

export function pickSidePotQuestion(excludeId?: string): SidePotQuestion {
  const pool = excludeId
    ? SIDE_POT_QUESTIONS.filter((q) => q.id !== excludeId)
    : SIDE_POT_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
