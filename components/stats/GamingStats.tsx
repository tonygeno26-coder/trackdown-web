"use client";

import { PlayingStatsSummary, formatSignedMoney, netResultColorClass, formatDuration } from "@/lib/playing";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function GamingStats({
  stats,
  pokerNet,
  tableNet,
  pokerLabel,
  tableLabel,
}: {
  stats: PlayingStatsSummary;
  pokerNet: number;
  tableNet: number;
  pokerLabel: string;
  tableLabel: string;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-[13px] font-bold uppercase tracking-[1.5px] text-td-cream">
        Gaming Stats
      </h2>
      <PlayingCard className="grid grid-cols-2 gap-2.5 p-4 text-[12px]">
        <StatCell
          label="Total P/L"
          value={formatSignedMoney(stats.totalNet)}
          valueClass={netResultColorClass(stats.totalNet)}
          className="col-span-2"
        />
        <StatCell label={pokerLabel} value={formatSignedMoney(pokerNet)} valueClass={netResultColorClass(pokerNet)} />
        <StatCell label={tableLabel} value={formatSignedMoney(tableNet)} valueClass={netResultColorClass(tableNet)} />
        <StatCell label="Hours Played" value={formatDuration(stats.totalHours)} />
        <StatCell
          label="Hourly Rate"
          value={stats.overallHourly != null ? `${formatSignedMoney(stats.overallHourly)}/hr` : "—"}
          valueClass={netResultColorClass(stats.overallHourly)}
        />
        <StatCell label="Win %" value={stats.winPercentage != null ? `${stats.winPercentage.toFixed(0)}%` : "—"} />
        <StatCell label="Sessions" value={String(stats.sessionCount)} />
        <StatCell
          label="Biggest Win"
          value={stats.biggestWin != null ? formatSignedMoney(stats.biggestWin) : "—"}
          valueClass="text-td-goldsoft"
        />
        <StatCell
          label="Biggest Loss"
          value={stats.biggestLoss != null ? formatSignedMoney(stats.biggestLoss) : "—"}
          valueClass="text-red-300"
        />
      </PlayingCard>
    </section>
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
    <div className={`rounded-xl border border-td-border/70 bg-td-surface2/50 px-3 py-2.5 ${className}`}>
      <span className="text-[10px] uppercase tracking-[1px] text-td-muted">{label}</span>
      <span className={`mt-0.5 block font-mono font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
