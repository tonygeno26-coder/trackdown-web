"use client";

import { PlayingSession } from "@/lib/types";
import {
  PlayingDateRange,
  PlayingStatsSummary,
  computePlayingStats,
  formatDuration,
  formatMoneyPrecise,
  formatSignedMoney,
  netResultColorClass,
  sessionInDateRange,
} from "@/lib/playing";

export default function PlayingStats({
  sessions,
  dateRange,
  onDateRangeChange,
}: {
  sessions: PlayingSession[];
  dateRange: PlayingDateRange;
  onDateRangeChange: (range: PlayingDateRange) => void;
}) {
  const filtered = sessions.filter(
    (s) => s.status === "completed" && sessionInDateRange(s, dateRange)
  );
  const stats: PlayingStatsSummary = computePlayingStats(filtered);

  const ranges: { key: PlayingDateRange; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
    { key: "all", label: "All Time" },
  ];

  return (
    <div className="mb-4">
      <div className="flex gap-1.5 flex-wrap mb-3">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => onDateRangeChange(r.key)}
            className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full border ${
              dateRange === r.key
                ? "bg-td-surface2 border-td-gold text-td-goldsoft"
                : "bg-transparent border-td-border text-td-muted hover:border-td-gold"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="bg-td-surface border border-td-border rounded-2xl px-4 py-4">
        <div className="text-center mb-4">
          <span className="text-[11px] text-td-muted uppercase tracking-wide block mb-1">Total P/L</span>
          <span className={`font-mono font-semibold text-3xl ${netResultColorClass(stats.totalNet)}`}>
            {formatSignedMoney(stats.totalNet)}
          </span>
          {stats.overallHourly != null && (
            <span className={`block font-mono text-[13px] mt-1 ${netResultColorClass(stats.overallHourly)}`}>
              {formatSignedMoney(stats.overallHourly)}/hr overall
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-[12px]">
          <StatCell label="Hours" value={formatDuration(stats.totalHours)} />
          <StatCell label="Sessions" value={String(stats.sessionCount)} />
          <StatCell label="Wins" value={String(stats.winningSessions)} valueClass="text-td-goldsoft" />
          <StatCell label="Losses" value={String(stats.losingSessions)} valueClass="text-red-300" />
          <StatCell
            label="Win %"
            value={stats.winPercentage != null ? `${stats.winPercentage.toFixed(0)}%` : "—"}
          />
          <StatCell
            label="Biggest Win"
            value={stats.biggestWin != null ? formatSignedMoney(stats.biggestWin) : "—"}
            valueClass="text-td-goldsoft"
          />
          <StatCell
            label="Biggest Loss"
            value={stats.biggestLoss != null ? formatSignedMoney(stats.biggestLoss) : "—"}
            valueClass="text-red-300"
            className="col-span-2"
          />
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  valueClass = "text-td-cream",
  className = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
  className?: string;
}) {
  return (
    <div className={`bg-td-surface2 border border-td-border rounded-lg px-3 py-2.5 ${className}`}>
      <span className="text-[10px] text-td-muted uppercase tracking-wide block mb-0.5">{label}</span>
      <span className={`font-mono font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
