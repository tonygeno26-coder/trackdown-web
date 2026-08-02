"use client";

import { useState } from "react";
import { Check, Coffee, Spade } from "lucide-react";
import { PlayingSessionType } from "@/lib/types";
import { currentTimeLocal, timeLocalToISO } from "@/lib/playing";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
  playingInputClass,
} from "@/components/playing/PlayingUi";

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
    <PlayingBottomSheet title="Start Session" onClose={onCancel}>
      {!type ? (
        <>
          <p className="-mt-1 text-[14px] text-td-muted">What are you playing?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("cash")}
              className="flex flex-col items-center gap-3 rounded-td border border-td-border/90 bg-td-surface2/70 py-7 font-semibold text-[13px] transition-colors hover:border-td-gold/40"
            >
              <Coffee size={24} strokeWidth={1.75} className="text-td-gold" />
              <span>Cash Game</span>
            </button>
            <button
              type="button"
              onClick={() => setType("tournament")}
              className="flex flex-col items-center gap-3 rounded-td border border-td-border/90 bg-td-surface2/70 py-7 font-semibold text-[13px] transition-colors hover:border-td-gold/40"
            >
              <Spade size={24} strokeWidth={1.75} className="text-td-gold" />
              <span>Tournament</span>
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <PlayingField label="Session title (optional)">
            <input
              className={playingInputClass}
              placeholder="e.g. Friday night session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </PlayingField>

          <PlayingField label="Location (optional)">
            <input
              className={playingInputClass}
              placeholder="e.g. Bellagio"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </PlayingField>

          <PlayingField label="Game">
            <input
              required
              className={playingInputClass}
              placeholder="e.g. No-Limit Hold'em"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              autoFocus
            />
          </PlayingField>

          <PlayingField label="Stakes (optional)">
            <input
              className={playingInputClass}
              placeholder={type === "cash" ? "e.g. 1/2 NLH" : "e.g. $600 Main Event"}
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
            />
          </PlayingField>

          <PlayingField label="Start time">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`${playingInputClass} font-mono`}
            />
          </PlayingField>

          <PlayingField label={type === "cash" ? "Initial Buy-in" : "Entry Cost"}>
            <div className="flex items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
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
                className="flex-1 border-none bg-transparent py-3 pl-1 font-mono font-semibold text-td-cream focus:outline-none"
              />
            </div>
          </PlayingField>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <SecondaryPlayingButton type="button" onClick={() => setType(null)} disabled={saving}>
              Back
            </SecondaryPlayingButton>
            <PrimaryPlayingButton type="submit" disabled={saving}>
              <Check size={16} />
              {saving ? "Starting…" : "Start Session"}
            </PrimaryPlayingButton>
          </div>
        </form>
      )}
    </PlayingBottomSheet>
  );
}
