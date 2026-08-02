"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75" onClick={onCancel}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-[460px] bg-td-surface border border-td-border rounded-t-2xl px-5 pt-5 pb-6 flex flex-col gap-3.5"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-lg tracking-wide">
            {isTournament ? "Add Re-entry / Add-on" : "Add Buy-in"}
          </h2>
          <button type="button" onClick={onCancel} className="text-td-muted hover:text-td-cream p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
          <span>Amount</span>
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent border-none py-2.5 px-1 font-mono font-semibold flex-1 focus:outline-none text-td-cream"
            />
          </div>
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
            <Check size={16} /> {saving ? "Saving…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
