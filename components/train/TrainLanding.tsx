"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Spade, Layers } from "lucide-react";
import SolverProCard from "@/components/train/premium/SolverProCard";
import AdaptiveFocusCard from "@/components/train/AdaptiveFocusCard";
import { TrainCard, TrainHeader } from "@/components/train/TrainingUi";
import { buildAdaptiveDashboard } from "@/lib/training/adaptive-recommendations";
import { trainerRouteForTopic } from "@/lib/training/adaptive-topics";
import { FocusRecommendation, TrainerRoute } from "@/lib/training/adaptive-types";

function InsightList({
  title,
  items,
  empty,
  onPractice,
}: {
  title: string;
  items: { topic: FocusRecommendation["topic"]; label: string; accuracy: number }[];
  empty: string;
  onPractice: (route: TrainerRoute) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-td-border/40 bg-td-surface2/30 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">{title}</p>
        <p className="mt-1 text-[13px] text-td-muted">{empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">{title}</p>
      {items.map((item) => (
        <button
          key={item.topic}
          type="button"
          onClick={() => onPractice(trainerRouteForTopic(item.topic))}
          className="flex w-full items-center justify-between rounded-xl border border-td-border/50 bg-td-surface2/40 px-4 py-2.5 text-left hover:border-td-gold/30"
        >
          <span className="text-[13px] font-medium text-td-cream">{item.label}</span>
          <span className="font-mono text-[12px] text-td-goldsoft">{item.accuracy}%</span>
        </button>
      ))}
    </div>
  );
}

export default function TrainLanding({
  onDealer,
  onPoker,
  onBlackjack,
  onSolverPro,
  onProgress,
  onAdaptivePractice,
}: {
  onDealer: () => void;
  onPoker: () => void;
  onBlackjack: () => void;
  onSolverPro: () => void;
  onProgress: () => void;
  onAdaptivePractice: (route: TrainerRoute) => void;
}) {
  const [dashboard, setDashboard] = useState(() => buildAdaptiveDashboard());

  useEffect(() => {
    setDashboard(buildAdaptiveDashboard());
  }, []);

  const handleFocusPractice = (item: FocusRecommendation) => {
    onAdaptivePractice(item.trainerRoute);
  };

  const handleInsightPractice = (route: TrainerRoute) => {
    onAdaptivePractice(route);
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title="Train"
        subtitle="Adaptive practice tailored to your strengths and gaps."
      />

      <div className="mb-6 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">
          Today&apos;s Focus
        </p>
        <div className="space-y-2">
          {dashboard.todaysFocus.map((item) => (
            <AdaptiveFocusCard key={item.area} item={item} onPractice={handleFocusPractice} />
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4">
        <InsightList
          title="Recently Improved"
          items={dashboard.recentlyImproved}
          empty="Keep practicing — improvements show after a few sessions."
          onPractice={handleInsightPractice}
        />
        <InsightList
          title="Needs Attention"
          items={dashboard.needsAttention}
          empty="No weak spots flagged yet. Complete drills to build your profile."
          onPractice={handleInsightPractice}
        />
        <InsightList
          title="Mastered Skills"
          items={dashboard.masteredSkills}
          empty="Master topics by hitting 85%+ accuracy with consistent reps."
          onPractice={handleInsightPractice}
        />
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">
          Browse training
        </p>
        <TrainCard
          title="Dealer Training"
          description="Procedures, pot math, PLO calculations, and speed."
          icon={<GraduationCap size={22} strokeWidth={1.75} />}
          onClick={onDealer}
        />
        <TrainCard
          title="Poker Training"
          description="Decision scenarios, pot odds, and street-by-street study."
          icon={<Spade size={22} strokeWidth={1.75} />}
          onClick={onPoker}
        />
        <TrainCard
          title="Blackjack Training"
          description="Basic strategy drills with configurable rules."
          icon={<Layers size={22} strokeWidth={1.75} />}
          onClick={onBlackjack}
        />

        <p className="pt-2 text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">
          Trackdown Pro tools
        </p>
        <SolverProCard onClick={onSolverPro} />

        <button
          type="button"
          onClick={onProgress}
          className="w-full rounded-xl border border-td-border/60 bg-td-surface2/40 py-3.5 text-[13px] font-semibold text-td-muted hover:border-td-gold/30 hover:text-td-cream"
        >
          View Training Progress
        </button>
      </div>
    </div>
  );
}
