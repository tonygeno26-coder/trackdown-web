"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Shift, DownBlock } from "@/lib/types";
import { fmtMoney, fmtDateHeader, fmtTime } from "@/lib/blocks";
import BlockRow from "./BlockRow";

export default function HistoryList({
  shifts,
  onBlockTap,
  onDeleteShift,
}: {
  shifts: Shift[];
  onBlockTap: (shift: Shift, block: DownBlock) => void;
  onDeleteShift: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (shifts.length === 0) {
    return (
      <div className="text-center py-10 px-4 text-td-muted text-[13.5px]">
        <p>No completed shifts yet.</p>
      </div>
    );
  }

  return (
    <div>
      {shifts.map((shift) => {
        const isOpen = !!expanded[shift.id];
        const total = shift.blocks.reduce((s, b) => s + (b.status === "done" ? b.tips : 0), 0);
        const done = shift.blocks.filter((b) => b.status === "done").length;
        const doneBlocks = shift.blocks.filter((b) => b.status === "done");

        return (
          <div key={shift.id} className="border-b border-td-border pb-1 last:border-none">
            <button
              onClick={() => setExpanded((s) => ({ ...s, [shift.id]: !s[shift.id] }))}
              className="w-full flex items-center gap-2 py-3 px-1 text-left"
            >
              {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-semibold">
                  {shift.title ? `${shift.title} · ` : ""}{fmtDateHeader(shift.start_time)} · {shift.type === "tournament" ? "Tournament" : shift.type === "cash" ? "Cash" : "Home Game"}
                </span>
                <span className="text-[11.5px] text-td-muted">
                  {fmtTime(shift.start_time)} · {shift.down_length}m downs · {done}/{shift.blocks.length} logged
                </span>
              </div>
              <span className="font-mono font-semibold text-td-goldsoft text-[15px]">{fmtMoney(total)}</span>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-2 my-2.5">
                {doneBlocks.map((b) => (
                  <BlockRow key={b.id} block={b} type={shift.type} onTap={() => onBlockTap(shift, b)} />
                ))}
                {doneBlocks.length === 0 && (
                  <p className="text-[12.5px] text-td-muted py-2 px-1">No downs logged this shift.</p>
                )}
                <button
                  onClick={() => onDeleteShift(shift.id)}
                  className="flex items-center justify-center gap-1.5 border border-td-red text-red-300 rounded-lg py-2.5 px-3.5 text-[13px] font-semibold mt-1"
                >
                  <Trash2 size={14} /> Delete shift
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
