"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import { cashOutLabel } from "@/lib/playing";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75" onClick={onCancel}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-[460px] bg-td-surface border border-td-border rounded-t-2xl px-5 pt-5 pb-6 flex flex-col gap-3.5 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-lg tracking-wide">End session</h2>
          <button type="button" onClick={onCancel} className="text-td-muted hover:text-td-cream p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>{cashOutLabel(session.session_type)}</span>
          <div className="flex items-center bg-td-bg border border-td-border rounded-[9px] px-3">
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
              className="bg-transparent border-none py-2.5 px-1 font-mono font-semibold flex-1 focus:outline-none text-td-cream"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Expenses (optional)</span>
          <div className="flex items-center bg-td-bg border border-td-border rounded-[9px] px-3">
            <span className="font-mono text-td-muted">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              className="bg-transparent border-none py-2.5 px-1 font-mono font-semibold flex-1 focus:outline-none text-td-cream"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Notes</span>
          <input
            className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
            placeholder="optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="flex gap-2.5 mt-1.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-[10px] py-3 font-bold text-sm bg-td-gold text-[#1a1305] disabled:opacity-40 hover:enabled:bg-td-goldsoft"
          >
            <Check size={16} /> {saving ? "Saving…" : "End & save"}
          </button>
        </div>
      </form>
    </div>
  );
}
