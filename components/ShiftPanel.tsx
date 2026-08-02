"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Shift, DownBlock } from "@/lib/types";
import { fmtMoney, netTips } from "@/lib/blocks";
import BlockRow from "./BlockRow";

export default function ShiftPanel({
  shift,
  total,
  doneCount,
  onBlockTap,
  onEndShift,
  onExtend,
}: {
  shift: Shift;
  total: number;
  doneCount: number;
  onBlockTap: (b: DownBlock) => void;
  onEndShift: () => void;
  onExtend: (additionalMinutes: number) => void;
}) {
  const [extendOpen, setExtendOpen] = useState(false);
  const progress = doneCount / shift.blocks.length;
  const isTournament = shift.type === "tournament";
  const net = shift.house_tax_pct > 0 ? netTips(total, shift.house_tax_pct) : total;
  const typeLabel =
    shift.type === "tournament" ? "Tournament" : shift.type === "cash" ? "Cash Game" : "Home Game";

  return (
    <>
      <section className="bg-td-surface border border-td-border rounded-2xl px-5.5 py-5 mb-4">
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
            <span className="text-[12.5px] text-td-muted">
              of {shift.blocks.length} downs logged
            </span>
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
              {doneCount} of {shift.blocks.length} downs logged
            </span>
          </>
        )}

        <div className="mt-3.5 h-1 bg-td-surface2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-td-gold to-td-goldsoft rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </section>

      <div className="flex flex-col gap-2">
        {shift.blocks.map((b) => (
          <BlockRow key={b.id} block={b} type={shift.type} onTap={() => onBlockTap(b)} live />
        ))}
      </div>

      <div className="mt-3">
        {!extendOpen ? (
          <button
            onClick={() => setExtendOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-[11px] border border-dashed border-td-border text-td-muted text-sm font-semibold py-3 hover:border-td-gold hover:text-td-goldsoft"
          >
            <Plus size={15} /> Add more time
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-[12px] text-td-muted text-center">Add how much more time?</span>
            <div className="flex gap-2">
              {[60, 120, 240].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    onExtend(mins);
                    setExtendOpen(false);
                  }}
                  className="flex-1 rounded-[10px] py-2.5 font-semibold text-[13px] bg-td-surface2 border border-td-border text-td-cream hover:border-td-gold"
                >
                  {mins < 120 ? `${mins}m` : `${mins / 60}h`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setExtendOpen(false)}
              className="text-[12px] text-td-muted text-center py-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}
