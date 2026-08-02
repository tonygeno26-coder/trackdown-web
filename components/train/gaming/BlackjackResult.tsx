"use client";

import { BlackjackAction, ACTION_LABELS } from "@/lib/training/blackjack";
import { TrainFeedback, TrainStatsRow } from "@/components/train/TrainingUi";

export default function BlackjackResult({
  correct,
  userChoice,
  recommended,
  explanation,
  ruleNote,
  streak,
  accuracy,
  responseMs,
  onNext,
}: {
  correct: boolean;
  userChoice: BlackjackAction;
  recommended: BlackjackAction;
  explanation: string;
  ruleNote?: string;
  streak: number;
  accuracy: number;
  responseMs?: number;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <TrainFeedback correct={correct} title={correct ? "Correct" : "Incorrect"}>
        <p>
          You chose <span className="font-bold">{ACTION_LABELS[userChoice]}</span>. Recommended:{" "}
          <span className="font-bold text-td-goldsoft">{ACTION_LABELS[recommended]}</span>.
        </p>
        <p className="mt-2 leading-relaxed">{explanation}</p>
        {ruleNote && <p className="mt-2 text-[12px] italic text-td-muted">{ruleNote}</p>}
      </TrainFeedback>

      <div className="rounded-xl border border-td-border/60 bg-td-surface2/40 p-4 space-y-1">
        <TrainStatsRow label="Running accuracy" value={`${accuracy}%`} />
        <TrainStatsRow label="Current streak" value={String(streak)} />
        {responseMs != null && (
          <TrainStatsRow label="Response time" value={`${(responseMs / 1000).toFixed(1)}s`} />
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="flex w-full items-center justify-center rounded-td-lg bg-td-gradient-red py-4 font-display text-[13.5px] font-bold uppercase tracking-[1.5px] text-td-cream shadow-td-glow-sm"
      >
        Next Hand
      </button>
    </div>
  );
}
