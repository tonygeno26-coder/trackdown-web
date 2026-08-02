"use client";

import { GraduationCap, Spade } from "lucide-react";
import { TrainCard, TrainHeader } from "@/components/train/TrainingUi";

export default function TrainLanding({
  onDealer,
  onGaming,
  onProgress,
}: {
  onDealer: () => void;
  onGaming: () => void;
  onProgress: () => void;
}) {
  return (
    <div className="pb-28">
      <TrainHeader
        title="Train"
        subtitle="Sharpen your skills on both sides of the table."
      />
      <div className="space-y-4">
        <TrainCard
          title="Dealer Training"
          description="Practice procedures, calculations, accuracy and speed."
          icon={<GraduationCap size={22} strokeWidth={1.75} />}
          onClick={onDealer}
        />
        <TrainCard
          title="Gaming Training"
          description="Study poker decisions, odds and strategy."
          icon={<Spade size={22} strokeWidth={1.75} />}
          onClick={onGaming}
        />
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
