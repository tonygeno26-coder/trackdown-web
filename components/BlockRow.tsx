"use client";

import { Coffee } from "lucide-react";
import { DownBlock, ShiftType } from "@/lib/types";
import { fmtMoney, fmtTime, isNowWithin } from "@/lib/blocks";

export default function BlockRow({
  block,
  type,
  onTap,
  live = false,
}: {
  block: DownBlock;
  type: ShiftType;
  onTap: () => void;
  live?: boolean;
}) {
  const current = live && block.status === "pending" && isNowWithin(block.scheduledStart, block.scheduledEnd);
  const isTournament = type === "tournament";

  return (
    <button
      onClick={onTap}
      className={`flex items-center gap-3 w-full text-left rounded-[11px] border px-3.5 py-3 transition-colors
        bg-td-surface border-td-border hover:border-td-gold
        ${current ? "border-td-gold bg-td-surface2" : ""}
        ${block.status === "done" ? "opacity-95" : ""}
        ${block.status === "skipped" ? "opacity-45" : ""}
        ${block.status === "break" ? "opacity-70" : ""}
      `}
    >
      <div className="flex flex-col items-start min-w-[62px]">
        <span className="font-mono text-[12.5px] text-td-muted">{fmtTime(block.scheduledStart)}</span>
        {current && <span className="text-[9.5px] font-bold text-td-gold tracking-wide mt-0.5">NOW</span>}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {block.status === "break" ? (
          <span className="text-sm font-semibold flex items-center gap-1.5 text-td-muted">
            <Coffee size={14} /> Break
          </span>
        ) : block.status === "done" ? (
          isTournament ? (
            <span className="text-sm font-semibold truncate">{block.table || "Table logged"}</span>
          ) : (
            <>
              <span className="text-sm font-semibold truncate">{block.game || "Cash table"}</span>
              {block.table && <span className="text-[11.5px] text-td-muted">{block.table}</span>}
            </>
          )
        ) : (
          <span className="text-[13px] text-td-muted italic">
            {block.status === "skipped" ? "Skipped" : "Tap to log"}
          </span>
        )}
      </div>

      <div className="flex items-center">
        {block.status === "done" && !isTournament && (
          <span className="font-mono font-semibold text-[14.5px] text-td-goldsoft">{fmtMoney(block.tips)}</span>
        )}
        {block.status === "done" && isTournament && <span className="w-1.5 h-1.5 rounded-full bg-td-gold" />}
        {block.status === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-td-border" />}
      </div>
    </button>
  );
}
