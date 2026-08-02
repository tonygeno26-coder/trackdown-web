"use client";

import { useState } from "react";
import { Plus, PenLine } from "lucide-react";
import { Shift, DownBlock } from "@/lib/types";
import { fmtMoney, netTips, fmtHourlyRate, fmtMoneyPrecise, estimatedTournamentEarnings } from "@/lib/blocks";
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
}: {
  shift: Shift;
  total: number;
  doneCount: number;
  onBlockTap: (b: DownBlock) => void;
  onEndShift: () => void;
  onExtend: (additionalMinutes: number) => void;
  onLogLumpSum: () => void;
}) {
  const progress = doneCount / shift.blocks.length;
  const isTournament = shift.type === "tournament";
  const net = shift.house_tax_pct > 0 ? netTips(total, shift.house_tax_pct) : total;
  const [extendOpen, setExtendOpen] = useState(false);
  const typeLabel =
    shift.type === "tournament" ? "Tournament" : shift.type === "cash" ? "Cash Game" : "Home Game";
  const estimatedEarnings = isTournament ? estimatedTournamentEarnings(shift.blocks, shift.hourly_rate) : null;

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

        {isTournament ? (
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

        {!isTournament && (
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
          <BlockRow key={b.id} block={b} type={shift.type} onTap={() => onBlockTap(b)} live />
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
