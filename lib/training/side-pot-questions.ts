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

export const SIDE_POT_QUESTIONS: SidePotQuestion[] = [
  // ── Core scenarios (sp-01 – sp-05) ──────────────────────────────────────
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
  ], ["Three layers from $50 increments", "Award smallest pot first"]),

  // ── Multi-way stack ladders (sp-06 – sp-15) ─────────────────────────────
  q("sp-06", "intermediate", "3-way all-in", "Stacks: $20, $50, $100.", [
    { id: "a", name: "A", stack: 0, committed: 20 },
    { id: "b", name: "B", stack: 0, committed: 50 },
    { id: "c", name: "C", stack: 0, committed: 100 },
  ], ["Identify 3 pot layer(s)", "Award from main pot outward"]),
  q("sp-07", "advanced", "4-way all-in", "Stacks: $15, $45, $90, $180.", [
    { id: "a", name: "A", stack: 0, committed: 15 },
    { id: "b", name: "B", stack: 0, committed: 45 },
    { id: "c", name: "C", stack: 0, committed: 90 },
    { id: "d", name: "D", stack: 0, committed: 180 },
  ], ["Identify 4 pot layer(s)", "Award from main pot outward"]),
  q("sp-08", "intermediate", "3-way all-in", "Stacks: $10, $30, $60.", [
    { id: "a", name: "A", stack: 0, committed: 10 },
    { id: "b", name: "B", stack: 0, committed: 30 },
    { id: "c", name: "C", stack: 0, committed: 60 },
  ], ["Identify 3 pot layer(s)", "Award from main pot outward"]),
  q("sp-09", "advanced", "4-way all-in", "Stacks: $25, $75, $150, $300.", [
    { id: "a", name: "A", stack: 0, committed: 25 },
    { id: "b", name: "B", stack: 0, committed: 75 },
    { id: "c", name: "C", stack: 0, committed: 150 },
    { id: "d", name: "D", stack: 0, committed: 300 },
  ], ["Identify 4 pot layer(s)", "Award from main pot outward"]),
  q("sp-10", "intermediate", "3-way all-in", "Stacks: $40, $80, $160.", [
    { id: "a", name: "A", stack: 0, committed: 40 },
    { id: "b", name: "B", stack: 0, committed: 80 },
    { id: "c", name: "C", stack: 0, committed: 160 },
  ], ["Identify 3 pot layer(s)", "Award from main pot outward"]),
  q("sp-11", "advanced", "4-way all-in", "Stacks: $5, $15, $45, $135.", [
    { id: "a", name: "A", stack: 0, committed: 5 },
    { id: "b", name: "B", stack: 0, committed: 15 },
    { id: "c", name: "C", stack: 0, committed: 45 },
    { id: "d", name: "D", stack: 0, committed: 135 },
  ], ["Identify 4 pot layer(s)", "Award from main pot outward"]),
  q("sp-12", "intermediate", "3-way all-in", "Stacks: $100, $250, $500.", [
    { id: "a", name: "A", stack: 0, committed: 100 },
    { id: "b", name: "B", stack: 0, committed: 250 },
    { id: "c", name: "C", stack: 0, committed: 500 },
  ], ["Identify 3 pot layer(s)", "Award from main pot outward"]),
  q("sp-13", "intermediate", "3-way all-in", "Stacks: $12, $36, $108.", [
    { id: "a", name: "A", stack: 0, committed: 12 },
    { id: "b", name: "B", stack: 0, committed: 36 },
    { id: "c", name: "C", stack: 0, committed: 108 },
  ], ["Identify 3 pot layer(s)", "Award from main pot outward"]),
  q("sp-14", "advanced", "4-way all-in", "Stacks: $8, $24, $72, $216.", [
    { id: "a", name: "A", stack: 0, committed: 8 },
    { id: "b", name: "B", stack: 0, committed: 24 },
    { id: "c", name: "C", stack: 0, committed: 72 },
    { id: "d", name: "D", stack: 0, committed: 216 },
  ], ["Identify 4 pot layer(s)", "Award from main pot outward"]),
  q("sp-15", "advanced", "4-way all-in", "Stacks: $35, $70, $140, $280.", [
    { id: "a", name: "A", stack: 0, committed: 35 },
    { id: "b", name: "B", stack: 0, committed: 70 },
    { id: "c", name: "C", stack: 0, committed: 140 },
    { id: "d", name: "D", stack: 0, committed: 280 },
  ], ["Identify 4 pot layer(s)", "Award from main pot outward"]),

  // ── Folded-player complications (sp-20 – sp-24) ───────────────────────
  q("sp-20", "intermediate", "Folded player in side pot", "B folded but has chips in the pot.", [
    { id: "a", name: "A", stack: 0, committed: 30 },
    { id: "b", name: "B", stack: 0, committed: 90, folded: true },
  ], ["Folded player's chips stay in pot", "They cannot win any layer"], "House rules may vary on dead money handling."),
  q("sp-21", "intermediate", "Folded player in side pot", "A folded but has chips in the pot.", [
    { id: "a", name: "A", stack: 0, committed: 25, folded: true },
    { id: "b", name: "B", stack: 0, committed: 75 },
    { id: "c", name: "C", stack: 0, committed: 150 },
  ], ["Folded player's chips stay in pot", "They cannot win any layer"], "House rules may vary on dead money handling."),
  q("sp-22", "beginner", "Folded player in side pot", "B folded but has chips in the pot.", [
    { id: "a", name: "A", stack: 0, committed: 50 },
    { id: "b", name: "B", stack: 0, committed: 100, folded: true },
  ], ["Folded player's chips stay in pot", "They cannot win any layer"], "House rules may vary on dead money handling."),
  q("sp-23", "intermediate", "Folded player in side pot", "C folded but has chips in the pot.", [
    { id: "a", name: "A", stack: 0, committed: 20 },
    { id: "b", name: "B", stack: 0, committed: 60 },
    { id: "c", name: "C", stack: 0, committed: 120, folded: true },
  ], ["Folded player's chips stay in pot", "They cannot win any layer"], "House rules may vary on dead money handling."),
  q("sp-24", "intermediate", "Folded player in side pot", "B folded but has chips in the pot.", [
    { id: "a", name: "A", stack: 0, committed: 40 },
    { id: "b", name: "B", stack: 0, committed: 120, folded: true },
    { id: "c", name: "C", stack: 0, committed: 240 },
  ], ["Folded player's chips stay in pot", "They cannot win any layer"], "House rules may vary on dead money handling."),

  // ── Geometric ladders (sp-30 – sp-34) ───────────────────────────────────
  q("sp-30", "beginner", "2-player ladder", "Geometric stack ladder starting at $20.", [
    { id: "p0", name: "P1", stack: 0, committed: 20 },
    { id: "p1", name: "P2", stack: 0, committed: 40 },
  ], ["2 commitment levels", "Total pot $60"]),
  q("sp-31", "intermediate", "3-player ladder", "Geometric stack ladder starting at $30.", [
    { id: "p0", name: "P1", stack: 0, committed: 30 },
    { id: "p1", name: "P2", stack: 0, committed: 60 },
    { id: "p2", name: "P3", stack: 0, committed: 120 },
  ], ["3 commitment levels", "Total pot $210"]),
  q("sp-32", "advanced", "4-player ladder", "Geometric stack ladder starting at $40.", [
    { id: "p0", name: "P1", stack: 0, committed: 40 },
    { id: "p1", name: "P2", stack: 0, committed: 80 },
    { id: "p2", name: "P3", stack: 0, committed: 160 },
    { id: "p3", name: "P4", stack: 0, committed: 320 },
  ], ["4 commitment levels", "Total pot $600"]),
  q("sp-33", "advanced", "5-player ladder", "Geometric stack ladder starting at $50.", [
    { id: "p0", name: "P1", stack: 0, committed: 50 },
    { id: "p1", name: "P2", stack: 0, committed: 100 },
    { id: "p2", name: "P3", stack: 0, committed: 200 },
    { id: "p3", name: "P4", stack: 0, committed: 400 },
    { id: "p4", name: "P5", stack: 0, committed: 800 },
  ], ["5 commitment levels", "Total pot $1550"]),
  q("sp-34", "advanced", "6-player ladder", "Geometric stack ladder starting at $60.", [
    { id: "p0", name: "P1", stack: 0, committed: 60 },
    { id: "p1", name: "P2", stack: 0, committed: 120 },
    { id: "p2", name: "P3", stack: 0, committed: 240 },
    { id: "p3", name: "P4", stack: 0, committed: 480 },
    { id: "p4", name: "P5", stack: 0, committed: 960 },
    { id: "p5", name: "P6", stack: 0, committed: 1920 },
  ], ["6 commitment levels", "Total pot $3780"]),

  // ── Fixed drills (sp-35 – sp-39) ────────────────────────────────────────
  q("sp-35", "intermediate", "3-way side pot drill", "All-in stacks: $75, $150, $225.", [
    { id: "a", name: "A", stack: 0, committed: 75 },
    { id: "b", name: "B", stack: 0, committed: 150 },
    { id: "c", name: "C", stack: 0, committed: 225 },
  ], ["Calculate layers from smallest commitment", "Verify eligible players per layer"]),
  q("sp-36", "advanced", "4-way side pot drill", "All-in stacks: $45, $90, $135, $180.", [
    { id: "a", name: "A", stack: 0, committed: 45 },
    { id: "b", name: "B", stack: 0, committed: 90 },
    { id: "c", name: "C", stack: 0, committed: 135 },
    { id: "d", name: "D", stack: 0, committed: 180 },
  ], ["Calculate layers from smallest commitment", "Verify eligible players per layer"]),
  q("sp-37", "intermediate", "3-way side pot drill", "All-in stacks: $60, $120, $120 (A folded).", [
    { id: "a", name: "A", stack: 0, committed: 60, folded: true },
    { id: "b", name: "B", stack: 0, committed: 120 },
    { id: "c", name: "C", stack: 0, committed: 120 },
  ], ["Calculate layers from smallest commitment", "Verify eligible players per layer"]),
  q("sp-38", "intermediate", "3-way side pot drill", "All-in stacks: $18, $54, $162.", [
    { id: "a", name: "A", stack: 0, committed: 18 },
    { id: "b", name: "B", stack: 0, committed: 54 },
    { id: "c", name: "C", stack: 0, committed: 162 },
  ], ["Calculate layers from smallest commitment", "Verify eligible players per layer"]),
  q("sp-39", "advanced", "4-way side pot drill", "All-in stacks: $200, $400, $600, $800.", [
    { id: "a", name: "A", stack: 0, committed: 200 },
    { id: "b", name: "B", stack: 0, committed: 400 },
    { id: "c", name: "C", stack: 0, committed: 600 },
    { id: "d", name: "D", stack: 0, committed: 800 },
  ], ["Calculate layers from smallest commitment", "Verify eligible players per layer"]),

  // ── Short vs deep (sp-40, sp-43, sp-47, sp-51 — trimmed from 12) ─────────
  q("sp-40", "beginner", "Short vs deep ($15 / $30)", "A ($15) vs B ($30).", [
    { id: "a", name: "A", stack: 0, committed: 15 },
    { id: "b", name: "B", stack: 0, committed: 30 },
  ], ["Main pot = short × 2", "Side pot = (deep − short) × 1"]),
  q("sp-43", "beginner", "Short vs deep ($30 / $60)", "A ($30) vs B ($60).", [
    { id: "a", name: "A", stack: 0, committed: 30 },
    { id: "b", name: "B", stack: 0, committed: 60 },
  ], ["Main pot = short × 2", "Side pot = (deep − short) × 1"]),
  q("sp-47", "beginner", "Short vs deep ($50 / $100)", "A ($50) vs B ($100).", [
    { id: "a", name: "A", stack: 0, committed: 50 },
    { id: "b", name: "B", stack: 0, committed: 100 },
  ], ["Main pot = short × 2", "Side pot = (deep − short) × 1"]),
  q("sp-51", "beginner", "Short vs deep ($70 / $140)", "A ($70) vs B ($140).", [
    { id: "a", name: "A", stack: 0, committed: 70 },
    { id: "b", name: "B", stack: 0, committed: 140 },
  ], ["Main pot = short × 2", "Side pot = (deep − short) × 1"]),

  // ── Dealer-trick scenarios (sp-52 – sp-55) ──────────────────────────────
  q("sp-52", "beginner", "Equal stacks — no side pot", "A ($100), B ($100), and C ($100) are all-in.", [
    { id: "a", name: "A", stack: 0, committed: 100 },
    { id: "b", name: "B", stack: 0, committed: 100 },
    { id: "c", name: "C", stack: 0, committed: 100 },
  ], ["All three matched at $100 — one main pot ($300)", "No side pots needed"], "Equal all-in stacks mean a single pot — don't over-complicate."),
  q("sp-53", "beginner", "Uncalled bet returned", "A ($50) and B ($50) are all-in. C bet $100 but only $50 was called.", [
    { id: "a", name: "A", stack: 0, committed: 50 },
    { id: "b", name: "B", stack: 0, committed: 50 },
    { id: "c", name: "C", stack: 50, committed: 50 },
  ], ["All players matched at $50 — one main pot ($150)", "Return $50 uncalled bet to C before awarding"], "Only matched chips go into the pot; uncalled bets are returned to the bettor."),
  q("sp-54", "beginner", "Heads-up equal all-in", "A ($200) and B ($200) are all-in.", [
    { id: "a", name: "A", stack: 0, committed: 200 },
    { id: "b", name: "B", stack: 0, committed: 200 },
  ], ["Both matched at $200 — one main pot ($400)", "No side pots needed"], "Equal stacks heads-up is always a single pot."),
  q("sp-55", "intermediate", "Short stack with active caller", "A ($60), B ($150), C ($150) — C still has chips behind.", [
    { id: "a", name: "A", stack: 0, committed: 60 },
    { id: "b", name: "B", stack: 0, committed: 150 },
    { id: "c", name: "C", stack: 50, committed: 150 },
  ], ["Main: $60×3 = $180 (A, B, C eligible)", "Side: $90×2 = $180 (B, C only)"]),
  q("sp-56", "advanced", "Four equal stacks — no side pot", "A ($75), B ($75), C ($75), and D ($75) are all-in.", [
    { id: "a", name: "A", stack: 0, committed: 75 },
    { id: "b", name: "B", stack: 0, committed: 75 },
    { id: "c", name: "C", stack: 0, committed: 75 },
    { id: "d", name: "D", stack: 0, committed: 75 },
  ], ["All four matched at $75 — one main pot ($300)", "No side pots needed"], "Four equal stacks still produce a single pot — side pots only appear when commitments differ."),
  q("sp-57", "beginner", "Heads-up uncalled overbet", "A ($50 all-in) called by B who bet $80 total.", [
    { id: "a", name: "A", stack: 0, committed: 50 },
    { id: "b", name: "B", stack: 30, committed: 50 },
  ], ["Both matched at $50 — one main pot ($100)", "Return $30 uncalled bet to B before awarding"], "Uncalled portions of a bet are never added to the pot."),
];

/** Badge label for Dealer Academy module card — reflects the full difficulty range. */
export function sidePotModuleDifficultyLabel(): string {
  const tiers = new Set(SIDE_POT_QUESTIONS.map((question) => question.difficulty));
  if (tiers.has("beginner") && tiers.has("advanced")) return "Beginner–Advanced";
  if (tiers.has("beginner") && tiers.has("intermediate")) return "Beginner–Intermediate";
  if (tiers.has("intermediate") && tiers.has("advanced")) return "Intermediate–Advanced";
  const sole = [...tiers][0];
  return sole ? sole.charAt(0).toUpperCase() + sole.slice(1) : "Intermediate";
}

export function getSidePotQuestion(id: string): SidePotQuestion | undefined {
  return SIDE_POT_QUESTIONS.find((question) => question.id === id);
}

export function pickSidePotQuestion(excludeId?: string): SidePotQuestion {
  const pool = excludeId
    ? SIDE_POT_QUESTIONS.filter((question) => question.id !== excludeId)
    : SIDE_POT_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
