"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Shift, DownBlock } from "@/lib/types";
import { fmtMoney, fmtDateHeader, fmtTime, fmtHourlyRate, fmtMoneyPrecise, estimatedTournamentEarnings } from "@/lib/blocks";
import {
  combinedShiftEarnings,
  isCombinedShift,
  segmentBreakdownLabel,
  shiftTypeLabel,
  shiftTotalEarnings,
} from "@/lib/shift-segments";
import BlockRow from "./BlockRow";

type TypeFilter = "all" | "tournament" | "cash" | "homegame" | "tournament_cash";
type SettledFilter = "all" | "settled" | "unsettled";

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
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [settledFilter, setSettledFilter] = useState<SettledFilter>("all");

  const filtered = useMemo(() => {
    return shifts.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (typeFilter === "homegame" && settledFilter !== "all") {
        const isSettled = s.settled_status === "yes";
        if (settledFilter === "settled" && !isSettled) return false;
        if (settledFilter === "unsettled" && isSettled) return false;
      }
      return true;
    });
  }, [shifts, typeFilter, settledFilter]);

  const typeChips: { key: TypeFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "tournament", label: "Tournament" },
    { key: "cash", label: "Cash" },
    { key: "tournament_cash", label: "T + Cash" },
    { key: "homegame", label: "Home Game" },
  ];

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {typeChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => {
              setTypeFilter(chip.key);
              setSettledFilter("all");
            }}
            className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-full border ${
              typeFilter === chip.key
                ? "bg-td-gold border-td-gold text-[#1a1305]"
                : "bg-transparent border-td-border text-td-muted hover:border-td-gold"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {typeFilter === "homegame" && (
        <div className="flex gap-1.5 mb-3">
          {(["all", "settled", "unsettled"] as SettledFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setSettledFilter(f)}
              className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full border capitalize ${
                settledFilter === f
                  ? "bg-td-surface2 border-td-gold text-td-goldsoft"
                  : "bg-transparent border-td-border text-td-muted hover:border-td-gold"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-10 px-4 text-td-muted text-[13.5px]">
          <p>No shifts match this filter.</p>
        </div>
      )}

      {filtered.map((shift) => {
        const isOpen = !!expanded[shift.id];
        const done = shift.blocks.filter((b) => b.status === "done").length;
        const doneBlocks = shift.blocks.filter((b) => b.status === "done");
        const isCombined = isCombinedShift(shift);
        const tournamentEarnings =
          shift.type === "tournament" ? estimatedTournamentEarnings(shift.blocks, shift.hourly_rate) : null;
        const combined = isCombined ? combinedShiftEarnings(shift) : null;
        const breakdown = segmentBreakdownLabel(shift);
        const earningsTotal = shiftTotalEarnings(shift);

        return (
          <div key={shift.id} className="border-b border-td-border pb-1 last:border-none">
            <button
              onClick={() => setExpanded((s) => ({ ...s, [shift.id]: !s[shift.id] }))}
              className="w-full flex items-center gap-2 py-3 px-1 text-left"
            >
              {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-semibold">
                  {shift.title ? `${shift.title} · ` : ""}
                  {fmtDateHeader(shift.start_time)} · {shiftTypeLabel(shift.type)}
                </span>
                <span className="text-[11.5px] text-td-muted">
                  {fmtTime(shift.start_time)} · {shift.down_length}m downs ·{" "}
                  {shift.type === "tournament"
                    ? `${done} downs logged`
                    : isCombined
                      ? breakdown ?? `${done} downs logged`
                      : shift.is_lump_sum
                        ? "logged as one total"
                        : `${done}/${shift.blocks.length} logged`}
                </span>
                {shift.type === "tournament" && shift.hourly_rate != null && tournamentEarnings != null && (
                  <span className="text-[11px] font-semibold mt-0.5 text-td-muted">
                    {fmtHourlyRate(shift.hourly_rate)} · est.{" "}
                    <span className="text-td-goldsoft">{fmtMoneyPrecise(tournamentEarnings)}</span>
                  </span>
                )}
                {isCombined && combined && (
                  <span className="text-[11px] font-semibold mt-0.5 text-td-muted">
                    Tournament est.{" "}
                    <span className="text-td-goldsoft">
                      {combined.tournament != null ? fmtMoneyPrecise(combined.tournament) : "—"}
                    </span>
                    {" · "}
                    Cash <span className="text-td-goldsoft">{fmtMoneyPrecise(combined.cash)}</span>
                  </span>
                )}
                {shift.type === "homegame" && shift.settled_status && (
                  <span
                    className={`text-[11px] font-semibold mt-0.5 ${
                      shift.settled_status === "yes"
                        ? "text-td-gold"
                        : shift.settled_status === "no"
                        ? "text-red-300"
                        : "text-td-muted"
                    }`}
                  >
                    {shift.settled_status === "yes" && "Settled in full"}
                    {shift.settled_status === "no" && "Not settled"}
                    {shift.settled_status === "partial" &&
                      `Partially settled · ${fmtMoney(shift.settled_amount || 0)} paid`}
                  </span>
                )}
              </div>
              <span className="font-mono font-semibold text-td-goldsoft text-[15px]">
                {shift.type === "tournament" ? `${done} downs` : fmtMoneyPrecise(earningsTotal)}
              </span>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-2 my-2.5">
                {isCombined && breakdown && (
                  <p className="text-[12.5px] font-semibold text-td-muted px-1">{breakdown}</p>
                )}
                {!shift.is_lump_sum &&
                  doneBlocks.map((b) => (
                    <BlockRow key={b.id} block={b} shift={shift} onTap={() => onBlockTap(shift, b)} />
                  ))}
                {!shift.is_lump_sum && doneBlocks.length === 0 && (
                  <p className="text-[12.5px] text-td-muted py-2 px-1">No downs logged this shift.</p>
                )}
                {shift.is_lump_sum && (
                  <p className="text-[12.5px] text-td-muted py-2 px-1">
                    This shift was logged as one total rather than per-down.
                  </p>
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
