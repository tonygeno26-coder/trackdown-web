"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { DealingBottomSheet } from "@/components/dealing/DealingUi";
import {
  FormField,
  CurrencyInput,
  SheetFooter,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

export default function LumpSumModal({
  currentAmount,
  onCancel,
  onSave,
}: {
  currentAmount: number | null;
  onCancel: () => void;
  onSave: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(currentAmount ? String(currentAmount) : "");
  const [saving, setSaving] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    onSave(parseFloat(amount) || 0);
  };

  return (
    <DealingBottomSheet
      title="Log Entire Shift"
      onClose={onCancel}
      footer={
        <SheetFooter>
          <SecondaryButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="lump-sum-form" disabled={saving}>
            <Check size={16} /> {saving ? "Saving…" : "Save Total"}
          </PrimaryButton>
        </SheetFooter>
      }
    >
      <form id="lump-sum-form" onSubmit={submit} className="space-y-4">
        <p className="text-[14px] leading-relaxed text-td-muted">
          Enter one total for the whole shift instead of logging each down individually — useful if
          you&apos;re turning chips in at the end.
        </p>
        <FormField label="Total tips">
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            required
            autoFocus
            placeholder="0"
          />
        </FormField>
      </form>
    </DealingBottomSheet>
  );
}
