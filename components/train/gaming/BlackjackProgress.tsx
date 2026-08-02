"use client";

import { useMemo } from "react";
import {
  accuracyPct,
  averageBlackjackResponseMs,
  loadTrainingProgress,
} from "@/lib/training/progress";
import { TrainHeader, TrainStatsRow } from "@/components/train/TrainingUi";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function BlackjackProgress({ onBack }: { onBack: () => void }) {
  const stats = useMemo(() => loadTrainingProgress().blackjack, []);

  return (
    <div className="pb-28">
      <TrainHeader
        title="Blackjack Progress"
        subtitle="Stored locally — never affects financial Stats."
        onBack={onBack}
      />

      <PlayingCard className="space-y-2 p-5">
        <TrainStatsRow label="Total hands" value={String(stats.total.attempted)} />
        <TrainStatsRow label="Overall accuracy" value={`${accuracyPct(stats.total)}%`} />
        <TrainStatsRow label="Hard totals" value={`${accuracyPct(stats.hard)}%`} />
        <TrainStatsRow label="Soft totals" value={`${accuracyPct(stats.soft)}%`} />
        <TrainStatsRow label="Pairs" value={`${accuracyPct(stats.pair)}%`} />
        <TrainStatsRow label="Surrender" value={`${accuracyPct(stats.surrender)}%`} />
        <TrainStatsRow label="Current streak" value={String(stats.total.currentStreak)} />
        <TrainStatsRow label="Best streak" value={String(stats.total.bestStreak)} />
        <TrainStatsRow label="Speed best streak" value={String(stats.speedBestStreak)} />
        <TrainStatsRow
          label="Avg response time"
          value={stats.responseCount > 0 ? `${(averageBlackjackResponseMs(stats) / 1000).toFixed(1)}s` : "—"}
        />
        <TrainStatsRow label="Mistakes queued" value={String(stats.mistakeQueue.length)} />
      </PlayingCard>
    </div>
  );
}
