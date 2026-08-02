"use client";

import { useState } from "react";
import {
  BlackjackPreset,
  BlackjackRules,
  BLACKJACK_PRESETS,
  loadBlackjackRules,
  saveBlackjackRules,
  rulesSummary,
} from "@/lib/training/blackjack";
import { PrimaryPlayingButton, TrainHeader } from "@/components/train/TrainingUi";
import { PlayingCard } from "@/components/playing/PlayingUi";

function ToggleRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number | boolean;
  options: { key: string | number | boolean; label: string }[];
  onChange: (v: string | number | boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-td-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={String(opt.key)}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`rounded-lg border px-3 py-2 text-[12px] font-semibold ${
              value === opt.key
                ? "border-td-gold bg-td-gold/10 text-td-goldsoft"
                : "border-td-border bg-td-surface2 text-td-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BlackjackSettings({
  onBack,
  onSaved,
}: {
  onBack: () => void;
  onSaved?: () => void;
}) {
  const [presetId, setPresetId] = useState<string>("vegas-strip");
  const [rules, setRules] = useState<BlackjackRules>(() => loadBlackjackRules());

  const applyPreset = (preset: BlackjackPreset) => {
    setPresetId(preset.id);
    setRules({ ...preset.rules });
  };

  const save = () => {
    saveBlackjackRules(rules);
    onSaved?.();
    onBack();
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title="Blackjack Rules"
        subtitle="Example presets — actual casino rules may vary. Edit any setting."
        onBack={onBack}
      />

      <div className="mb-4 grid grid-cols-2 gap-2">
        {BLACKJACK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className={`rounded-xl border px-3 py-3 text-left text-[12px] ${
              presetId === preset.id
                ? "border-td-gold bg-td-gold/10 text-td-cream"
                : "border-td-border bg-td-surface2 text-td-muted"
            }`}
          >
            <span className="block font-semibold">{preset.label}</span>
          </button>
        ))}
      </div>

      <PlayingCard className="mb-4 space-y-5 p-5">
        <ToggleRow
          label="Number of decks"
          value={rules.decks}
          options={[
            { key: 1, label: "1" },
            { key: 2, label: "2" },
            { key: 6, label: "6" },
            { key: 8, label: "8" },
          ]}
          onChange={(v) => setRules({ ...rules, decks: v as BlackjackRules["decks"] })}
        />
        <ToggleRow
          label="Dealer soft 17"
          value={rules.dealerSoft17}
          options={[
            { key: "stand", label: "Stands" },
            { key: "hit", label: "Hits" },
          ]}
          onChange={(v) => setRules({ ...rules, dealerSoft17: v as "hit" | "stand" })}
        />
        <ToggleRow
          label="Double after split"
          value={rules.doubleAfterSplit}
          options={[
            { key: true, label: "Allowed" },
            { key: false, label: "Not allowed" },
          ]}
          onChange={(v) => setRules({ ...rules, doubleAfterSplit: v as boolean })}
        />
        <ToggleRow
          label="Surrender"
          value={rules.surrender}
          options={[
            { key: true, label: "Allowed" },
            { key: false, label: "Not allowed" },
          ]}
          onChange={(v) => setRules({ ...rules, surrender: v as boolean })}
        />
        <ToggleRow
          label="Resplit aces"
          value={rules.resplitAces}
          options={[
            { key: true, label: "Allowed" },
            { key: false, label: "Not allowed" },
          ]}
          onChange={(v) => setRules({ ...rules, resplitAces: v as boolean })}
        />
      </PlayingCard>

      <p className="mb-4 text-[12px] text-td-muted">{rulesSummary(rules)}</p>

      <PrimaryPlayingButton type="button" onClick={save}>
        Save Rules
      </PrimaryPlayingButton>
    </div>
  );
}
