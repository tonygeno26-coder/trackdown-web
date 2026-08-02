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
import {
  BottomSheet,
  SheetFooter,
  PrimaryButton,
  SecondaryButton,
  FormSection,
  ChoiceButton,
  ChoiceGrid,
} from "@/components/ui";

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
            className={`min-h-[44px] rounded-lg border px-3 py-2 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${
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

export function BlackjackRulesSheet({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [presetId, setPresetId] = useState<string>("vegas-strip");
  const [rules, setRules] = useState<BlackjackRules>(() => loadBlackjackRules());
  const [saving, setSaving] = useState(false);

  const applyPreset = (preset: BlackjackPreset) => {
    setPresetId(preset.id);
    setRules({ ...preset.rules });
  };

  const save = () => {
    if (saving) return;
    setSaving(true);
    saveBlackjackRules(rules);
    onSaved?.();
    onClose();
  };

  return (
    <BottomSheet
      title="Blackjack Rules"
      onClose={onClose}
      footer={
        <SheetFooter>
          <SecondaryButton type="button" onClick={onClose} disabled={saving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Rules"}
          </PrimaryButton>
        </SheetFooter>
      }
    >
      <p className="text-[12px] text-td-muted">
        Example presets — actual casino rules may vary. Edit any setting.
      </p>

      <ChoiceGrid>
        {BLACKJACK_PRESETS.map((preset) => (
          <ChoiceButton
            key={preset.id}
            selected={presetId === preset.id}
            onClick={() => applyPreset(preset)}
            className="col-span-1 text-left !items-start !py-3"
          >
            {preset.label}
          </ChoiceButton>
        ))}
      </ChoiceGrid>

      <div className="mt-4">
        <FormSection title="Rule Options">
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
      </FormSection>
      </div>

      <p className="mt-4 text-[12px] text-td-muted">{rulesSummary(rules)}</p>
    </BottomSheet>
  );
}

/** @deprecated Use BlackjackRulesSheet overlay from training home */
export default function BlackjackSettings({
  onBack,
  onSaved,
}: {
  onBack: () => void;
  onSaved?: () => void;
}) {
  return <BlackjackRulesSheet onClose={onBack} onSaved={onSaved} />;
}
