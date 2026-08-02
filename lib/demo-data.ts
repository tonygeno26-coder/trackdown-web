import { supabase } from "./supabase";
import { buildBlocks } from "./blocks";
import { Shift, PlayingSession } from "./types";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function shiftEnd(startISO: string, hours: number): string {
  return new Date(new Date(startISO).getTime() + hours * 3600000).toISOString();
}

export async function seedDemoData(): Promise<{ error: string | null }> {
  const cleared = await clearDemoData();
  if (cleared.error) return cleared;

  const tournamentStart = hoursAgo(48);
  const cashStart = hoursAgo(36);
  const homeStart = hoursAgo(24);
  const homeUnsettledStart = hoursAgo(12);

  const tournamentBlocks = buildBlocks(tournamentStart, 30).map((b, i) =>
    i < 6 ? { ...b, status: "done" as const, table: `Table ${i + 1}`, tips: 0 } : b
  );

  const cashBlocks = buildBlocks(cashStart, 30).map((b, i) =>
    i < 8 ? { ...b, status: "done" as const, game: "1/2 NLH", table: `Table ${i + 3}`, tips: 45 + i * 5 } : b
  );

  const homeBlocks = buildBlocks(homeUnsettledStart, 30).map((b, i) =>
    i < 4 ? { ...b, status: "done" as const, game: "1/2 NLH", tips: 30 + i * 10 } : b
  );

  const shifts: Partial<Shift>[] = [
    {
      type: "tournament",
      title: "Demo — WSOP Tournament",
      down_length: 30,
      start_time: tournamentStart,
      ended_at: shiftEnd(tournamentStart, 8),
      status: "completed",
      hourly_rate: 35,
      house_tax_pct: 0,
      is_lump_sum: false,
      blocks: tournamentBlocks,
      is_demo: true,
    },
    {
      type: "cash",
      title: "Demo — Bellagio $2/$5",
      down_length: 30,
      start_time: cashStart,
      ended_at: shiftEnd(cashStart, 6),
      status: "completed",
      hourly_rate: null,
      house_tax_pct: 0,
      is_lump_sum: false,
      blocks: cashBlocks,
      is_demo: true,
    },
    {
      type: "homegame",
      title: "Demo — Friday Home Game",
      down_length: 30,
      start_time: homeStart,
      ended_at: shiftEnd(homeStart, 5),
      status: "completed",
      hourly_rate: null,
      house_tax_pct: 10,
      is_lump_sum: true,
      lump_sum_tips: 420,
      settled_status: "yes",
      settled_amount: 378,
      blocks: buildBlocks(homeStart, 30),
      is_demo: true,
    },
    {
      type: "homegame",
      title: "Demo — Unsettled Home Game",
      down_length: 30,
      start_time: homeUnsettledStart,
      ended_at: shiftEnd(homeUnsettledStart, 4),
      status: "completed",
      hourly_rate: null,
      house_tax_pct: 15,
      is_lump_sum: false,
      blocks: homeBlocks,
      settled_status: "no",
      settled_amount: null,
      is_demo: true,
    },
  ];

  const sessions: Partial<PlayingSession>[] = [
    {
      title: "poker",
      session_type: "cash",
      status: "completed",
      location: "Bellagio",
      game: "No-Limit Hold'em",
      stakes: "2/5 NLH",
      start_time: hoursAgo(30),
      ended_at: shiftEnd(hoursAgo(30), 5),
      initial_buy_in: 500,
      additional_buy_ins: 200,
      cash_out: 1150,
      expenses: 25,
      notes: "Demo winning poker cash session",
      is_demo: true,
    },
    {
      title: "poker",
      session_type: "cash",
      status: "completed",
      location: "Aria",
      game: "No-Limit Hold'em",
      stakes: "1/3 NLH",
      start_time: hoursAgo(20),
      ended_at: shiftEnd(hoursAgo(20), 4),
      initial_buy_in: 300,
      additional_buy_ins: 0,
      cash_out: 120,
      expenses: 15,
      notes: "Demo losing poker session",
      is_demo: true,
    },
    {
      title: "poker",
      session_type: "tournament",
      status: "completed",
      location: "Wynn",
      game: "No-Limit Hold'em",
      stakes: "$600 Main Event",
      start_time: hoursAgo(72),
      ended_at: shiftEnd(hoursAgo(72), 10),
      initial_buy_in: 600,
      additional_buy_ins: 600,
      cash_out: 2800,
      expenses: 40,
      notes: "Demo tournament session with re-entry",
      is_demo: true,
    },
    {
      title: "table_games",
      session_type: "cash",
      status: "completed",
      location: "Cosmopolitan",
      game: "Blackjack",
      stakes: "$25",
      start_time: hoursAgo(16),
      ended_at: shiftEnd(hoursAgo(16), 3),
      initial_buy_in: 400,
      additional_buy_ins: 200,
      cash_out: 720,
      expenses: 0,
      notes: "Demo — Blackjack Session",
      is_demo: true,
    },
    {
      title: "table_games",
      session_type: "cash",
      status: "completed",
      location: "Caesars",
      game: "Craps",
      stakes: "$15",
      start_time: hoursAgo(8),
      ended_at: shiftEnd(hoursAgo(8), 2.5),
      initial_buy_in: 300,
      additional_buy_ins: 100,
      cash_out: 180,
      expenses: 20,
      notes: "Demo craps session",
      is_demo: true,
    },
  ];

  const { error: shiftErr } = await supabase.from("shifts").insert(shifts);
  if (shiftErr) return { error: shiftErr.message };

  const { error: sessionErr } = await supabase.from("playing_sessions").insert(sessions);
  if (sessionErr) return { error: sessionErr.message };

  return { error: null };
}

export async function clearDemoData(): Promise<{ error: string | null }> {
  const { error: shiftErr } = await supabase.from("shifts").delete().eq("is_demo", true);
  if (shiftErr) return { error: shiftErr.message };

  const { error: sessionErr } = await supabase.from("playing_sessions").delete().eq("is_demo", true);
  if (sessionErr) return { error: sessionErr.message };

  return { error: null };
}

export async function countDemoRecords(): Promise<{
  shifts: number;
  sessions: number;
  error: string | null;
}> {
  const [shiftsRes, sessionsRes] = await Promise.all([
    supabase.from("shifts").select("id", { count: "exact", head: true }).eq("is_demo", true),
    supabase.from("playing_sessions").select("id", { count: "exact", head: true }).eq("is_demo", true),
  ]);

  if (shiftsRes.error) return { shifts: 0, sessions: 0, error: shiftsRes.error.message };
  if (sessionsRes.error) return { shifts: 0, sessions: 0, error: sessionsRes.error.message };

  return {
    shifts: shiftsRes.count || 0,
    sessions: sessionsRes.count || 0,
    error: null,
  };
}
