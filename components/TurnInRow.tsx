"use client";

import { TurnIn } from "@/lib/types";
import { fmtMoney, fmtTime } from "@/lib/blocks";

export default function TurnInRow({ turnIn, onTap }: { turnIn: TurnIn; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="flex items-center gap-3 w-full text-left rounded-[11px] border px-3.5 py-3 transition-colors bg-td-surface border-td-border hover:border-td-gold"
    >
      <div className="flex flex-col items-start min-w-[62px]">
        <span className="font-mono text-[12.5px] text-td-muted">{fmtTime(turnIn.timestamp)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[13px] text-td-muted italic">Tap to edit</span>
      </div>

      <span className="font-mono font-semibold text-[14.5px] text-td-goldsoft">{fmtMoney(turnIn.amount)}</span>
    </button>
  );
}
