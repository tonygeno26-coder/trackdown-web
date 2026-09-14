"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { TurnIn } from "@/lib/types";
import { fmtTime } from "@/lib/blocks";
import { DealingBottomSheet } from "@/components/dealing/DealingUi";
import {
  FormField,
  CurrencyInput,
  SheetFooter,
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
} from "@/components/ui";

export default function TurnInSheet({
  turnIn,
  onCancel,
  onSave,
  onDelete,
}: {
  turnIn: TurnIn;
  onCancel: () => void;
  onSave: (updated: TurnIn) => void;
  onDelete: () => void;
}) {
  const [amount, setAmount] = useState(String(turnIn.amount));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || deleting) return;
    setSaving(true);
    onSave({ ...turnIn, amount: parseFloat(amount) || 0 });
  };

  const remove = () => {
    if (saving || deleting) return;
    setDeleting(true);
    onDelete();
  };

  return (
    <DealingBottomSheet
      title={`${fmtTime(turnIn.timestamp)} Turn-In`}
      onClose={onCancel}
      footer={
        <SheetFooter>
          <SecondaryButton type="button" onClick={onCancel} disabled={saving || deleting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="turn-in-sheet-form" disabled={saving || deleting}>
            <Check size={16} /> {saving ? "Saving…" : "Save"}
          </PrimaryButton>
        </SheetFooter>
      }
    >
      <form id="turn-in-sheet-form" onSubmit={submit} className="space-y-4">
        <DestructiveButton type="button" onClick={remove} disabled={saving || deleting} className="w-full">
          <Trash2 size={16} /> {deleting ? "Deleting…" : "Delete turn-in"}
        </DestructiveButton>

        <div className="h-px bg-td-border" />

        <FormField label="Amount">
          <CurrencyInput value={amount} onChange={setAmount} required autoFocus placeholder="0" />
        </FormField>
      </form>
    </DealingBottomSheet>
  );
}
