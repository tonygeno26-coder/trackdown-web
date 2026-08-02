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
  playingInputClass,
} from "@/components/playing/PlayingUi";

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
    <PlayingBottomSheet title="End Session" onClose={onCancel}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <PlayingField label={cashOutLabel(session.session_type)}>
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
              value={cashOut}
              onChange={(e) => setCashOut(e.target.value)}
              className="flex-1 border-none bg-transparent py-3 pl-1 font-mono text-[20px] font-semibold text-td-cream focus:outline-none"
            />
          </div>
        </PlayingField>

        <PlayingField label="Expenses (optional)">
          <div className="flex items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
            <span className="font-mono text-td-muted">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              className="flex-1 border-none bg-transparent py-3 pl-1 font-mono font-semibold text-td-cream focus:outline-none"
            />
          </div>
        </PlayingField>

        <PlayingField label="Notes">
          <input
            className={playingInputClass}
            placeholder="optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </PlayingField>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <SecondaryPlayingButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </SecondaryPlayingButton>
          <PrimaryPlayingButton type="submit" disabled={saving}>
            <Check size={16} />
            {saving ? "Saving…" : "End & Save"}
          </PrimaryPlayingButton>
        </div>
      </form>
    </PlayingBottomSheet>
  );
}
