"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import { timeLocalToISO } from "@/lib/playing";

export default function EditPlayingSessionModal({
  session,
  onCancel,
  onSave,
  saving,
}: {
  session: PlayingSession;
  onCancel: () => void;
  onSave: (updates: {
    title: string;
    location: string;
    game: string;
    stakes: string;
    start_time: string;
    initial_buy_in: number;
  }) => void;
  saving: boolean;
}) {
  const startLocal = (() => {
    const d = new Date(session.start_time);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  })();

  const [title, setTitle] = useState(session.title);
  const [location, setLocation] = useState(session.location);
  const [game, setGame] = useState(session.game);
  const [stakes, setStakes] = useState(session.stakes);
  const [startTime, setStartTime] = useState(startLocal);
  const [initialBuyIn, setInitialBuyIn] = useState(String(session.initial_buy_in || ""));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    onSave({
      title,
      location,
      game,
      stakes,
      start_time: timeLocalToISO(startTime),
      initial_buy_in: parseFloat(initialBuyIn) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75" onClick={onCancel}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-[460px] bg-td-surface border border-td-border rounded-t-2xl px-5 pt-5 pb-6 flex flex-col gap-3.5 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-lg tracking-wide">Edit session</h2>
          <button type="button" onClick={onCancel} className="text-td-muted hover:text-td-cream p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Session title</span>
          <input
            className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Location</span>
          <input
            className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Game</span>
          <input
            required
            className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
            value={game}
            onChange={(e) => setGame(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Stakes</span>
          <input
            className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
            value={stakes}
            onChange={(e) => setStakes(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Start time</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] font-mono focus:outline focus:outline-2 focus:outline-td-gold"
          />
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>{session.session_type === "cash" ? "Initial Buy-in" : "Entry Cost"}</span>
          <div className="flex items-center bg-td-bg border border-td-border rounded-[9px] px-3">
            <span className="font-mono text-td-muted">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={initialBuyIn}
              onChange={(e) => setInitialBuyIn(e.target.value)}
              className="bg-transparent border-none py-2.5 px-1 font-mono font-semibold flex-1 focus:outline-none text-td-cream"
            />
          </div>
        </label>

        <div className="flex gap-2.5 mt-1.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-[10px] py-3 font-bold text-sm bg-td-gold text-[#1a1305] disabled:opacity-40 hover:enabled:bg-td-goldsoft"
          >
            <Check size={16} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
