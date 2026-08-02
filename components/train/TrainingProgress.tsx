"use client";

import { useMemo } from "react";
import { DEALER_TIPS } from "@/lib/training/dealer-tips";
import {
  accuracyPct,
  averageBlackjackResponseMs,
  loadTrainingProgress,
  scenarioAcceptableAccuracy,
  scenarioPreferredAccuracy,
} from "@/lib/training/progress";
import { TrainHeader, TrainStatsRow } from "@/components/train/TrainingUi";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function TrainingProgress({ onBack }: { onBack: () => void }) {
  const progress = useMemo(() => loadTrainingProgress(), []);

  const bestCalcStreak = Math.max(
    progress.dealer.potCalc.bestStreak,
    progress.dealer.ploCalc.bestStreak
  );
  const bestPokerStreak = Math.max(
    progress.poker.scenarios.bestStreak,
    progress.poker.potOdds.bestStreak
  );

  return (
    <div className="pb-28">
      <TrainHeader
        title="Progress"
        subtitle="Training stats are stored locally and never affect financial Stats."
        onBack={onBack}
      />

      <PlayingCard className="mb-4 space-y-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Dealer</p>
        <TrainStatsRow
          label="Lessons completed"
          value={`${progress.dealer.completedTipIds.length} / ${DEALER_TIPS.length}`}
        />
        <TrainStatsRow
          label="Pot calculation accuracy"
          value={`${accuracyPct(progress.dealer.potCalc)}%`}
        />
        <TrainStatsRow
          label="PLO calculation accuracy"
          value={`${accuracyPct(progress.dealer.ploCalc)}%`}
        />
        <TrainStatsRow label="Best calculation streak" value={String(bestCalcStreak)} />
      </PlayingCard>

      <PlayingCard className="mb-4 space-y-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Blackjack</p>
        <TrainStatsRow
          label="Total hands"
          value={String(progress.blackjack.total.attempted)}
        />
        <TrainStatsRow
          label="Overall accuracy"
          value={`${accuracyPct(progress.blackjack.total)}%`}
        />
        <TrainStatsRow
          label="Hard / soft / pair"
          value={`${accuracyPct(progress.blackjack.hard)}% / ${accuracyPct(progress.blackjack.soft)}% / ${accuracyPct(progress.blackjack.pair)}%`}
        />
        <TrainStatsRow label="Best streak" value={String(progress.blackjack.total.bestStreak)} />
        <TrainStatsRow
          label="Avg response time"
          value={
            progress.blackjack.responseCount > 0
              ? `${(averageBlackjackResponseMs(progress.blackjack) / 1000).toFixed(1)}s`
              : "—"
          }
        />
      </PlayingCard>

      <PlayingCard className="space-y-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Poker</p>
        <TrainStatsRow
          label="Scenarios completed"
          value={String(progress.poker.scenarios.attempted)}
        />
        <TrainStatsRow
          label="Preferred-action accuracy"
          value={`${scenarioPreferredAccuracy(progress.poker.scenarios)}%`}
        />
        <TrainStatsRow
          label="Acceptable-action accuracy"
          value={`${scenarioAcceptableAccuracy(progress.poker.scenarios)}%`}
        />
        <TrainStatsRow
          label="Pot-odds accuracy"
          value={`${accuracyPct(progress.poker.potOdds)}%`}
        />
        <TrainStatsRow label="Best poker-training streak" value={String(bestPokerStreak)} />
      </PlayingCard>
    </div>
  );
}
