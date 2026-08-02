"use client";

import { useRef, useState } from "react";
import { recordAdaptiveAttempt, loadAdaptiveTraining } from "@/lib/training/adaptive-storage";
import { computeTopicStats } from "@/lib/training/adaptive-recommendations";
import { pickAdaptiveScenario } from "@/lib/training/adaptive-session";
import { mapScenarioToTopic } from "@/lib/training/adaptive-topics";
import { PokerTopic } from "@/lib/training/adaptive-types";
import {
  isActionAcceptable,
  loadTrainingProgress,
  saveTrainingProgress,
  recordScenarioResult,
} from "@/lib/training/progress";
import { PokerAction, PokerScenario } from "@/lib/training/types";
import PokerTable from "@/components/train/gaming/PokerTable";
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

function actionButtonLabel(scenario: PokerScenario, action: PokerAction): string {
  return scenario.actionLabels?.[action] ?? ACTION_LABELS[action];
}

export default function PokerDecisionSimulator({
  onBack,
  focusTopic,
}: {
  onBack: () => void;
  focusTopic?: PokerTopic;
}) {
  const [scenario, setScenario] = useState<PokerScenario>(() => pickAdaptiveScenario(focusTopic));
  const [chosen, setChosen] = useState<PokerAction | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const topic = focusTopic ?? mapScenarioToTopic(scenario);
  const [adaptiveStats, setAdaptiveStats] = useState(() =>
    computeTopicStats(topic, loadAdaptiveTraining().attempts)
  );
  const startMs = useRef(Date.now());

  const refreshAdaptiveStats = (t: PokerTopic) => {
    setAdaptiveStats(computeTopicStats(t, loadAdaptiveTraining().attempts));
  };

  const submit = (action: PokerAction) => {
    if (submitted) return;
    const responseMs = Date.now() - startMs.current;
    setChosen(action);
    setSubmitted(true);
    const preferred = action === scenario.preferredAction;
    const acceptable = isActionAcceptable(scenario.recommended, action);
    const scenarioTopic = mapScenarioToTopic(scenario);

    recordAdaptiveAttempt({
      date: new Date().toISOString(),
      topic: scenarioTopic,
      difficulty: scenario.difficulty,
      correct: preferred || acceptable,
      responseMs,
      questionId: scenario.id,
    });

    const progress = recordScenarioResult(loadTrainingProgress(), {
      preferred,
      acceptable,
      heroPosition: scenario.heroPosition,
      tags: scenario.tags,
    });
    saveTrainingProgress(progress);
    refreshAdaptiveStats(scenarioTopic);
  };

  const next = () => {
    setScenario(pickAdaptiveScenario(focusTopic, scenario.id));
    setChosen(null);
    setSubmitted(false);
    startMs.current = Date.now();
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title="Decision Trainer"
        subtitle="Adaptive solver-style scenarios — not a computed Nash equilibrium."
        onBack={onBack}
      />

      <div className="mb-4 space-y-2 rounded-xl border border-td-border/60 bg-td-surface2/40 p-4">
        <TrainStatsRow label="Topic accuracy" value={`${adaptiveStats.accuracy}%`} />
        <TrainStatsRow label="Confidence" value={String(adaptiveStats.confidence)} />
        <TrainStatsRow label="Streak" value={String(adaptiveStats.currentStreak)} />
        <TrainStatsRow label="Focus" value={focusTopic ?? mapScenarioToTopic(scenario)} />
      </div>

      <PokerTable scenario={scenario} highlightHero={submitted} />

      {!submitted ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {scenario.availableActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => submit(action)}
              className="rounded-xl border border-td-border bg-td-surface2 py-4 text-[14px] font-bold uppercase tracking-wide text-td-cream hover:border-td-gold/40"
            >
              {actionButtonLabel(scenario, action)}
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
