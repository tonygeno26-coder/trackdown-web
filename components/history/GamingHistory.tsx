"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import {
  PlayingDateRange,
  cashOutLabel,
  formatDuration,
  formatMoneyPrecise,
  formatSignedMoney,
  hoursPlayed,
  netResult,
  netResultColorClass,
  sessionHourlyRate,
  sessionInDateRange,
  totalBuyIns,
} from "@/lib/playing";
import {
  GamingHistoryFilter,
  filterGamingSessions,
  gamingCategoryLabel,
  getGamingCategory,
  sessionCategoryLabel,
  stakesOrMinimumLabel,
} from "@/lib/gaming";
import { fmtDateHeader, fmtTime } from "@/lib/blocks";

export default function GamingHistory({
  sessions,
  onDelete,
}: {
  sessions: PlayingSession[];
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<GamingHistoryFilter>("all");
  const [dateRange, setDateRange] = useState<PlayingDateRange>("all");

  const completed = useMemo(
    () => sessions.filter((s) => s.status === "completed"),
    [sessions]
  );

  const filtered = useMemo(() => {
    const byDate = completed.filter((s) => sessionInDateRange(s, dateRange));
    return filterGamingSessions(byDate, typeFilter);
  }, [completed, dateRange, typeFilter]);

  const typeChips: { key: GamingHistoryFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "poker", label: "Poker" },
    { key: "table_games", label: "Table Games" },
    { key: "slots", label: "Slots" },
    { key: "sports_betting", label: "Sports" },
    { key: "wins", label: "Wins" },
    { key: "losses", label: "Losses" },
  ];

  const ranges: { key: PlayingDateRange; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
    { key: "all", label: "All Time" },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setDateRange(r.key)}
            className={`rounded-full border px-2.5 py-1 text-[11.5px] font-semibold ${
              dateRange === r.key
                ? "border-td-gold bg-td-surface2 text-td-goldsoft"
                : "border-td-border text-td-muted hover:border-td-gold"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {typeChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setTypeFilter(chip.key)}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold ${
              typeFilter === chip.key
                ? "border-td-gold bg-td-gold text-td-cream"
                : "border-td-border text-td-muted hover:border-td-gold"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-10 text-center text-[13.5px] text-td-muted">
          <p>No gaming sessions match this filter.</p>
        </div>
      )}

      {filtered.map((session) => {
        const isOpen = !!expanded[session.id];
        const net = netResult(session);
        const hours = hoursPlayed(session.start_time, session.ended_at);
        const hourly = sessionHourlyRate(session);
        const category = getGamingCategory(session);

        return (
          <div key={session.id} className="border-b border-td-border pb-1 last:border-none">
            <button
              onClick={() => setExpanded((s) => ({ ...s, [session.id]: !s[session.id] }))}
              className="flex w-full items-center gap-2 px-1 py-3 text-left"
            >
              {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              <div className="min-w-0 flex-1 flex-col items-start">
                <span className="truncate text-sm font-semibold">
                  {fmtDateHeader(session.start_time)} · {gamingCategoryLabel(category)}
                </span>
                <span className="truncate text-[11.5px] text-td-muted">
                  {session.location ? `${session.location} · ` : ""}
                  {session.game}
                  {session.stakes ? ` · ${session.stakes}` : ""}
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
              <span className={`shrink-0 font-mono text-[15px] font-semibold ${netResultColorClass(net)}`}>
                {net != null ? formatSignedMoney(net) : "—"}
              </span>
            </button>

            {isOpen && (
              <div className="my-2.5 flex flex-col gap-2 px-1 text-[12.5px]">
                <DetailRow label="Category" value={sessionCategoryLabel(session)} />
                <DetailRow label="Start" value={fmtTime(session.start_time)} />
                {session.ended_at && <DetailRow label="End" value={fmtTime(session.ended_at)} />}
                <DetailRow label="Initial Buy-in" value={formatMoneyPrecise(session.initial_buy_in)} />
                <DetailRow label="Additional Buy-ins" value={formatMoneyPrecise(session.additional_buy_ins)} />
                <DetailRow label="Total Buy-ins" value={formatMoneyPrecise(totalBuyIns(session))} />
                <DetailRow label={cashOutLabel(session.session_type)} value={formatMoneyPrecise(session.cash_out || 0)} />
                <DetailRow label={stakesOrMinimumLabel(session)} value={session.stakes || "—"} />
                <DetailRow label="Expenses" value={formatMoneyPrecise(session.expenses || 0)} />
                {session.notes && <p className="py-1 italic text-td-muted">{session.notes}</p>}
                <button
                  onClick={() => onDelete(session.id)}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-td-red py-2.5 px-3.5 text-[13px] font-semibold text-red-300"
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
