"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
} from "@/components/playing/PlayingUi";
import { SheetFooter, CurrencyInput } from "@/components/ui";

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
      footer={
        <SheetFooter>
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" form="add-buyin-form" disabled={saving}>
            <Check size={16} />
            {saving ? "Saving…" : "Add"}
          </PrimaryPlayingButton>
        </SheetFooter>
      }
    >
      <form id="add-buyin-form" onSubmit={submit}>
        <PlayingField label="Amount">
          <CurrencyInput value={amount} onChange={setAmount} required autoFocus placeholder="0" />
        </PlayingField>
      </form>
    </PlayingBottomSheet>
  );
}
