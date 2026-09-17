import { Shift, WeeklyRate } from "./types";
import { excludeDemoRecords } from "./data-filters";
import { shiftCashGrossTips, shiftTotalEarnings } from "./shift-segments";

export interface WeekPaySummary {
  weekStart: string; // YYYY-MM-DD, the Monday of the week
  tournamentDowns: number;
  downRate: number | null;
  tournamentPay: number | null;
  cashTotal: number;
  homegameTotal: number;
  weekTotal: number;
}

/** Monday (YYYY-MM-DD, local calendar date) of the week containing the given date. */
export function weekStartKey(dateInput: string | Date): string {
  const d = new Date(dateInput);
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** "Jan 5 – Jan 11, 2026" style label for a week's Monday key. */
export function formatWeekRange(weekStart: string): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  const monday = new Date(y, m - 1, d);
  const sunday = new Date(y, m - 1, d + 6);
  const startLabel = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

/** "This Week" for the current Monday-Sunday week, otherwise the date range. */
export function formatWeekLabel(weekStart: string, now: Date = new Date()): string {
  if (weekStart === weekStartKey(now)) return "This Week";
  return formatWeekRange(weekStart);
}

/**
 * Groups shifts (tournament, cash, homegame) by the Monday-Sunday week their
 * start_time falls in and combines each week with its posted down rate.
 *
 * Combined tournament_cash shifts are not yet broken into a Pay bucket (the
 * spec only enumerated tournament/cash/homegame) — a week containing only a
 * combined shift still appears, with zeros in all three buckets, rather than
 * being silently hidden.
 */
export function computeWeeklyPay(shifts: Shift[], rates: WeeklyRate[]): WeekPaySummary[] {
  const realShifts = excludeDemoRecords(shifts);
  const rateByWeek = new Map(rates.map((r) => [r.week_start, r.down_rate]));

  const weeks = new Map<string, { tournamentDowns: number; cashTotal: number; homegameTotal: number }>();

  for (const shift of realShifts) {
    const key = weekStartKey(shift.start_time);
    const entry = weeks.get(key) ?? { tournamentDowns: 0, cashTotal: 0, homegameTotal: 0 };
    if (shift.type === "tournament") {
      entry.tournamentDowns += shift.blocks.filter((b) => b.status === "done").length;
    } else if (shift.type === "cash") {
      entry.cashTotal += shiftCashGrossTips(shift);
    } else if (shift.type === "homegame") {
      entry.homegameTotal += shiftTotalEarnings(shift);
    }
    weeks.set(key, entry);
  }

  const summaries: WeekPaySummary[] = Array.from(weeks.entries()).map(([weekStart, agg]) => {
    const downRate = rateByWeek.get(weekStart) ?? null;
    const tournamentPay = downRate != null ? agg.tournamentDowns * downRate : null;
    return {
      weekStart,
      tournamentDowns: agg.tournamentDowns,
      downRate,
      tournamentPay,
      cashTotal: agg.cashTotal,
      homegameTotal: agg.homegameTotal,
      weekTotal: (tournamentPay ?? 0) + agg.cashTotal + agg.homegameTotal,
    };
  });

  summaries.sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1));
  return summaries;
}
