"use client";

import { useEffect, useMemo, useState } from "react";
import { Coffee, Plus, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { Shift, DownBlock } from "@/lib/types";
import {
  fmtMoney,
  fmtMoneyPrecise,
  fmtHourlyRate,
  fmtTime,
  isNowWithin,
  netTips,
  estimatedTournamentEarnings,
} from "@/lib/blocks";
import { formatDuration, hoursPlayed } from "@/lib/playing";
import {
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  MoneyValue,
  ProgressBar,
  SectionHeader,
  fadeSlide,
} from "@/components/ui";
import BlockRow from "@/components/BlockRow";
import TrackdownHeader from "@/components/TrackdownHeader";

function findTargetBlock(shift: Shift): { block: DownBlock; label: string } | null {
  const pending = shift.blocks.filter((b) => b.status === "pending");
  if (pending.length === 0) return null;

  const current = pending.find((b) => isNowWithin(b.scheduledStart, b.scheduledEnd));
  if (current) {
    return { block: current, label: "Log Current Down" };
  }
  return { block: pending[0], label: "Log Next Down" };
}

export default function DealerCockpit({
  shift,
  total,
  doneCount,
  onLogDown,
  onBreak,
  onSkip,
  onEndShift,
  onExtend,
  onLogLumpSum,
  onBlockTap,
}: {
  shift: Shift;
  total: number;
  doneCount: number;
  onLogDown: (block: DownBlock) => void;
  onBreak: (block: DownBlock) => void;
  onSkip: (block: DownBlock) => void;
  onEndShift: () => void;
  onExtend: (minutes: number) => void;
  onLogLumpSum: () => void;
  onBlockTap: (block: DownBlock) => void;
}) {
  const [, tick] = useState(0);
  const [extendOpen, setExtendOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const target = useMemo(() => findTargetBlock(shift), [shift]);
  const progress = shift.blocks.length > 0 ? doneCount / shift.blocks.length : 0;
  const isTournament = shift.type === "tournament";
  const typeLabel =
    shift.type === "tournament" ? "Tournament" : shift.type === "cash" ? "Cash Game" : "Home Game";
  const net = shift.house_tax_pct > 0 ? netTips(total, shift.house_tax_pct) : total;
  const durationHours = hoursPlayed(shift.start_time, null);
  const estimatedEarnings = isTournament
    ? estimatedTournamentEarnings(shift.blocks, shift.hourly_rate)
    : null;
  const currentDownNumber = doneCount + 1;

  return (
    <motion.div {...fadeSlide} className="space-y-5 pb-4">
      <TrackdownHeader showToday compact />

      <SurfaceCard className="px-5 py-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-td-gold">
              {typeLabel} · {shift.down_length}m downs
            </span>
            {shift.title && (
              <p className="mt-1 font-display text-[16px] font-bold text-td-cream">{shift.title}</p>
            )}
            <p className="mt-1 text-[12px] text-td-muted">Started {fmtTime(shift.start_time)}</p>
          </div>
          <button
            onClick={onEndShift}
            className="shrink-0 min-h-[44px] rounded-lg border border-td-border px-3 py-2 text-[11px] font-semibold text-td-muted transition-colors hover:border-td-red hover:text-red-300"
          >
            End Shift
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-td-border/70 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">Current Down</p>
            <p className="mt-1 font-mono text-[28px] font-semibold leading-none text-td-cream">
              {Math.min(currentDownNumber, shift.blocks.length)}
            </p>
            <p className="mt-1 text-[11px] text-td-muted">of {shift.blocks.length} scheduled</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">Duration</p>
            <p className="mt-1 font-mono text-[28px] font-semibold leading-none text-td-goldsoft">
              {durationHours != null ? formatDuration(durationHours) : "—"}
            </p>
            {target && (
              <p className="mt-1 text-[11px] text-td-muted">{fmtTime(target.block.scheduledStart)}</p>
            )}
          </div>
        </div>

        {isTournament ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-td-border/70 bg-td-surface2/50 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[1px] text-td-muted">Hourly Rate</p>
              <p className="mt-1 font-mono text-[14px] font-semibold text-td-cream">
                {shift.hourly_rate != null ? fmtHourlyRate(shift.hourly_rate) : "Not set"}
              </p>
            </div>
            <div className="rounded-xl border border-td-border/70 bg-td-surface2/50 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[1px] text-td-muted">Est. Earnings</p>
              <MoneyValue amount={estimatedEarnings != null ? fmtMoneyPrecise(estimatedEarnings) : "—"} positive size="sm" />
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-td-border/70 bg-td-surface2/50 px-3 py-3 text-center">
            <p className="text-[10px] uppercase tracking-[1px] text-td-muted">Tips Total</p>
            <div className="mt-1">
              <MoneyValue amount={fmtMoney(net)} positive size="lg" />
            </div>
            {shift.house_tax_pct > 0 && (
              <p className="text-[11px] text-td-muted">
                {fmtMoney(total)} gross · {shift.house_tax_pct}% house cut
              </p>
            )}
          </div>
        )}

        <ProgressBar value={doneCount} max={shift.blocks.length} className="mt-4" />
      </SurfaceCard>

      {target ? (
        <PrimaryButton session onClick={() => onLogDown(target.block)}>
          {target.label}
        </PrimaryButton>
      ) : (
        <p className="text-center text-[13px] text-td-muted">All downs logged for this shift.</p>
      )}

      {target && (
        <div className="grid grid-cols-2 gap-2.5">
          <SecondaryButton onClick={() => onBreak(target.block)}>
            <Coffee size={16} aria-hidden /> Break
          </SecondaryButton>
          <SecondaryButton onClick={() => onSkip(target.block)}>Skip</SecondaryButton>
        </div>
      )}

      {!isTournament && (
        <SecondaryButton onClick={onLogLumpSum}>
          <PenLine size={16} aria-hidden />
          {shift.is_lump_sum ? "Edit Total" : "Log Entire Shift"}
        </SecondaryButton>
      )}

      {!extendOpen ? (
        <SecondaryButton onClick={() => setExtendOpen(true)}>
          <Plus size={16} aria-hidden /> Add More Time
        </SecondaryButton>
      ) : (
        <SurfaceCard className="space-y-2 px-4 py-4">
          <p className="text-center text-[12px] text-td-muted">Add how much more time?</p>
          <div className="grid grid-cols-3 gap-2">
            {[60, 120, 240].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  onExtend(mins);
                  setExtendOpen(false);
                }}
                className="min-h-[44px] rounded-xl border border-td-border bg-td-surface2 py-2.5 text-[13px] font-semibold text-td-cream hover:border-td-gold"
              >
                {mins < 120 ? `${mins}m` : `${mins / 60}h`}
              </button>
            ))}
          </div>
          <button onClick={() => setExtendOpen(false)} className="w-full min-h-[44px] py-1 text-[12px] text-td-muted">
            Cancel
          </button>
        </SurfaceCard>
      )}

      <div className="space-y-2 pt-1">
        <SectionHeader title="All Downs" />
        {shift.blocks.map((b) => (
          <BlockRow key={b.id} block={b} type={shift.type} onTap={() => onBlockTap(b)} live />
        ))}
      </div>
    </motion.div>
  );
}
