import { PlayingSession } from "./types";

export type PlayingDateRange = "week" | "month" | "year" | "all";
export type PlayingHistoryFilter = "all" | "cash" | "tournament" | "wins" | "losses";

export interface PlayingStatsSummary {
  totalNet: number;
  totalHours: number;
  overallHourly: number | null;
  sessionCount: number;
  winningSessions: number;
  losingSessions: number;
  winPercentage: number | null;
  biggestWin: number | null;
  biggestLoss: number | null;
}

export function parseAmount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function totalBuyIns(
  session: Pick<PlayingSession, "initial_buy_in" | "additional_buy_ins">
): number {
  return parseAmount(session.initial_buy_in) + parseAmount(session.additional_buy_ins);
}

export function netResult(
  session: Pick<PlayingSession, "initial_buy_in" | "additional_buy_ins" | "cash_out" | "expenses">
): number | null {
  if (session.cash_out == null) return null;
  return parseAmount(session.cash_out) - totalBuyIns(session) - parseAmount(session.expenses);
}

export function hoursPlayed(
  startTime: string,
  endedAt: string | null,
  now: Date = new Date()
): number | null {
  const start = new Date(startTime).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return (end - start) / 3600000;
}

export function sessionHourlyRate(
  session: Pick<
    PlayingSession,
    "start_time" | "ended_at" | "initial_buy_in" | "additional_buy_ins" | "cash_out" | "expenses"
  >
): number | null {
  const net = netResult(session);
  const hours = hoursPlayed(session.start_time, session.ended_at);
  if (net == null || hours == null || hours <= 0) return null;
  return net / hours;
}

export function formatDuration(hours: number | null): string {
  if (hours == null || hours <= 0) return "0m";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatMoneyPrecise(n: number): string {
  return (Number(n) || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSignedMoney(n: number): string {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}${formatMoneyPrecise(Math.abs(n))}`;
}

export function netResultColorClass(n: number | null): string {
  if (n == null || n === 0) return "text-td-cream";
  return n > 0 ? "text-td-goldsoft" : "text-red-300";
}

export function sessionInDateRange(session: PlayingSession, range: PlayingDateRange): boolean {
  if (range === "all") return true;
  const start = new Date(session.start_time);
  const now = new Date();
  if (range === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return start >= weekAgo;
  }
  if (range === "month") {
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
  }
  if (range === "year") {
    return start.getFullYear() === now.getFullYear();
  }
  return true;
}

export function computePlayingStats(sessions: PlayingSession[]): PlayingStatsSummary {
  const completed = sessions.filter((s) => s.status === "completed" && s.cash_out != null);
  let totalNet = 0;
  let totalHours = 0;
  let winningSessions = 0;
  let losingSessions = 0;
  let biggestWin: number | null = null;
  let biggestLoss: number | null = null;

  for (const s of completed) {
    const net = netResult(s);
    const hours = hoursPlayed(s.start_time, s.ended_at);
    if (net == null || hours == null) continue;
    totalNet += net;
    totalHours += hours;
    if (net > 0) {
      winningSessions++;
      biggestWin = biggestWin == null ? net : Math.max(biggestWin, net);
    } else if (net < 0) {
      losingSessions++;
      biggestLoss = biggestLoss == null ? net : Math.min(biggestLoss, net);
    }
  }

  return {
    totalNet,
    totalHours,
    overallHourly: totalHours > 0 ? totalNet / totalHours : null,
    sessionCount: completed.length,
    winningSessions,
    losingSessions,
    winPercentage: completed.length > 0 ? (winningSessions / completed.length) * 100 : null,
    biggestWin,
    biggestLoss,
  };
}

export function currentTimeLocal(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function timeLocalToISO(time: string): string {
  const [hh, mm] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

export function sessionTypeLabel(type: PlayingSession["session_type"]): string {
  return type === "cash" ? "Cash Game" : "Tournament";
}

export function cashOutLabel(type: PlayingSession["session_type"]): string {
  return type === "cash" ? "Cash Out" : "Total Winnings";
}

export function initialBuyInLabel(type: PlayingSession["session_type"]): string {
  return type === "cash" ? "Initial Buy-in" : "Entry Cost";
}
