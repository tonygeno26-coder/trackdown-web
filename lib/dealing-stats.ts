import { Shift } from "./types";
import {
  estimatedTournamentEarnings,
  fmtMoneyPrecise,
  netTips,
  scheduledHoursFromBlocks,
} from "./blocks";
import { hoursPlayed } from "./playing";

export interface DealingStatsSummary {
  tournamentEarnings: number;
  cashTips: number;
  homeGameEarnings: number;
  totalEarnings: number;
  downsWorked: number;
  hoursDealt: number;
  hourlyRate: number | null;
}

function shiftGrossTips(shift: Shift): number {
  if (shift.is_lump_sum) return shift.lump_sum_tips || 0;
  return shift.blocks.reduce((sum, b) => sum + (b.status === "done" ? b.tips : 0), 0);
}

function shiftEarnings(shift: Shift): number {
  if (shift.type === "tournament") {
    return estimatedTournamentEarnings(shift.blocks, shift.hourly_rate) || 0;
  }
  const gross = shiftGrossTips(shift);
  return shift.house_tax_pct > 0 ? netTips(gross, shift.house_tax_pct) : gross;
}

function shiftHours(shift: Shift): number {
  if (shift.ended_at) {
    return hoursPlayed(shift.start_time, shift.ended_at) || scheduledHoursFromBlocks(shift.blocks);
  }
  return scheduledHoursFromBlocks(shift.blocks);
}

export function computeDealingStats(shifts: Shift[]): DealingStatsSummary {
  const completed = shifts.filter((s) => s.status === "completed");
  let tournamentEarnings = 0;
  let cashTips = 0;
  let homeGameEarnings = 0;
  let downsWorked = 0;
  let hoursDealt = 0;

  for (const shift of completed) {
    const earnings = shiftEarnings(shift);
    const hours = shiftHours(shift);
    hoursDealt += hours;
    downsWorked += shift.blocks.filter((b) => b.status === "done").length;

    if (shift.type === "tournament") tournamentEarnings += earnings;
    else if (shift.type === "cash") cashTips += earnings;
    else homeGameEarnings += earnings;
  }

  const totalEarnings = tournamentEarnings + cashTips + homeGameEarnings;

  return {
    tournamentEarnings,
    cashTips,
    homeGameEarnings,
    totalEarnings,
    downsWorked,
    hoursDealt,
    hourlyRate: hoursDealt > 0 ? totalEarnings / hoursDealt : null,
  };
}

export function formatDealerEarnings(n: number): string {
  return fmtMoneyPrecise(n);
}
