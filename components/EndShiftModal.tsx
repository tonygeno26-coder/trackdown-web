"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Shift } from "@/lib/types";
import { fmtMoney, netTips } from "@/lib/blocks";

export default function EndShiftModal({
  shift,
  grossTotal,
  onCancel,
  onConfirm,
}: {
  shift: Shift;
  grossTotal: number;
  onCancel: () => void;
  onConfirm: (settledStatus: "yes" | "no" | "partial" | null, settledAmount: number | null) => void;
}) {
  const isHomegame = shift.type === "homegame";
  const netOwed = isHomegame && shift.house_tax_pct > 0 ? netTips(grossTotal, shift.house_tax_pct) : grossTotal;
  const [choice, setChoice] = useState<"yes" | "no" | "partial" | null>(null);
  const [partialAmount, setPartialAmount] = useState("");

  if (!isHomegame) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75" onClick={onCancel}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[460px] bg-td-surface border border-td-border rounded-t-2xl px-5 pt-5 pb-6 flex flex-col gap-3.5"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-lg tracking-wide">End this shift?</h2>
            <button onClick={onCancel} className="text-td-muted p-1 rounded">
              <X size={18} />
            </button>
          </div>
          <p className="text-[13.5px] text-td-muted -mt-1.5">
            Unlogged downs will be left blank and the shift moves to History.
          </p>
          <div className="flex gap-2.5 mt-1.5">
            <button
              onClick={onCancel}
              className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(null, null)}
              className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-red text-td-cream"
            >
              End shift
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canConfirm = choice === "yes" || choice === "no" || (choice === "partial" && parseFloat(partialAmount) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-td-surface border border-td-border rounded-t-2xl px-5 pt-5 pb-6 flex flex-col gap-3.5"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-lg tracking-wide">End this shift?</h2>
          <button onClick={onCancel} className="text-td-muted p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="bg-td-surface2 border border-td-border rounded-xl px-4 py-3.5 text-center">
          <span className="block text-[11.5px] text-td-muted uppercase tracking-wide mb-1">Total owed</span>
          <span className="block font-mono font-semibold text-3xl text-td-goldsoft">{fmtMoney(netOwed)}</span>
          {shift.house_tax_pct > 0 && (
            <span className="block text-[11px] text-td-muted mt-1">
              {fmtMoney(grossTotal)} gross · {shift.house_tax_pct}% house cut
            </span>
          )}
        </div>

        <p className="text-[13.5px] text-td-muted -mt-1">Settled?</p>
        <div className="flex gap-2">
          {(["yes", "no", "partial"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setChoice(opt)}
              className={`flex-1 rounded-[10px] py-3 font-bold text-sm border-[1.5px] capitalize
                ${choice === opt ? "border-td-gold bg-td-gold/10 text-td-goldsoft" : "border-td-border bg-td-surface2 text-td-cream hover:border-td-gold"}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {choice === "partial" && (
          <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
            <span>Amount actually paid</span>
            <div className="flex items-center bg-td-bg border border-td-border rounded-[9px] px-3">
              <span className="font-mono text-td-muted">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="1"
                min="0"
                placeholder="0"
                autoFocus
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                className="bg-transparent border-none py-2.5 px-1 font-mono font-semibold flex-1 focus:outline-none text-td-cream"
              />
            </div>
          </label>
        )}

        <div className="flex gap-2.5 mt-1">
          <button
            onClick={onCancel}
            className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream"
          >
            Cancel
          </button>
          <button
            disabled={!canConfirm}
            onClick={() =>
              onConfirm(choice, choice === "partial" ? parseFloat(partialAmount) || 0 : null)
            }
            className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-gold text-[#1a1305] disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-td-goldsoft"
          >
            Confirm & end shift
          </button>
        </div>
      </div>
    </div>
  );
}
