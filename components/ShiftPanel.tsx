"use client";

import { useState } from "react";
import { ChevronDown, Plus, PenLine } from "lucide-react";
import { Shift, DownBlock, DealingSegment } from "@/lib/types";
import { fmtMoney, netTips, fmtHourlyRate, fmtMoneyPrecise, estimatedTournamentEarnings } from "@/lib/blocks";
import {
  combinedShiftEarnings,
  isCombinedShift,
  resolveActiveSegment,
  shiftTypeLabel,
} from "@/lib/shift-segments";
import BlockRow from "./BlockRow";
import AddTimeSheet from "./AddTimeSheet";
import { SurfaceCard, ProgressBar } from "@/components/ui";

export default function ShiftPanel({
  shift,
  total,
  doneCount,
  onBlockTap,
  onEndShift,
  onExtend,
  onLogLumpSum,
  onSegmentSwitch,
}: {
  shift: Shift;
  total: number;
  doneCount: number;
  onBlockTap: (b: DownBlock) => void;
  onEndShift: () => void;
  onExtend: (additionalMinutes: number) => void;
  onLogLumpSum: () => void;
  onSegmentSwitch?: (segment: DealingSegment) => void;
}) {
  const progress = doneCount / shift.blocks.length;
  const isTournamentOnly = shift.type === "tournament";
  const isCombined = isCombinedShift(shift);
  const activeSegment = resolveActiveSegment(shift);
  const net = shift.house_tax_pct > 0 ? netTips(total, shift.house_tax_pct) : total;
  const [extendOpen, setExtendOpen] = useState(false);
  const typeLabel = shiftTypeLabel(shift.type);
  const estimatedEarnings = isTournamentOnly ? estimatedTournamentEarnings(shift.blocks, shift.hourly_rate) : null;
  const combinedEarnings = isCombined ? combinedShiftEarnings(shift) : null;

  const toggleSegment = () => {
    if (!onSegmentSwitch || !isCombined) return;
    onSegmentSwitch(activeSegment === "tournament" ? "cash" : "tournament");
  };

  return (
    <>
      <SurfaceCard className="mb-4 px-5 py-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-td-muted font-semibold uppercase tracking-wide">
            {typeLabel} · {shift.down_length}m downs
          </span>
          <button
            onClick={onEndShift}
            className="bg-transparent border border-td-border text-td-muted text-xs font-semibold px-2.5 py-1.5 rounded-md hover:text-td-red hover:border-td-red"
          >
            End shift
          </button>
        </div>

        {shift.title && <div className="text-sm font-semibold text-td-cream mb-1">{shift.title}</div>}

        {isCombined && onSegmentSwitch && (
          <button
            type="button"
            onClick={toggleSegment}
            className="mb-3 flex min-h-[36px] items-center gap-1 rounded-lg border border-td-gold/50 bg-td-gold/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-td-goldsoft hover:border-td-gold"
          >
            Dealing: {activeSegment === "tournament" ? "Tournament" : "Cash Game"}
            <ChevronDown size={12} aria-hidden />
          </button>
        )}

        {isCombined && combinedEarnings ? (
          <>
            <span className="block font-mono font-semibold text-4xl text-td-goldsoft leading-tight">
              {fmtMoneyPrecise(combinedEarnings.total)}
            </span>
            <span className="text-[12.5px] text-td-muted">
              {doneCount} of {shift.blocks.length} downs logged · Tournament est.{" "}
              {combinedEarnings.tournament != null ? fmtMoneyPrecise(combinedEarnings.tournament) : "—"} · Cash{" "}
              {fmtMoneyPrecise(combinedEarnings.cash)}
            </span>
          </>
        ) : isTournamentOnly ? (
          <>
            <span className="block font-mono font-semibold text-4xl text-td-goldsoft leading-tight">
              {doneCount}
            </span>
            <span className="text-[12.5px] text-td-muted">of {shift.blocks.length} downs logged</span>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-td-muted uppercase tracking-wide block mb-0.5">Hourly Rate</span>
                <span className="text-sm font-mono font-semibold text-td-cream">
                  {shift.hourly_rate != null ? fmtHourlyRate(shift.hourly_rate) : "Not Set"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-td-muted uppercase tracking-wide block mb-0.5">Estimated Earnings</span>
                <span className="text-sm font-mono font-semibold text-td-goldsoft">
                  {estimatedEarnings != null ? fmtMoneyPrecise(estimatedEarnings) : "—"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="block font-mono font-semibold text-4xl text-td-goldsoft leading-tight">
              {fmtMoney(net)}
            </span>
            {shift.house_tax_pct > 0 && (
              <span className="text-[11.5px] text-td-muted block">
                {fmtMoney(total)} gross · {shift.house_tax_pct}% house cut
              </span>
            )}
            <span className="text-[12.5px] text-td-muted">
              {shift.is_lump_sum ? "Logged as one total" : `${doneCount} of ${shift.blocks.length} downs logged`}
            </span>
          </>
        )}

        <ProgressBar value={doneCount} max={shift.blocks.length} className="mt-3.5" />

        {!isTournamentOnly && !isCombined && (
          <button
            onClick={onLogLumpSum}
            className="mt-3.5 w-full flex items-center justify-center gap-2 rounded-[10px] border border-td-border text-td-muted text-[13px] font-semibold py-2.5 hover:border-td-gold hover:text-td-goldsoft"
          >
            <PenLine size={14} />
            {shift.is_lump_sum ? "Edit total" : "Log entire shift instead"}
          </button>
        )}
      </SurfaceCard>

      <div className="flex flex-col gap-2">
        {shift.blocks.map((b) => (
          <BlockRow key={b.id} block={b} shift={shift} onTap={() => onBlockTap(b)} live />
        ))}

        <div className="mt-1">
          <button
            onClick={() => setExtendOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-td border border-dashed border-td-border py-3 text-sm font-semibold text-td-muted hover:border-td-gold hover:text-td-goldsoft"
          >
            <Plus size={15} /> Add more time
          </button>
        </div>
      </div>

      {extendOpen && (
        <AddTimeSheet
          onCancel={() => setExtendOpen(false)}
          onExtend={(mins) => {
            onExtend(mins);
            setExtendOpen(false);
          }}
        />
      )}
    </>
  );
}
