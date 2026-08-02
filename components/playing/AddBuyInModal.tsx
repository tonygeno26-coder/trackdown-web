"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
} from "@/components/playing/PlayingUi";

export default function AddBuyInModal({
  isTournament,
  onCancel,
  onSave,
  saving,
}: {
  isTournament: boolean;
  onCancel: () => void;
  onSave: (amount: number) => void;
  saving: boolean;
}) {
  const [amount, setAmount] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    onSave(parsed);
  };

  return (
    <PlayingBottomSheet
      title={isTournament ? "Add Re-entry / Add-on" : "Add Buy-in"}
      onClose={onCancel}
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <PlayingField label="Amount">
          <div className="flex items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
            <span className="font-mono text-td-muted">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 border-none bg-transparent py-3 pl-1 font-mono text-[20px] font-semibold text-td-cream focus:outline-none"
            />
          </div>
        </PlayingField>

        <div className="grid grid-cols-2 gap-3">
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" disabled={saving}>
            <Check size={16} />
            {saving ? "Saving…" : "Add"}
          </PrimaryPlayingButton>
        </div>
      </form>
    </PlayingBottomSheet>
  );
}
