"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SavedHandInput, POKER_POSITIONS, HAND_RESULT_OPTIONS } from "@/lib/hands/types";
import { parseActionHistoryText } from "@/lib/hands/replay-strategy";
import { parseCardList } from "@/lib/cards";
import CardPicker from "@/components/cards/CardPicker";
import CardRow from "@/components/cards/CardRow";
import { PlayingBottomSheet } from "@/components/playing/PlayingUi";
import {
  FormField,
  FormSection,
  TextInput,
  SelectInput,
  TextareaInput,
  SheetFooter,
  PrimaryButton,
  SecondaryButton,
  StepIndicator,
} from "@/components/ui";

export interface HandBuilderDefaults {
  session_id?: string | null;
  casino?: string;
  game?: string;
  stakes?: string;
  played_at?: string;
}

const STEPS = ["Details", "Cards", "Action", "Review"];

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
  const [step, setStep] = useState(0);
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

  const canNext =
    step === 0
      ? game.trim().length > 0
      : step === 1
        ? heroCards.trim().length > 0
        : step === 2
          ? actionText.trim().length > 0
          : true;

  const submit = () => {
    if (saving) return;
    const [year, month, day] = playedAt.split("-").map(Number);
    onSave({
      session_id: defaults?.session_id ?? null,
      casino,
      game,
      stakes,
      played_at: new Date(year, month - 1, day, 12, 0, 0, 0).toISOString(),
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
    <PlayingBottomSheet
      title="Save Hand"
      onClose={onCancel}
      footer={
        <SheetFooter>
          {step > 0 ? (
            <SecondaryButton type="button" onClick={() => setStep((s) => s - 1)} disabled={saving}>
              Previous
            </SecondaryButton>
          ) : (
            <SecondaryButton type="button" onClick={onCancel} disabled={saving}>
              Cancel
            </SecondaryButton>
          )}
          {step < STEPS.length - 1 ? (
            <PrimaryButton type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext || saving}>
              Next
            </PrimaryButton>
          ) : (
            <PrimaryButton type="button" onClick={submit} disabled={saving || !canNext}>
              <Check size={16} /> {saving ? "Saving…" : "Save Hand"}
            </PrimaryButton>
          )}
        </SheetFooter>
      }
    >
      <StepIndicator current={step} total={STEPS.length} labels={STEPS} />

      <div className="mt-5 space-y-4">
        {step === 0 && (
          <FormSection title="Session Details">
            <FormField label="Casino">
              <TextInput value={casino} onChange={(e) => setCasino(e.target.value)} placeholder="e.g. Bellagio" />
            </FormField>
            <FormField label="Game">
              <TextInput value={game} onChange={(e) => setGame(e.target.value)} placeholder="e.g. NLHE" required />
            </FormField>
            <FormField label="Stakes">
              <TextInput value={stakes} onChange={(e) => setStakes(e.target.value)} placeholder="e.g. 1/2" />
            </FormField>
            <FormField label="Date">
              <TextInput type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} />
            </FormField>
          </FormSection>
        )}

        {step === 1 && (
          <FormSection title="Positions & Cards">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Hero Position">
                <SelectInput value={heroPosition} onChange={(e) => setHeroPosition(e.target.value)}>
                  {POKER_POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField label="Villain Position">
                <SelectInput value={villainPosition} onChange={(e) => setVillainPosition(e.target.value)}>
                  {POKER_POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </SelectInput>
              </FormField>
            </div>
            <FormField label="Effective Stack">
              <TextInput value={effectiveStack} onChange={(e) => setEffectiveStack(e.target.value)} placeholder="e.g. 100bb" />
            </FormField>
            <CardPicker
              label="Hero Cards"
              value={heroCards}
              onChange={setHeroCards}
              maxCards={game.toLowerCase().includes("plo") ? 4 : 2}
              selectedPreviewSize="large"
            />
            <CardPicker
              label="Board Cards"
              value={boardCards}
              onChange={setBoardCards}
              maxCards={5}
              selectedPreviewSize="medium"
            />
          </FormSection>
        )}

        {step === 2 && (
          <FormSection title="Action History">
            <FormField label="Action History" hint="One street per section: preflop, flop, turn, river">
              <TextareaInput
                className="font-mono text-[12px]"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder={"preflop\nHero: raise\nVillain: call"}
              />
            </FormField>
            <FormField label="Result">
              <SelectInput value={result} onChange={(e) => setResult(e.target.value)}>
                {HAND_RESULT_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Tags (comma-separated)">
              <TextInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. bluff, 3-bet pot" />
            </FormField>
            <FormField label="Notes">
              <TextareaInput value={notes} onChange={(e) => setNotes(e.target.value)} />
            </FormField>
          </FormSection>
        )}

        {step === 3 && (
          <FormSection title="Review">
            <div className="mb-4 space-y-3">
              <CardRow cards={parseCardList(heroCards)} size="large" highlighted overlap />
              {boardCards.trim() && (
                <CardRow cards={parseCardList(boardCards)} size="medium" overlap />
              )}
            </div>
            <div className="space-y-2 text-[13px]">
              <ReviewRow label="Game" value={`${game} · ${stakes}`} />
              <ReviewRow label="Location" value={casino || "—"} />
              <ReviewRow label="Hero" value={`${heroCards} (${heroPosition})`} />
              <ReviewRow label="Villain" value={villainPosition} />
              <ReviewRow label="Board" value={boardCards || "—"} />
              <ReviewRow label="Stack" value={effectiveStack} />
              <ReviewRow label="Result" value={result} />
            </div>
          </FormSection>
        )}
      </div>
    </PlayingBottomSheet>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-td-border/40 py-2">
      <span className="text-td-muted">{label}</span>
      <span className="text-right font-semibold text-td-cream">{value}</span>
    </div>
  );
}
