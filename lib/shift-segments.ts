import { DownBlock, Shift, ShiftType } from "./types";
import { estimatedTournamentEarnings, fmtMoney, netAfterTax, netTips, turnInsTotal } from "./blocks";

export type DealingSegment = "tournament" | "cash";

export function isCombinedShift(shift: Shift): boolean {
  return shift.type === "tournament_cash";
}

export function defaultSegmentForShift(shift: Shift): DealingSegment {
  if (shift.type === "cash") return "cash";
  return "tournament";
}

/** Segment stored on block, or inferred from shift type for legacy rows. */
export function resolveBlockSegment(block: DownBlock, shift: Shift): DealingSegment {
  if (block.segment) return block.segment;
  return defaultSegmentForShift(shift);
}

/** Active segment while dealing — only meaningful for combined shifts. */
export function resolveActiveSegment(shift: Shift): DealingSegment {
  if (isCombinedShift(shift)) return shift.active_segment ?? "tournament";
  return defaultSegmentForShift(shift);
}

export function isTournamentBlock(block: DownBlock, shift: Shift): boolean {
  return resolveBlockSegment(block, shift) === "tournament";
}

export function isTournamentStyleShift(shift: Shift, segment?: DealingSegment): boolean {
  if (shift.type === "tournament") return true;
  if (isCombinedShift(shift)) return (segment ?? resolveActiveSegment(shift)) === "tournament";
  return false;
}

export function isCashStyleShift(shift: Shift, segment?: DealingSegment): boolean {
  if (shift.type === "cash" || shift.type === "homegame") return shift.type === "cash";
  if (isCombinedShift(shift)) return (segment ?? resolveActiveSegment(shift)) === "cash";
  return false;
}

export function tournamentBlocksForShift(shift: Shift): DownBlock[] {
  if (shift.type === "tournament") return shift.blocks;
  if (isCombinedShift(shift)) return shift.blocks.filter((b) => b.segment === "tournament");
  return [];
}

export function cashBlocksForShift(shift: Shift): DownBlock[] {
  if (shift.type === "cash") return shift.blocks;
  if (isCombinedShift(shift)) return shift.blocks.filter((b) => b.segment === "cash");
  return [];
}

export function cashTipsFromBlocks(blocks: DownBlock[]): number {
  return blocks.filter((b) => b.status === "done").reduce((sum, b) => sum + b.tips, 0);
}

export function segmentDownCounts(shift: Shift): { tournament: number; cash: number } {
  const done = shift.blocks.filter((b) => b.status === "done");
  return {
    tournament: done.filter((b) => isTournamentBlock(b, shift)).length,
    cash: done.filter((b) => resolveBlockSegment(b, shift) === "cash").length,
  };
}

export function segmentBreakdownLabel(shift: Shift): string | null {
  if (!isCombinedShift(shift)) return null;
  const { tournament, cash } = segmentDownCounts(shift);
  return `Tournament: ${tournament} downs / Cash: ${cash} downs`;
}

export function shiftTypeLabel(type: ShiftType): string {
  switch (type) {
    case "tournament":
      return "Tournament";
    case "cash":
      return "Cash Game";
    case "homegame":
      return "Home Game";
    case "tournament_cash":
      return "Tournament + Cash Game";
  }
}

export interface CombinedShiftEarnings {
  tournament: number | null;
  cash: number;
  total: number;
}

export function combinedShiftEarnings(shift: Shift): CombinedShiftEarnings {
  const tournament = estimatedTournamentEarnings(tournamentBlocksForShift(shift), shift.hourly_rate);
  const cash = cashTipsFromBlocks(cashBlocksForShift(shift));
  return {
    tournament,
    cash,
    total: (tournament ?? 0) + cash,
  };
}

export function isHostessShift(shift: Shift): boolean {
  return shift.type === "homegame" && shift.role === "hostess";
}

/** Gross cash tips for a shift (cash-style blocks only). */
export function shiftCashGrossTips(shift: Shift): number {
  if (isHostessShift(shift)) return turnInsTotal(shift.turn_ins);
  if (shift.is_lump_sum) return shift.lump_sum_tips || 0;
  if (isCombinedShift(shift)) return cashTipsFromBlocks(cashBlocksForShift(shift));
  return shift.blocks.reduce((sum, b) => sum + (b.status === "done" ? b.tips : 0), 0);
}

/** Net amount owed for a hostess shift, after its chosen tax model. */
export function hostessNetTotal(shift: Shift): number {
  const gross = turnInsTotal(shift.turn_ins);
  return netAfterTax(
    gross,
    shift.tax_model,
    shift.house_tax_pct,
    shift.tiered_threshold,
    shift.tiered_rate_below,
    shift.tiered_rate_above
  );
}

/** Human-readable tax breakdown for a hostess shift's tax model. */
export function hostessTaxBreakdownLabel(shift: Shift): string {
  if (shift.tax_model === "tiered") {
    const gross = turnInsTotal(shift.turn_ins);
    const below = Math.min(gross, shift.tiered_threshold);
    const above = Math.max(0, gross - shift.tiered_threshold);
    return `${fmtMoney(below)} at ${shift.tiered_rate_below}% + ${fmtMoney(above)} at ${shift.tiered_rate_above}%`;
  }
  return `${shift.house_tax_pct}% house cut`;
}

/** Total dealer earnings for display/stats. */
export function shiftTotalEarnings(shift: Shift): number {
  if (isHostessShift(shift)) return hostessNetTotal(shift);
  if (shift.type === "tournament") {
    return estimatedTournamentEarnings(shift.blocks, shift.hourly_rate) ?? 0;
  }
  if (isCombinedShift(shift)) {
    return combinedShiftEarnings(shift).total;
  }
  const gross = shiftCashGrossTips(shift);
  return shift.house_tax_pct > 0 ? netTips(gross, shift.house_tax_pct) : gross;
}
