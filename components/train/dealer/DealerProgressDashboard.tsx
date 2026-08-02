"use client";

import { useMemo, useState } from "react";
import { TrainHeader } from "@/components/train/TrainingUi";
import { SurfaceCard, SectionHeader, StatCard, SegmentedControl, ProgressBar } from "@/components/ui";
import { loadTrainingProgress, dealerOverallAccuracy, accuracyPct } from "@/lib/training/progress";
import { skillGroupStats, MODULE_LABELS } from "@/lib/training/adaptive-dealer";
import { DEALER_SKILL_LABELS, DateRangeFilter, DealerModuleKey, SpeedDrillPersonalBest } from "@/lib/training/dealer-types";

function formatMs(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function DealerProgressDashboard({ onBack }: { onBack: () => void }) {
  const [range, setRange] = useState<DateRangeFilter>("30d");
  const progress = useMemo(() => loadTrainingProgress(), []);
  const dealer = progress.dealer;
  const groups = skillGroupStats(dealer, range);

  const modules: { key: DealerModuleKey; stats: { attempted: number; correct: number } }[] = [
    { key: "pot", stats: dealer.potCalc },
    { key: "plo", stats: dealer.ploCalc },
    { key: "side-pot", stats: dealer.sidePot },
    { key: "misdeal", stats: dealer.misdeal },
    { key: "tournament-quiz", stats: dealer.tournamentQuiz },
    { key: "cash-quiz", stats: dealer.cashQuiz },
    { key: "board-reading", stats: dealer.boardReading },
    { key: "hi-lo", stats: dealer.hiLo },
    { key: "speed", stats: { attempted: dealer.speed.totalAttempted, correct: dealer.speed.totalCorrect } },
  ];

  return (
    <div className="pb-28">
      <TrainHeader title="Dealer Progress" subtitle="Training dashboard" onBack={onBack} />

      <SegmentedControl
        value={range}
        onChange={(v) => setRange(v as DateRangeFilter)}
        options={[
          { key: "7d", label: "7d" },
          { key: "30d", label: "30d" },
          { key: "all", label: "All" },
        ]}
      />

      <div className="my-4 grid grid-cols-2 gap-2">
        <StatCard label="Overall accuracy" value={`${dealerOverallAccuracy(dealer)}%`} />
        <StatCard label="Training time" value={formatMs(dealer.totalTrainingMs)} />
        <StatCard label="Day streak" value={`${dealer.streakDays}`} />
        <StatCard label="Tips completed" value={`${dealer.tips.completedIds.length}`} />
      </div>

      <SectionHeader title="Skill Groups" />
      <SurfaceCard className="mb-4 space-y-4 p-4">
        {Object.entries(DEALER_SKILL_LABELS).map(([key, label]) => {
          const g = groups[key as keyof typeof groups];
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="text-td-cream">{label}</span>
                <span className="font-mono text-td-goldsoft">{g.accuracy}%</span>
              </div>
              <ProgressBar value={g.accuracy} label={`${g.correct}/${g.attempted}`} />
            </div>
          );
        })}
      </SurfaceCard>

      <SectionHeader title="Module Breakdown" />
      <div className="space-y-2">
        {modules.map(({ key, stats }) => (
          <SurfaceCard key={key} className="flex items-center justify-between p-3">
            <span className="text-[13px] text-td-cream">{MODULE_LABELS[key]}</span>
            <span className="font-mono text-[13px] text-td-muted">
              {stats.correct}/{stats.attempted} · {accuracyPct(stats as Parameters<typeof accuracyPct>[0])}%
            </span>
          </SurfaceCard>
        ))}
      </div>

      {dealer.speed.personalBests.length > 0 && (
        <>
          <SectionHeader title="Speed Personal Bests" />
          <SurfaceCard className="space-y-2 p-4">
            {dealer.speed.personalBests.map((b: SpeedDrillPersonalBest) => (
              <div key={b.mode} className="flex justify-between text-[13px]">
                <span className="text-td-muted">{b.mode}</span>
                <span className="font-mono font-bold text-td-goldsoft">{b.score}</span>
              </div>
            ))}
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
