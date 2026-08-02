"use client";

import { DealingStatsSummary, formatDealerEarnings } from "@/lib/dealing-stats";
import { formatDuration } from "@/lib/playing";
import { fmtHourlyRate } from "@/lib/blocks";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function DealingStats({ stats }: { stats: DealingStatsSummary }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-[13px] font-bold uppercase tracking-[1.5px] text-td-cream">
        Dealing Stats
      </h2>
      <PlayingCard className="grid grid-cols-2 gap-2.5 p-4 text-[12px]">
        <StatCell label="Tournament" value={formatDealerEarnings(stats.tournamentEarnings)} valueClass="text-td-goldsoft" />
        <StatCell label="Cash Tips" value={formatDealerEarnings(stats.cashTips)} valueClass="text-td-goldsoft" />
        <StatCell label="Home Game" value={formatDealerEarnings(stats.homeGameEarnings)} valueClass="text-td-goldsoft" />
        <StatCell label="Downs Worked" value={String(stats.downsWorked)} />
        <StatCell label="Hours Dealt" value={formatDuration(stats.hoursDealt)} />
        <StatCell
          label="Hourly Rate"
          value={stats.hourlyRate != null ? fmtHourlyRate(stats.hourlyRate) : "—"}
          valueClass="text-td-goldsoft"
        />
      </PlayingCard>
    </section>
  );
}

function StatCell({
  label,
  value,
  valueClass = "text-td-cream",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-td-border/70 bg-td-surface2/50 px-3 py-2.5">
      <span className="text-[10px] uppercase tracking-[1px] text-td-muted">{label}</span>
      <span className={`mt-0.5 block font-mono font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
