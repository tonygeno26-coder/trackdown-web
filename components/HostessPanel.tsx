"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shift, TurnIn } from "@/lib/types";
import { fmtMoney, fmtStartedLabel, turnInsTotal } from "@/lib/blocks";
import { hostessNetTotal, hostessTaxBreakdownLabel } from "@/lib/shift-segments";
import { SurfaceCard, CurrencyInput, MoneyValue, SectionHeader, fadeSlide } from "@/components/ui";
import TrackdownHeader from "@/components/TrackdownHeader";
import TurnInRow from "@/components/TurnInRow";

export default function HostessPanel({
  shift,
  onLogTurnIn,
  onTurnInTap,
  onEndShift,
}: {
  shift: Shift;
  onLogTurnIn: (amount: number) => void;
  onTurnInTap: (turnIn: TurnIn) => void;
  onEndShift: () => void;
}) {
  const [amount, setAmount] = useState("");

  const gross = turnInsTotal(shift.turn_ins);
  const net = hostessNetTotal(shift);
  const breakdown = hostessTaxBreakdownLabel(shift);
  const sortedTurnIns = [...shift.turn_ins].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const submitTurnIn = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    onLogTurnIn(parsed);
    setAmount("");
  };

  return (
    <motion.div {...fadeSlide} className="space-y-5 pb-4">
      <TrackdownHeader showToday compact />

      <SurfaceCard className="px-5 py-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-td-gold">
              Home Game · Hostess
            </span>
            {shift.title && (
              <p className="mt-1 font-display text-[16px] font-bold text-td-cream">{shift.title}</p>
            )}
            <p className="mt-1 text-[12px] text-td-muted">Started {fmtStartedLabel(shift.start_time)}</p>
          </div>
          <button
            onClick={onEndShift}
            className="shrink-0 min-h-[44px] rounded-lg border border-td-border px-3 py-2 text-[11px] font-semibold text-td-muted transition-colors hover:border-td-red hover:text-red-300"
          >
            End Shift
          </button>
        </div>

        <div className="rounded-xl border border-td-border/70 bg-td-surface2/50 px-3 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[1px] text-td-muted">Net Total</p>
          <div className="mt-1">
            <MoneyValue amount={fmtMoney(net)} positive size="lg" />
          </div>
          <p className="mt-1 text-[11px] text-td-muted">
            {fmtMoney(gross)} gross · {breakdown}
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard className="px-5 py-5">
        <SectionHeader title="Log Turn-In" />
        <form onSubmit={submitTurnIn} className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <CurrencyInput value={amount} onChange={setAmount} placeholder="0" autoFocus />
          </div>
          <button
            type="submit"
            disabled={!amount}
            className="min-h-[48px] shrink-0 rounded-td-lg bg-td-gradient-red px-5 font-display text-[13px] font-bold uppercase tracking-[1px] text-td-cream shadow-td-glow-sm hover:shadow-td-glow disabled:opacity-45"
          >
            Log
          </button>
        </form>
      </SurfaceCard>

      <div className="space-y-2 pt-1">
        <SectionHeader title="Turn-Ins" />
        {sortedTurnIns.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-td-muted">No turn-ins logged yet.</p>
        ) : (
          sortedTurnIns.map((t) => <TurnInRow key={t.id} turnIn={t} onTap={() => onTurnInTap(t)} />)
        )}
      </div>
    </motion.div>
  );
}
