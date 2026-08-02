"use client";

import { useState } from "react";
import { Settings, BarChart3, Shuffle, Hash, Sparkle, Copy, Timer, RotateCcw } from "lucide-react";
import {
  BlackjackTrainingMode,
  BLACKJACK_MODE_LABELS,
  loadBlackjackRules,
  rulesSummary,
} from "@/lib/training/blackjack";
import { loadTrainingProgress } from "@/lib/training/progress";
import { TrainCard, TrainHeader, TrainModuleGrid } from "@/components/train/TrainingUi";
import { SurfaceCard, SecondaryButton } from "@/components/ui";
import { DrillScreen } from "@/components/train/shared";
import { BlackjackRulesSheet } from "@/components/train/gaming/BlackjackSettings";

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
  onProgress,
}: {
  onBack: () => void;
  onMode: (mode: BlackjackTrainingMode) => void;
  onSettings?: () => void;
  onProgress: () => void;
}) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rulesSummaryText, setRulesSummaryText] = useState(() => rulesSummary(loadBlackjackRules()));
  const mistakes = loadTrainingProgress().blackjack.mistakeQueue.length;

  return (
    <DrillScreen>
      <TrainHeader
        title="Blackjack Training"
        subtitle="Practice basic strategy with configurable rules."
        onBack={onBack}
      />

      <SurfaceCard className="mb-4 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">Active rules</p>
        <p className="mt-1 text-[13px] text-td-cream">{rulesSummaryText}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <SecondaryButton type="button" onClick={() => setRulesOpen(true)} className="min-h-[48px] text-[12px]">
            <Settings size={16} /> Rules
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onProgress} className="min-h-[48px] text-[12px]">
            <BarChart3 size={16} /> Progress
          </SecondaryButton>
        </div>
      </SurfaceCard>

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

      {rulesOpen && (
        <BlackjackRulesSheet
          onClose={() => setRulesOpen(false)}
          onSaved={() => setRulesSummaryText(rulesSummary(loadBlackjackRules()))}
        />
      )}
    </DrillScreen>
  );
}
