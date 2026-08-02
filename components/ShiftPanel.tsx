"use client";

import { Shift, DownBlock } from "@/lib/types";
import { fmtMoney } from "@/lib/blocks";
import BlockRow from "./BlockRow";

export default function ShiftPanel({
  shift,
  total,
  doneCount,
  onBlockTap,
  onEndShift,
}: {
  shift: Shift;
  total: number;
  doneCount: number;
  onBlockTap: (b: DownBlock) => void;
  onEndShift: () => void;
}) {
  const progress = doneCount / shift.blocks.length;

  return (
    <>
      <section className="bg-td-surface border border-td-border rounded-2xl px-5.5 py-5 mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-td-muted font-semibold uppercase tracking-wide">
            {shift.type === "tournament" ? "Tournament" : "Cash Game"} · {shift.down_length}m downs
          </span>
          <button
            onClick={onEndShift}
            className="bg-transparent border border-td-border text-td-muted text-xs font-semibold px-2.5 py-1.5 rounded-md hover:text-td-red hover:border-td-red"
          >
            End shift
          </button>
        </div>
        <span className="block font-mono font-semibold text-4xl text-td-goldsoft leading-tight">
          {fmtMoney(total)}
        </span>
        <span className="text-[12.5px] text-td-muted">
          {doneCount} of {shift.blocks.length} downs logged
        </span>
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
    </>
  );
}
