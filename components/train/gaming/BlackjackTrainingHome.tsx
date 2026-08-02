"use client";

import { Settings, BarChart3, Shuffle, Hash, Sparkle, Copy, Timer, RotateCcw } from "lucide-react";
import {
  BlackjackTrainingMode,
  BLACKJACK_MODE_LABELS,
  loadBlackjackRules,
  rulesSummary,
} from "@/lib/training/blackjack";
import { loadTrainingProgress } from "@/lib/training/progress";
import { TrainCard, TrainHeader, TrainModuleGrid } from "@/components/train/TrainingUi";
import { PlayingCard } from "@/components/playing/PlayingUi";

const MODES: { key: BlackjackTrainingMode; icon: typeof Shuffle; desc: string }[] = [
  { key: "random", icon: Shuffle, desc: "Mixed hard, soft, and pair decisions." },
  { key: "hard", icon: Hash, desc: "Hard-total basic strategy only." },
  { key: "soft", icon: Sparkle, desc: "Hands with an ace counted as 11." },
  { key: "pairs", icon: Copy, desc: "Pair-splitting decisions." },
  { key: "mistakes", icon: RotateCcw, desc: "Review previously missed spots." },
  { key: "speed", icon: Timer, desc: "Timed decisions with response tracking." },
];

export default function BlackjackTrainingHome({
  onBack,
  onMode,
  onSettings,
  onProgress,
}: {
  onBack: () => void;
  onMode: (mode: BlackjackTrainingMode) => void;
  onSettings: () => void;
  onProgress: () => void;
}) {
  const rules = loadBlackjackRules();
  const mistakes = loadTrainingProgress().blackjack.mistakeQueue.length;

  return (
    <div className="pb-28">
      <TrainHeader
        title="Blackjack Training"
        subtitle="Practice basic strategy with configurable rules."
        onBack={onBack}
      />

      <PlayingCard className="mb-4 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">Active rules</p>
        <p className="mt-1 text-[13px] text-td-cream">{rulesSummary(rules)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSettings}
            className="flex items-center justify-center gap-2 rounded-xl border border-td-border bg-td-surface2 py-3 text-[12px] font-semibold text-td-muted hover:text-td-cream"
          >
            <Settings size={16} /> Rules
          </button>
          <button
            type="button"
            onClick={onProgress}
            className="flex items-center justify-center gap-2 rounded-xl border border-td-border bg-td-surface2 py-3 text-[12px] font-semibold text-td-muted hover:text-td-cream"
          >
            <BarChart3 size={16} /> Progress
          </button>
        </div>
      </PlayingCard>

      <TrainModuleGrid>
        {MODES.map(({ key, icon: Icon, desc }) => (
          <TrainCard
            key={key}
            title={BLACKJACK_MODE_LABELS[key]}
            description={desc}
            icon={<Icon size={20} strokeWidth={1.75} />}
            onClick={() => onMode(key)}
            badge={key === "mistakes" && mistakes > 0 ? `${mistakes} queued` : undefined}
          />
        ))}
      </TrainModuleGrid>
    </div>
  );
}
