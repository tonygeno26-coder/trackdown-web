"use client";

import { useState } from "react";
import { getRandomScenario } from "@/lib/training/poker-scenarios";
import {
  isActionAcceptable,
  loadTrainingProgress,
  saveTrainingProgress,
  recordScenarioResult,
  scenarioPreferredAccuracy,
  scenarioAcceptableAccuracy,
} from "@/lib/training/progress";
import { PokerAction, PokerScenario } from "@/lib/training/types";
import PokerScenarioCard from "@/components/train/gaming/PokerScenarioCard";
import PokerScenarioResult from "@/components/train/gaming/PokerScenarioResult";
import {
  PrimaryPlayingButton,
  TrainHeader,
  TrainStatsRow,
  TrainStickyFooter,
} from "@/components/train/TrainingUi";

const ACTION_LABELS: Record<PokerAction, string> = {
  fold: "Fold",
  call: "Call",
  check: "Check",
  bet: "Bet",
  raise: "Raise",
};

export default function PokerDecisionSimulator({ onBack }: { onBack: () => void }) {
  const [scenario, setScenario] = useState<PokerScenario>(() => getRandomScenario());
  const [chosen, setChosen] = useState<PokerAction | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState(() => loadTrainingProgress().poker.scenarios);

  const submit = (action: PokerAction) => {
    if (submitted) return;
    setChosen(action);
    setSubmitted(true);
    const preferred = action === scenario.preferredAction;
    const acceptable = isActionAcceptable(scenario.recommended, action);
    const progress = recordScenarioResult(loadTrainingProgress(), {
      preferred,
      acceptable,
      heroPosition: scenario.heroPosition,
      tags: scenario.tags,
    });
    saveTrainingProgress(progress);
    setStats(progress.poker.scenarios);
  };

  const next = () => {
    setScenario(getRandomScenario(scenario.id));
    setChosen(null);
    setSubmitted(false);
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title="Decision Simulator"
        subtitle="Solver-style training scenarios — not a computed Nash equilibrium."
        onBack={onBack}
      />

      <div className="mb-4 space-y-2 rounded-xl border border-td-border/60 bg-td-surface2/40 p-4">
        <TrainStatsRow label="Preferred accuracy" value={`${scenarioPreferredAccuracy(stats)}%`} />
        <TrainStatsRow label="Acceptable accuracy" value={`${scenarioAcceptableAccuracy(stats)}%`} />
        <TrainStatsRow label="Streak" value={String(stats.currentStreak)} />
        <TrainStatsRow label="Completed" value={String(stats.attempted)} />
      </div>

      <PokerScenarioCard scenario={scenario} />

      {!submitted ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {scenario.availableActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => submit(action)}
              className="rounded-xl border border-td-border bg-td-surface2 py-4 text-[14px] font-bold uppercase tracking-wide text-td-cream hover:border-td-gold/40"
            >
              {ACTION_LABELS[action]}
            </button>
          ))}
        </div>
      ) : (
        chosen && (
          <div className="mt-4">
            <PokerScenarioResult
              scenario={scenario}
              chosen={chosen}
              preferred={chosen === scenario.preferredAction}
              acceptable={isActionAcceptable(scenario.recommended, chosen)}
            />
          </div>
        )
      )}

      <TrainStickyFooter>
        {submitted && (
          <PrimaryPlayingButton type="button" onClick={next}>
            Next Scenario
          </PrimaryPlayingButton>
        )}
      </TrainStickyFooter>
    </div>
  );
}
