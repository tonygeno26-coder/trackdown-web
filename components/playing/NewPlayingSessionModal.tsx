"use client";

import { useState } from "react";
import { X, Check, Coffee, Spade } from "lucide-react";
import { PlayingSessionType } from "@/lib/types";
import { currentTimeLocal, timeLocalToISO } from "@/lib/playing";

export default function NewPlayingSessionModal({
  onCancel,
  onCreate,
  saving,
}: {
  onCancel: () => void;
  onCreate: (data: {
    session_type: PlayingSessionType;
    title: string;
    location: string;
    game: string;
    stakes: string;
    start_time: string;
    initial_buy_in: number;
  }) => void;
  saving: boolean;
}) {
  const [type, setType] = useState<PlayingSessionType | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [game, setGame] = useState("");
  const [stakes, setStakes] = useState("");
  const [startTime, setStartTime] = useState(currentTimeLocal());
  const [initialBuyIn, setInitialBuyIn] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || saving) return;
    onCreate({
      session_type: type,
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
          <h2 className="font-display font-bold text-lg tracking-wide">Start playing session</h2>
          <button type="button" onClick={onCancel} className="text-td-muted hover:text-td-cream p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {!type ? (
          <>
            <p className="text-[13.5px] text-td-muted -mt-1.5">What are you playing?</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setType("cash")}
                className="flex-1 flex flex-col items-center gap-2 bg-td-surface2 border-[1.5px] border-td-border rounded-xl py-5 px-2.5 font-semibold text-[13.5px] hover:border-td-gold"
              >
                <Coffee size={22} />
                <span>Cash Game</span>
              </button>
              <button
                type="button"
                onClick={() => setType("tournament")}
                className="flex-1 flex flex-col items-center gap-2 bg-td-surface2 border-[1.5px] border-td-border rounded-xl py-5 px-2.5 font-semibold text-[13.5px] hover:border-td-gold"
              >
                <Spade size={22} />
                <span>Tournament</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
              <span>Session title (optional)</span>
              <input
                className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
                placeholder="e.g. Friday night session"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
              <span>Location (optional)</span>
              <input
                className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
                placeholder="e.g. Bellagio"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
              <span>Game</span>
              <input
                required
                className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
                placeholder="e.g. No-Limit Hold'em"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                autoFocus
              />
            </label>

            <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
              <span>Stakes (optional)</span>
              <input
                className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
                placeholder={type === "cash" ? "e.g. 1/2 NLH" : "e.g. $600 Main Event"}
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
              <span>{type === "cash" ? "Initial Buy-in" : "Entry Cost"}</span>
              <div className="flex items-center bg-td-bg border border-td-border rounded-[9px] px-3">
                <span className="font-mono text-td-muted">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0"
                  value={initialBuyIn}
                  onChange={(e) => setInitialBuyIn(e.target.value)}
                  className="bg-transparent border-none py-2.5 px-1 font-mono font-semibold flex-1 focus:outline-none text-td-cream"
                />
              </div>
            </label>

            <div className="flex gap-2.5 mt-1.5">
              <button
                type="button"
                onClick={() => setType(null)}
                disabled={saving}
                className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-[10px] py-3 font-bold text-sm bg-td-gold text-[#1a1305] disabled:opacity-40 hover:enabled:bg-td-goldsoft"
              >
                <Check size={16} /> {saving ? "Starting…" : "Start session"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
