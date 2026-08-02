"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import {
  PlayingDateRange,
  PlayingHistoryFilter,
  cashOutLabel,
  formatDuration,
  formatMoneyPrecise,
  formatSignedMoney,
  hoursPlayed,
  netResult,
  netResultColorClass,
  sessionHourlyRate,
  sessionInDateRange,
  sessionTypeLabel,
  totalBuyIns,
} from "@/lib/playing";
import { fmtDateHeader, fmtTime } from "@/lib/blocks";
import PlayingStats from "./PlayingStats";

export default function PlayingHistory({
  sessions,
  onDelete,
}: {
  sessions: PlayingSession[];
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<PlayingHistoryFilter>("all");
  const [dateRange, setDateRange] = useState<PlayingDateRange>("all");

  const completed = useMemo(
    () => sessions.filter((s) => s.status === "completed"),
    [sessions]
  );

  const filtered = useMemo(() => {
    return completed.filter((s) => {
      if (!sessionInDateRange(s, dateRange)) return false;
      if (typeFilter === "cash" && s.session_type !== "cash") return false;
      if (typeFilter === "tournament" && s.session_type !== "tournament") return false;
      const net = netResult(s);
      if (typeFilter === "wins" && (net == null || net <= 0)) return false;
      if (typeFilter === "losses" && (net == null || net >= 0)) return false;
      return true;
    });
  }, [completed, dateRange, typeFilter]);

  const typeChips: { key: PlayingHistoryFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "cash", label: "Cash" },
    { key: "tournament", label: "Tournament" },
    { key: "wins", label: "Wins" },
    { key: "losses", label: "Losses" },
  ];

  return (
    <div>
      <PlayingStats sessions={completed} dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="flex gap-1.5 flex-wrap mb-3">
        {typeChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setTypeFilter(chip.key)}
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

      {filtered.length === 0 && (
        <div className="text-center py-10 px-4 text-td-muted text-[13.5px]">
          <p>No playing sessions match this filter.</p>
        </div>
      )}

      {filtered.map((session) => {
        const isOpen = !!expanded[session.id];
        const net = netResult(session);
        const hours = hoursPlayed(session.start_time, session.ended_at);
        const hourly = sessionHourlyRate(session);
        const gameLine = [session.game, session.stakes].filter(Boolean).join(" · ");

        return (
          <div key={session.id} className="border-b border-td-border pb-1 last:border-none">
            <button
              onClick={() => setExpanded((s) => ({ ...s, [session.id]: !s[session.id] }))}
              className="w-full flex items-center gap-2 py-3 px-1 text-left"
            >
              {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-semibold truncate w-full">
                  {session.title ? `${session.title} · ` : ""}
                  {fmtDateHeader(session.start_time)} · {sessionTypeLabel(session.session_type)}
                </span>
                <span className="text-[11.5px] text-td-muted truncate w-full">
                  {session.location ? `${session.location} · ` : ""}
                  {gameLine}
                </span>
                <span className="text-[11px] text-td-muted">
                  {hours != null ? formatDuration(hours) : "—"}
                  {hourly != null && (
                    <>
                      {" · "}
                      <span className={netResultColorClass(hourly)}>{formatSignedMoney(hourly)}/hr</span>
                    </>
                  )}
                </span>
              </div>
              <span className={`font-mono font-semibold text-[15px] shrink-0 ${netResultColorClass(net)}`}>
                {net != null ? formatSignedMoney(net) : "—"}
              </span>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-2 my-2.5 px-1 text-[12.5px]">
                <DetailRow label="Start" value={fmtTime(session.start_time)} />
                {session.ended_at && <DetailRow label="End" value={fmtTime(session.ended_at)} />}
                <DetailRow label="Initial Buy-in" value={formatMoneyPrecise(session.initial_buy_in)} />
                <DetailRow label="Additional Buy-ins" value={formatMoneyPrecise(session.additional_buy_ins)} />
                <DetailRow label="Total Buy-ins" value={formatMoneyPrecise(totalBuyIns(session))} />
                <DetailRow label={cashOutLabel(session.session_type)} value={formatMoneyPrecise(session.cash_out || 0)} />
                <DetailRow label="Expenses" value={formatMoneyPrecise(session.expenses || 0)} />
                {session.notes && (
                  <p className="text-td-muted italic py-1">{session.notes}</p>
                )}
                <button
                  onClick={() => onDelete(session.id)}
                  className="flex items-center justify-center gap-1.5 border border-td-red text-red-300 rounded-lg py-2.5 px-3.5 text-[13px] font-semibold mt-1"
                >
                  <Trash2 size={14} /> Delete session
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-td-muted">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
