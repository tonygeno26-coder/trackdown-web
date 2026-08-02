"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import { SavedHandInput, POKER_POSITIONS, HAND_RESULT_OPTIONS } from "@/lib/hands/types";
import { parseActionHistoryText } from "@/lib/hands/replay-strategy";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
  playingInputClass,
} from "@/components/playing/PlayingUi";

export interface HandBuilderDefaults {
  session_id?: string | null;
  casino?: string;
  game?: string;
  stakes?: string;
  played_at?: string;
}

export default function HandBuilderModal({
  defaults,
  onCancel,
  onSave,
  saving,
}: {
  defaults?: HandBuilderDefaults;
  onCancel: () => void;
  onSave: (input: SavedHandInput) => void;
  saving: boolean;
}) {
  const [casino, setCasino] = useState(defaults?.casino ?? "");
  const [game, setGame] = useState(defaults?.game ?? "");
  const [stakes, setStakes] = useState(defaults?.stakes ?? "");
  const [playedAt, setPlayedAt] = useState(
    defaults?.played_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  );
  const [heroPosition, setHeroPosition] = useState("BTN");
  const [villainPosition, setVillainPosition] = useState("BB");
  const [effectiveStack, setEffectiveStack] = useState("100bb");
  const [heroCards, setHeroCards] = useState("");
  const [boardCards, setBoardCards] = useState("");
  const [actionText, setActionText] = useState(
    "preflop\nHero: raise\nVillain: call\n\nflop\nHero: bet\nVillain: call"
  );
  const [result, setResult] = useState("Unknown");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    onSave({
      session_id: defaults?.session_id ?? null,
      casino,
      game,
      stakes,
      played_at: new Date(playedAt).toISOString(),
      hero_position: heroPosition,
      villain_position: villainPosition,
      effective_stack: effectiveStack,
      hero_cards: heroCards,
      board_cards: boardCards,
      action_history: parseActionHistoryText(actionText),
      result,
      notes,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <PlayingBottomSheet title="Save Hand" onClose={onCancel}>
      <form onSubmit={submit} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
        <PlayingField label="Casino">
          <input className={playingInputClass} value={casino} onChange={(e) => setCasino(e.target.value)} placeholder="e.g. Bellagio" />
        </PlayingField>
        <PlayingField label="Game">
          <input className={playingInputClass} value={game} onChange={(e) => setGame(e.target.value)} placeholder="e.g. NLHE" required />
        </PlayingField>
        <PlayingField label="Stakes">
          <input className={playingInputClass} value={stakes} onChange={(e) => setStakes(e.target.value)} placeholder="e.g. 1/2" />
        </PlayingField>
        <PlayingField label="Date">
          <input type="date" className={playingInputClass} value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} />
        </PlayingField>
        <div className="grid grid-cols-2 gap-3">
          <PlayingField label="Hero Position">
            <select className={playingInputClass} value={heroPosition} onChange={(e) => setHeroPosition(e.target.value)}>
              {POKER_POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </PlayingField>
          <PlayingField label="Villain Position">
            <select className={playingInputClass} value={villainPosition} onChange={(e) => setVillainPosition(e.target.value)}>
              {POKER_POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </PlayingField>
        </div>
        <PlayingField label="Effective Stack">
          <input className={playingInputClass} value={effectiveStack} onChange={(e) => setEffectiveStack(e.target.value)} placeholder="e.g. 100bb" />
        </PlayingField>
        <PlayingField label="Hero Cards">
          <input className={playingInputClass} value={heroCards} onChange={(e) => setHeroCards(e.target.value)} placeholder="e.g. Ah Kh" required />
        </PlayingField>
        <PlayingField label="Board Cards">
          <input className={playingInputClass} value={boardCards} onChange={(e) => setBoardCards(e.target.value)} placeholder="e.g. Kc 7d 2s" />
        </PlayingField>
        <PlayingField label="Action History">
          <textarea
            className={`${playingInputClass} min-h-[100px] resize-none font-mono text-[12px]`}
            value={actionText}
            onChange={(e) => setActionText(e.target.value)}
            placeholder={"preflop\nHero: raise\nVillain: call"}
          />
        </PlayingField>
        <PlayingField label="Result">
          <select className={playingInputClass} value={result} onChange={(e) => setResult(e.target.value)}>
            {HAND_RESULT_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </PlayingField>
        <PlayingField label="Tags (comma-separated)">
          <input className={playingInputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. bluff, 3-bet pot" />
        </PlayingField>
        <PlayingField label="Notes">
          <textarea className={`${playingInputClass} min-h-[60px] resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </PlayingField>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>Cancel</SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" disabled={saving}>
            <Check size={16} />
            {saving ? "Saving…" : "Save Hand"}
          </PrimaryPlayingButton>
        </div>
      </form>
    </PlayingBottomSheet>
  );
}
