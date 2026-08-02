"use client";

import { Shift, PlayingSession } from "@/lib/types";
import { computeDealingStats, formatDealerEarnings } from "@/lib/dealing-stats";
import {
  computePlayingStats,
  formatDuration,
  formatSignedMoney,
  netResultColorClass,
  sessionInDateRange,
  shiftInDateRange,
  PlayingDateRange,
  netResult,
} from "@/lib/playing";
import { getGamingCategory, gamingCategoryLabel } from "@/lib/gaming";
import DealingStats from "@/components/stats/DealingStats";
import GamingStats from "@/components/stats/GamingStats";
import TrackdownHeader from "@/components/TrackdownHeader";
import { SurfaceCard, MoneyValue, SectionHeader } from "@/components/ui";
import { useState } from "react";

export default function StatsScreen({
  shifts,
  playingSessions,
}: {
  shifts: Shift[];
  playingSessions: PlayingSession[];
}) {
  const [dateRange, setDateRange] = useState<PlayingDateRange>("all");

  const completedShifts = shifts.filter((s) => s.status === "completed");
  const completedSessions = playingSessions.filter((s) => s.status === "completed");

  const dealingFiltered = completedShifts.filter((s) => shiftInDateRange(s, dateRange));
  const dealingStats = computeDealingStats(dealingFiltered);
  const gamingFiltered = completedSessions.filter((s) => sessionInDateRange(s, dateRange));
  const gamingStats = computePlayingStats(gamingFiltered);

  const pokerSessions = gamingFiltered.filter((s) => getGamingCategory(s) === "poker");
  const tableSessions = gamingFiltered.filter((s) => getGamingCategory(s) === "table_games");
  const pokerNet = pokerSessions.reduce((sum, s) => sum + (netResult(s) || 0), 0);
  const tableNet = tableSessions.reduce((sum, s) => sum + (netResult(s) || 0), 0);

  const totalHours = dealingStats.hoursDealt + gamingStats.totalHours;

  const ranges: { key: PlayingDateRange; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
    { key: "all", label: "All Time" },
  ];

  return (
    <div className="space-y-6 pb-4">
      <TrackdownHeader compact />

      <div className="flex flex-wrap gap-1.5">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setDateRange(r.key)}
            className={`min-h-[36px] rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${
              dateRange === r.key
                ? "border-td-gold bg-td-surface2 text-td-goldsoft"
                : "border-td-border text-td-muted hover:border-td-gold"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <SurfaceCard className="px-5 py-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-td-muted">Dealer Earnings</p>
          <div className="mt-2">
            <MoneyValue amount={formatDealerEarnings(dealingStats.totalEarnings)} positive size="lg" />
          </div>
        </SurfaceCard>
        <SurfaceCard className="px-5 py-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-td-muted">Gaming Profit</p>
          <p className={`mt-2 font-mono text-[28px] font-semibold ${netResultColorClass(gamingStats.totalNet)}`}>
            {formatSignedMoney(gamingStats.totalNet)}
          </p>
          <p className="mt-1 text-[11px] text-td-muted">Includes wins and losses</p>
        </SurfaceCard>
        <SurfaceCard className="px-5 py-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-td-muted">Total Hours</p>
          <p className="mt-2 font-mono text-[28px] font-semibold text-td-cream">{formatDuration(totalHours)}</p>
        </SurfaceCard>
      </div>

      <SectionHeader title="Breakdown" className="mb-3" />
      <DealingStats stats={dealingStats} />
      <GamingStats
        stats={gamingStats}
        pokerNet={pokerNet}
        tableNet={tableNet}
        pokerLabel={gamingCategoryLabel("poker")}
        tableLabel={gamingCategoryLabel("table_games")}
      />
    </div>
  );
}
