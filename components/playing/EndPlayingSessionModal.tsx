"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import { cashOutLabel } from "@/lib/playing";
import {
  PlayingBottomSheet,
  PlayingField,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
} from "@/components/playing/PlayingUi";
import { SheetFooter, CurrencyInput, TextInput } from "@/components/ui";

export default function EndPlayingSessionModal({
  session,
  onCancel,
  onSave,
  saving,
}: {
  session: PlayingSession;
  onCancel: () => void;
  onSave: (data: { cash_out: number; expenses: number; notes: string }) => void;
  saving: boolean;
}) {
  const [cashOut, setCashOut] = useState("");
  const [expenses, setExpenses] = useState("0");
  const [notes, setNotes] = useState(session.notes || "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    onSave({
      cash_out: parseFloat(cashOut) || 0,
      expenses: parseFloat(expenses) || 0,
      notes,
    });
  };

  return (
    <PlayingBottomSheet
      title="End Session"
      onClose={onCancel}
      footer={
        <SheetFooter>
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" form="end-session-form" disabled={saving}>
            <Check size={16} />
            {saving ? "Saving…" : "End & Save"}
          </PrimaryPlayingButton>
        </SheetFooter>
      }
    >
      <form id="end-session-form" onSubmit={submit} className="flex flex-col gap-4">
        <PlayingField label={cashOutLabel(session.session_type)}>
          <CurrencyInput value={cashOut} onChange={setCashOut} required autoFocus placeholder="0" />
        </PlayingField>

        <PlayingField label="Expenses (optional)">
          <CurrencyInput value={expenses} onChange={setExpenses} placeholder="0" />
        </PlayingField>

        <PlayingField label="Notes">
          <TextInput placeholder="optional" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </PlayingField>
      </form>
    </PlayingBottomSheet>
  );
}
