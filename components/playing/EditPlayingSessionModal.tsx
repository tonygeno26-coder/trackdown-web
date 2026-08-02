"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import { timeLocalToISO } from "@/lib/playing";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
  playingInputClass,
} from "@/components/playing/PlayingUi";

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
    <PlayingBottomSheet title="Edit Session" onClose={onCancel}>
      <form onSubmit={submit} className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
        <PlayingField label="Session title">
          <input className={playingInputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </PlayingField>

        <PlayingField label="Location">
          <input
            className={playingInputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </PlayingField>

        <PlayingField label="Game">
          <input
            required
            className={playingInputClass}
            value={game}
            onChange={(e) => setGame(e.target.value)}
          />
        </PlayingField>

        <PlayingField label="Stakes">
          <input className={playingInputClass} value={stakes} onChange={(e) => setStakes(e.target.value)} />
        </PlayingField>

        <PlayingField label="Start time">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`${playingInputClass} font-mono`}
          />
        </PlayingField>

        <PlayingField label={session.session_type === "cash" ? "Initial Buy-in" : "Entry Cost"}>
          <div className="flex items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
            <span className="font-mono text-td-muted">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={initialBuyIn}
              onChange={(e) => setInitialBuyIn(e.target.value)}
              className="flex-1 border-none bg-transparent py-3 pl-1 font-mono font-semibold text-td-cream focus:outline-none"
            />
          </div>
        </PlayingField>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" disabled={saving}>
            <Check size={16} />
            {saving ? "Saving…" : "Save"}
          </PrimaryPlayingButton>
        </div>
      </form>
    </PlayingBottomSheet>
  );
}
