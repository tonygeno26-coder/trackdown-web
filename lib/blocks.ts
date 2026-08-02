import { DownBlock } from "./types";

const SHIFT_MINUTES = 8 * 60;

export function uid(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildBlocks(startISO: string, downLength: number): DownBlock[] {
  const count = Math.round(SHIFT_MINUTES / downLength);
  const start = new Date(startISO);
  const blocks: DownBlock[] = [];
  for (let i = 0; i < count; i++) {
    const s = new Date(start.getTime() + i * downLength * 60000);
    const e = new Date(start.getTime() + (i + 1) * downLength * 60000);
    blocks.push({
      id: uid(),
      index: i,
      scheduledStart: s.toISOString(),
      scheduledEnd: e.toISOString(),
      status: "pending",
      tournament: "",
      table: "",
      game: "",
      tips: 0,
      notes: "",
    });
  }
  return blocks;
}

export function extendBlocks(existingBlocks: DownBlock[], downLength: number, additionalMinutes: number): DownBlock[] {
  const count = Math.round(additionalMinutes / downLength);
  const lastBlock = existingBlocks[existingBlocks.length - 1];
  const start = new Date(lastBlock.scheduledEnd);
  const startIndex = lastBlock.index + 1;
  const newBlocks: DownBlock[] = [];
  for (let i = 0; i < count; i++) {
    const s = new Date(start.getTime() + i * downLength * 60000);
    const e = new Date(start.getTime() + (i + 1) * downLength * 60000);
    newBlocks.push({
      id: uid(),
      index: startIndex + i,
      scheduledStart: s.toISOString(),
      scheduledEnd: e.toISOString(),
      status: "pending",
      tournament: "",
      table: "",
      game: "",
      tips: 0,
      notes: "",
    });
  }
  return [...existingBlocks, ...newBlocks];
}

export function scheduledHoursFromBlocks(blocks: DownBlock[]): number {
  if (blocks.length === 0) return 0;
  const start = new Date(blocks[0].scheduledStart).getTime();
  const end = new Date(blocks[blocks.length - 1].scheduledEnd).getTime();
  return (end - start) / (1000 * 60 * 60);
}

export function estimatedTournamentEarnings(blocks: DownBlock[], hourlyRate: number | null): number | null {
  if (hourlyRate == null) return null;
  return hourlyRate * scheduledHoursFromBlocks(blocks);
}

export function netTips(grossTips: number, taxPct: number): number {
  return grossTips * (1 - taxPct / 100);
}

export function isNowWithin(startISO: string, endISO: string): boolean {
  const now = Date.now();
  return now >= new Date(startISO).getTime() && now < new Date(endISO).getTime();
}

export function fmtMoney(n: number): string {
  const v = Number(n) || 0;
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function fmtMoneyPrecise(n: number): string {
  const v = Number(n) || 0;
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtHourlyRate(n: number): string {
  return `${fmtMoneyPrecise(n)}/hr`;
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function fmtDateHeader(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
