import { buildBlocks } from "./blocks";
import { Shift, PlayingSession } from "./types";

const previewStart = new Date();
previewStart.setMinutes(previewStart.getMinutes() - 45, 0, 0);

export function createPreviewDealerShift(): Shift {
  const startISO = previewStart.toISOString();
  const blocks = buildBlocks(startISO, 30).map((b, i) =>
    i < 2
      ? { ...b, status: "done" as const, table: `Table ${i + 12}`, tips: i === 0 ? 0 : 0 }
      : i === 2
        ? b
        : b
  );

  return {
    id: "preview-dealer-shift",
    type: "tournament",
    title: "Preview — Tournament Shift",
    down_length: 30,
    house_tax_pct: 0,
    is_lump_sum: false,
    lump_sum_tips: null,
    hourly_rate: 42,
    start_time: startISO,
    ended_at: null,
    settled_status: null,
    settled_amount: null,
    status: "active",
    blocks,
    created_at: startISO,
    is_demo: false,
  };
}

export function createPreviewGamingSession(): PlayingSession {
  const startISO = previewStart.toISOString();
  return {
    id: "preview-gaming-session",
    session_type: "cash",
    status: "active",
    title: "poker",
    location: "Preview Casino",
    game: "No-Limit Hold'em",
    stakes: "2/5 NLH",
    start_time: startISO,
    ended_at: null,
    initial_buy_in: 500,
    additional_buy_ins: 200,
    cash_out: null,
    expenses: 0,
    notes: "Preview gaming session — not saved to database",
    created_at: startISO,
    is_demo: false,
  };
}
