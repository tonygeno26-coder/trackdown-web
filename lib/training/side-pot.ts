import { SidePotPlayerInput } from "./dealer-types";

export interface SidePotLayer {
  amount: number;
  eligibleIds: string[];
  label: string;
}

export interface SidePotCalculation {
  layers: SidePotLayer[];
  totalPot: number;
}

/**
 * Pure side pot calculator. Folded players' chips remain in the pot
 * but they are not eligible to win.
 */
export function calculateSidePots(players: SidePotPlayerInput[]): SidePotCalculation {
  const active = players.filter((p) => p.committed > 0);
  if (active.length === 0) return { layers: [], totalPot: 0 };

  const levels = [...new Set(active.map((p) => p.committed))].sort((a, b) => a - b);
  const layers: SidePotLayer[] = [];
  let prevLevel = 0;

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const increment = level - prevLevel;
    const contributors = active.filter((p) => p.committed >= level);
    const amount = increment * contributors.length;
    const eligibleIds = contributors.filter((p) => !p.folded).map((p) => p.id);
    const label = i === 0 ? "Main pot" : `Side pot ${i}`;
    layers.push({ amount, eligibleIds, label });
    prevLevel = level;
  }

  const totalPot = layers.reduce((s, l) => s + l.amount, 0);
  return { layers, totalPot };
}

export function countSidePots(players: SidePotPlayerInput[]): number {
  const calc = calculateSidePots(players);
  return Math.max(0, calc.layers.length - 1);
}

export function playerEligibleForLayer(
  playerId: string,
  layer: SidePotLayer
): boolean {
  return layer.eligibleIds.includes(playerId);
}

export function layersMatchExpected(
  actual: SidePotLayer[],
  expected: { amount: number; eligibleIds: string[] }[],
  tolerance = 0.01
): boolean {
  if (actual.length !== expected.length) return false;
  for (let i = 0; i < actual.length; i++) {
    if (Math.abs(actual[i].amount - expected[i].amount) > tolerance) return false;
    const aSet = new Set(actual[i].eligibleIds.sort());
    const eSet = new Set(expected[i].eligibleIds.sort());
    if (aSet.size !== eSet.size) return false;
    for (const id of aSet) if (!eSet.has(id)) return false;
  }
  return true;
}

export interface SidePotLayerGrade {
  index: number;
  ok: boolean;
  userAmount: number;
  expectedAmount: number;
  userEligibleIds: string[];
  expectedEligibleIds: string[];
}

export interface SidePotGradeResult {
  correct: boolean;
  layers: SidePotLayerGrade[];
  countMessage?: string;
}

function eligibleSetsMatch(a: string[], b: string[]): boolean {
  const aSet = new Set([...a].sort());
  const eSet = new Set([...b].sort());
  if (aSet.size !== eSet.size) return false;
  for (const id of aSet) if (!eSet.has(id)) return false;
  return true;
}

/** Grade user-built layers against expected (main pot first). */
export function gradeSidePotLayers(
  userLayers: { amount: number; eligibleIds: string[] }[],
  expected: { amount: number; eligibleIds: string[] }[],
  tolerance = 0.01
): SidePotGradeResult {
  const layers: SidePotLayerGrade[] = [];
  let countMessage: string | undefined;

  if (userLayers.length > expected.length) {
    countMessage = "Too many boundaries — you split one layer that shouldn't be split.";
  } else if (userLayers.length < expected.length) {
    countMessage = "Too few boundaries — you combined two layers that should be separate.";
  }

  const maxLen = Math.max(userLayers.length, expected.length);
  for (let i = 0; i < maxLen; i++) {
    const user = userLayers[i];
    const exp = expected[i];
    if (!user || !exp) {
      layers.push({
        index: i,
        ok: false,
        userAmount: user?.amount ?? 0,
        expectedAmount: exp?.amount ?? 0,
        userEligibleIds: user?.eligibleIds ?? [],
        expectedEligibleIds: exp?.eligibleIds ?? [],
      });
      continue;
    }
    const amountOk = Math.abs(user.amount - exp.amount) <= tolerance;
    const eligibleOk = eligibleSetsMatch(user.eligibleIds, exp.eligibleIds);
    layers.push({
      index: i,
      ok: amountOk && eligibleOk,
      userAmount: user.amount,
      expectedAmount: exp.amount,
      userEligibleIds: user.eligibleIds,
      expectedEligibleIds: exp.eligibleIds,
    });
  }

  const correct = !countMessage && layers.every((l) => l.ok);
  return { correct, layers, countMessage };
}

export function distributeOddChips(
  totalAmount: number,
  winnerCount: number,
  startSeat: number,
  seatOrder: number[]
): Map<number, number> {
  if (winnerCount <= 0) return new Map();
  const base = Math.floor(totalAmount / winnerCount);
  const remainder = totalAmount - base * winnerCount;
  const payouts = new Map<number, number>();
  const winners = seatOrder.slice(startSeat - 1).concat(seatOrder.slice(0, startSeat - 1)).slice(0, winnerCount);
  for (const seat of winners) payouts.set(seat, base);
  for (let i = 0; i < remainder; i++) {
    const seat = winners[i % winners.length];
    payouts.set(seat, (payouts.get(seat) ?? base) + 1);
  }
  return payouts;
}

export function quarterPot(total: number): number {
  return Math.floor(total / 4);
}

export function splitPotEvenly(total: number, winners: number): { each: number; remainder: number } {
  const each = Math.floor(total / winners);
  return { each, remainder: total - each * winners };
}
