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
} from "@/components/playing/PlayingUi";
import {
  ChoiceButton,
  ChoiceGrid,
  SheetFooter,
  TextInput,
  CurrencyInput,
} from "@/components/ui";

const SESSION_TYPES: { key: PlayingSessionType; label: string; icon: typeof Coffee }[] = [
  { key: "cash", label: "Cash Game", icon: Coffee },
  { key: "tournament", label: "Tournament", icon: Spade },
];

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
    <PlayingBottomSheet
      title="Start Session"
      onClose={onCancel}
      footer={
        type ? (
          <SheetFooter>
            <SecondaryPlayingButton type="button" onClick={() => setType(null)} disabled={saving}>
              Back
            </SecondaryPlayingButton>
            <PrimaryPlayingButton type="submit" form="new-playing-form" disabled={saving}>
              <Check size={16} aria-hidden />
              {saving ? "Starting…" : "Start Session"}
            </PrimaryPlayingButton>
          </SheetFooter>
        ) : undefined
      }
    >
      {!type ? (
        <>
          <p className="-mt-1 mb-3 text-[14px] text-td-muted">What are you playing?</p>
          <ChoiceGrid>
            {SESSION_TYPES.map(({ key, label, icon: Icon }) => (
              <ChoiceButton key={key} icon={Icon} onClick={() => setType(key)}>
                {label}
              </ChoiceButton>
            ))}
          </ChoiceGrid>
        </>
      ) : (
        <form id="new-playing-form" onSubmit={submit} className="flex flex-col gap-4">
          <PlayingField label="Session title (optional)">
            <TextInput
              placeholder="e.g. Friday night session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </PlayingField>

          <PlayingField label="Location (optional)">
            <TextInput
              placeholder="e.g. Bellagio"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </PlayingField>

          <PlayingField label="Game">
            <TextInput
              required
              placeholder="e.g. No-Limit Hold'em"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              autoFocus
            />
          </PlayingField>

          <PlayingField label="Stakes (optional)">
            <TextInput
              placeholder={type === "cash" ? "e.g. 1/2 NLH" : "e.g. $600 Main Event"}
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
            />
          </PlayingField>

          <PlayingField label="Start time">
            <TextInput
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="font-mono"
            />
          </PlayingField>

          <PlayingField label={type === "cash" ? "Initial Buy-in" : "Entry Cost"}>
            <CurrencyInput
              required
              placeholder="0"
              value={initialBuyIn}
              onChange={setInitialBuyIn}
            />
          </PlayingField>
        </form>
      )}
    </PlayingBottomSheet>
  );
}
