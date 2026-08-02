"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Spade, Dice5, CircleDot, Trophy, MoreHorizontal } from "lucide-react";
import { PlayingSessionType } from "@/lib/types";
import { GamingCategory, TABLE_GAME_OPTIONS } from "@/lib/gaming";
import { currentTimeLocal, timeLocalToISO } from "@/lib/playing";
import { tableMinimumInputValue } from "@/lib/settings";
import { useAppSettings } from "@/components/settings/AppSettingsContext";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
  playingInputClass,
} from "@/components/playing/PlayingUi";

const CATEGORIES: { key: GamingCategory; label: string; icon: typeof Spade; supported: boolean }[] = [
  { key: "poker", label: "Poker", icon: Spade, supported: true },
  { key: "table_games", label: "Table Games", icon: Dice5, supported: true },
  { key: "slots", label: "Slots", icon: CircleDot, supported: false },
  { key: "sports_betting", label: "Sports Betting", icon: Trophy, supported: false },
  { key: "other", label: "Other", icon: MoreHorizontal, supported: false },
];

const POKER_TYPES: { key: PlayingSessionType; label: string }[] = [
  { key: "cash", label: "Cash Game" },
  { key: "tournament", label: "Tournament" },
];

const TABLE_GAMES = [...TABLE_GAME_OPTIONS];

type Step = "category" | "poker_type" | "table_game" | "form";

export default function NewGamingSessionModal({
  onCancel,
  onCreate,
  saving,
}: {
  onCancel: () => void;
  onCreate: (data: {
    category: GamingCategory;
    session_type: PlayingSessionType;
    location: string;
    game: string;
    stakes: string;
    start_time: string;
    initial_buy_in: number;
    notes: string;
  }) => void;
  saving: boolean;
}) {
  const { settings } = useAppSettings();
  const appliedFormDefaults = useRef(false);
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<GamingCategory | null>(null);
  const [sessionType, setSessionType] = useState<PlayingSessionType>("cash");
  const [location, setLocation] = useState("");
  const [game, setGame] = useState("");
  const [customGame, setCustomGame] = useState("");
  const [stakes, setStakes] = useState("");
  const [startTime, setStartTime] = useState(currentTimeLocal());
  const [initialBuyIn, setInitialBuyIn] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (step !== "form" || !settings || appliedFormDefaults.current) return;
    appliedFormDefaults.current = true;
    if (settings.default_location) setLocation(settings.default_location);
    if (category === "poker") {
      if (settings.default_poker_game) setGame(settings.default_poker_game);
      if (settings.default_poker_stakes) setStakes(settings.default_poker_stakes);
    } else if (category === "table_games") {
      if (settings.default_table_game) setGame(settings.default_table_game);
      const min = tableMinimumInputValue(settings.default_table_minimum);
      if (min) setStakes(min);
    }
  }, [step, category, settings]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || saving) return;
    const resolvedGame = game === "Other" ? customGame : game;
    onCreate({
      category,
      session_type: category === "poker" ? sessionType : "cash",
      location,
      game: resolvedGame,
      stakes,
      start_time: timeLocalToISO(startTime),
      initial_buy_in: parseFloat(initialBuyIn) || 0,
      notes,
    });
  };

  const goBack = () => {
    if (step === "form") {
      setStep(category === "poker" ? "poker_type" : "table_game");
    } else if (step === "poker_type" || step === "table_game") {
      setStep("category");
      setCategory(null);
    } else {
      onCancel();
    }
  };

  return (
    <PlayingBottomSheet title="Start Gaming Session" onClose={onCancel}>
      {step === "category" && (
        <>
          <p className="-mt-1 text-[14px] text-td-muted">What are you playing?</p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(({ key, label, icon: Icon, supported }) => (
              <button
                key={key}
                type="button"
                disabled={!supported}
                onClick={() => {
                  setCategory(key);
                  setStep(key === "poker" ? "poker_type" : "table_game");
                }}
                className="flex flex-col items-center gap-3 rounded-td border border-td-border/90 bg-td-surface2/70 py-6 font-semibold text-[13px] transition-colors hover:border-td-gold/40 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Icon size={24} strokeWidth={1.75} className="text-td-gold" />
                <span>{label}</span>
                {!supported && <span className="text-[10px] font-normal text-td-muted">Coming soon</span>}
              </button>
            ))}
          </div>
        </>
      )}

      {step === "poker_type" && (
        <>
          <p className="-mt-1 text-[14px] text-td-muted">Poker format</p>
          <div className="grid grid-cols-2 gap-3">
            {POKER_TYPES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSessionType(key);
                  setStep("form");
                }}
                className="rounded-td border border-td-border/90 bg-td-surface2/70 py-6 font-semibold text-[13px] hover:border-td-gold/40"
              >
                {label}
              </button>
            ))}
          </div>
          <SecondaryPlayingButton type="button" onClick={goBack}>
            Back
          </SecondaryPlayingButton>
        </>
      )}

      {step === "table_game" && (
        <>
          <p className="-mt-1 text-[14px] text-td-muted">Select table game</p>
          <div className="grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto">
            {TABLE_GAMES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setGame(name);
                  setStep("form");
                }}
                className="rounded-xl border border-td-border/90 bg-td-surface2/70 px-3 py-3 text-[12.5px] font-semibold hover:border-td-gold/40"
              >
                {name}
              </button>
            ))}
          </div>
          <SecondaryPlayingButton type="button" onClick={goBack}>
            Back
          </SecondaryPlayingButton>
        </>
      )}

      {step === "form" && (
        <form onSubmit={submit} className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
          <PlayingField label="Location">
            <input
              className={playingInputClass}
              placeholder="e.g. Bellagio"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoFocus
            />
          </PlayingField>

          {category === "poker" ? (
            <PlayingField label="Game">
              <input
                required
                className={playingInputClass}
                placeholder="e.g. No-Limit Hold'em"
                value={game}
                onChange={(e) => setGame(e.target.value)}
              />
            </PlayingField>
          ) : (
            game === "Other" && (
              <PlayingField label="Game name">
                <input
                  required
                  className={playingInputClass}
                  placeholder="Enter game"
                  value={customGame}
                  onChange={(e) => setCustomGame(e.target.value)}
                />
              </PlayingField>
            )
          )}

          <PlayingField label={category === "poker" ? "Stakes (optional)" : "Table minimum"}>
            <input
              className={playingInputClass}
              placeholder={category === "poker" ? "e.g. 1/2 NLH" : "e.g. $25"}
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

          <PlayingField
            label={
              category === "poker" && sessionType === "tournament"
                ? "Entry Cost"
                : "Starting Bankroll"
            }
          >
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

          {category === "table_games" && (
            <PlayingField label="Notes (optional)">
              <textarea
                className={`${playingInputClass} min-h-[80px] resize-none`}
                placeholder="Optional session notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </PlayingField>
          )}

          <div className="mt-2 grid grid-cols-2 gap-3">
            <SecondaryPlayingButton type="button" onClick={goBack} disabled={saving}>
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
