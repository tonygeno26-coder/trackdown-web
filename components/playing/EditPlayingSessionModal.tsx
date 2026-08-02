"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import { timeLocalToISO } from "@/lib/playing";
import { getGamingCategory, stakesOrMinimumLabel } from "@/lib/gaming";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
} from "@/components/playing/PlayingUi";
import { SheetFooter, TextInput, CurrencyInput } from "@/components/ui";

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

  const category = getGamingCategory(session);
  const [location, setLocation] = useState(session.location);
  const [game, setGame] = useState(session.game);
  const [stakes, setStakes] = useState(session.stakes);
  const [startTime, setStartTime] = useState(startLocal);
  const [initialBuyIn, setInitialBuyIn] = useState(String(session.initial_buy_in || ""));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    onSave({
      title: session.title,
      location,
      game,
      stakes,
      start_time: timeLocalToISO(startTime),
      initial_buy_in: parseFloat(initialBuyIn) || 0,
    });
  };

  return (
    <PlayingBottomSheet
      title="Edit Session"
      onClose={onCancel}
      footer={
        <SheetFooter>
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" form="edit-session-form" disabled={saving}>
            <Check size={16} aria-hidden />
            {saving ? "Saving…" : "Save"}
          </PrimaryPlayingButton>
        </SheetFooter>
      }
    >
      <form id="edit-session-form" onSubmit={submit} className="flex flex-col gap-4">
        <PlayingField label="Location">
          <TextInput value={location} onChange={(e) => setLocation(e.target.value)} />
        </PlayingField>

        <PlayingField label="Game">
          <TextInput required value={game} onChange={(e) => setGame(e.target.value)} />
        </PlayingField>

        <PlayingField label={stakesOrMinimumLabel(session)}>
          <TextInput value={stakes} onChange={(e) => setStakes(e.target.value)} />
        </PlayingField>

        <PlayingField label="Start time">
          <TextInput
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="font-mono"
          />
        </PlayingField>

        <PlayingField
          label={
            category === "poker" && session.session_type === "tournament"
              ? "Entry Cost"
              : "Starting Bankroll"
          }
        >
          <CurrencyInput
            required
            value={initialBuyIn}
            onChange={setInitialBuyIn}
          />
        </PlayingField>
      </form>
    </PlayingBottomSheet>
  );
}
