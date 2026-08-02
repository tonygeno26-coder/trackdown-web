"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Spade, Dice5, CircleDot, Trophy, MoreHorizontal, Coffee } from "lucide-react";
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
} from "@/components/playing/PlayingUi";
import {
  ChoiceButton,
  ChoiceGrid,
  SheetFooter,
  TextInput,
  CurrencyInput,
  TextareaInput,
} from "@/components/ui";

const CATEGORIES: { key: GamingCategory; label: string; icon: typeof Spade; supported: boolean }[] = [
  { key: "poker", label: "Poker", icon: Spade, supported: true },
  { key: "table_games", label: "Table Games", icon: Dice5, supported: true },
  { key: "slots", label: "Slots", icon: CircleDot, supported: false },
  { key: "sports_betting", label: "Sports Betting", icon: Trophy, supported: false },
  { key: "other", label: "Other", icon: MoreHorizontal, supported: false },
];

const POKER_TYPES: { key: PlayingSessionType; label: string; icon: typeof Coffee }[] = [
  { key: "cash", label: "Cash Game", icon: Coffee },
  { key: "tournament", label: "Tournament", icon: Spade },
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
    <PlayingBottomSheet
      title="Start Gaming Session"
      onClose={onCancel}
      footer={
        step === "form" ? (
          <SheetFooter>
            <SecondaryPlayingButton type="button" onClick={goBack} disabled={saving}>
              Back
            </SecondaryPlayingButton>
            <PrimaryPlayingButton type="submit" form="new-gaming-form" disabled={saving}>
              <Check size={16} aria-hidden />
              {saving ? "Starting…" : "Start Session"}
            </PrimaryPlayingButton>
          </SheetFooter>
        ) : undefined
      }
    >
      {step === "category" && (
        <>
          <p className="-mt-1 mb-3 text-[14px] text-td-muted">What are you playing?</p>
          <ChoiceGrid>
            {CATEGORIES.map(({ key, label, icon: Icon, supported }) => (
              <ChoiceButton
                key={key}
                icon={Icon}
                disabled={!supported}
                onClick={() => {
                  setCategory(key);
                  setStep(key === "poker" ? "poker_type" : "table_game");
                }}
              >
                {label}
                {!supported && (
                  <span className="text-[10px] font-normal text-td-muted">Coming soon</span>
                )}
              </ChoiceButton>
            ))}
          </ChoiceGrid>
        </>
      )}

      {step === "poker_type" && (
        <>
          <p className="-mt-1 mb-3 text-[14px] text-td-muted">Poker format</p>
          <ChoiceGrid>
            {POKER_TYPES.map(({ key, label, icon: Icon }) => (
              <ChoiceButton
                key={key}
                icon={Icon}
                onClick={() => {
                  setSessionType(key);
                  setStep("form");
                }}
              >
                {label}
              </ChoiceButton>
            ))}
          </ChoiceGrid>
          <div className="mt-4">
            <SecondaryPlayingButton type="button" onClick={goBack}>
              Back
            </SecondaryPlayingButton>
          </div>
        </>
      )}

      {step === "table_game" && (
        <>
          <p className="-mt-1 mb-3 text-[14px] text-td-muted">Select table game</p>
          <div className="grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto">
            {TABLE_GAMES.map((name) => (
              <ChoiceButton
                key={name}
                className="min-h-[48px] py-3 text-[12.5px]"
                onClick={() => {
                  setGame(name);
                  setStep("form");
                }}
              >
                {name}
              </ChoiceButton>
            ))}
          </div>
          <div className="mt-4">
            <SecondaryPlayingButton type="button" onClick={goBack}>
              Back
            </SecondaryPlayingButton>
          </div>
        </>
      )}

      {step === "form" && (
        <form id="new-gaming-form" onSubmit={submit} className="flex flex-col gap-4">
          <PlayingField label="Location">
            <TextInput
              placeholder="e.g. Bellagio"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoFocus
            />
          </PlayingField>

          {category === "poker" ? (
            <PlayingField label="Game">
              <TextInput
                required
                placeholder="e.g. No-Limit Hold'em"
                value={game}
                onChange={(e) => setGame(e.target.value)}
              />
            </PlayingField>
          ) : (
            game === "Other" && (
              <PlayingField label="Game name">
                <TextInput
                  required
                  placeholder="Enter game"
                  value={customGame}
                  onChange={(e) => setCustomGame(e.target.value)}
                />
              </PlayingField>
            )
          )}

          <PlayingField label={category === "poker" ? "Stakes (optional)" : "Table minimum"}>
            <TextInput
              placeholder={category === "poker" ? "e.g. 1/2 NLH" : "e.g. $25"}
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

          <PlayingField
            label={
              category === "poker" && sessionType === "tournament"
                ? "Entry Cost"
                : "Starting Bankroll"
            }
          >
            <CurrencyInput
              required
              placeholder="0"
              value={initialBuyIn}
              onChange={setInitialBuyIn}
            />
          </PlayingField>

          {category === "table_games" && (
            <PlayingField label="Notes (optional)">
              <TextareaInput
                placeholder="Optional session notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </PlayingField>
          )}
        </form>
      )}
    </PlayingBottomSheet>
  );
}
