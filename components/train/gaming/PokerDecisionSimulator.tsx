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
import { PokerActionButtons } from "@/components/train/gaming/PokerActionButtons";
import { PrimaryButton } from "@/components/ui";
import {
  DrillScreen,
  DrillHeader,
  DrillStatsStrip,
  DrillNavigation,
} from "@/components/train/shared";

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
    <DrillScreen>
      <DrillHeader
        title="Decision Trainer"
        subtitle="Adaptive solver-style scenarios — not a computed Nash equilibrium."
        onBack={onBack}
      />

      <DrillStatsStrip
        rows={[
          { label: "Topic accuracy", value: `${adaptiveStats.accuracy}%` },
          { label: "Confidence", value: String(adaptiveStats.confidence) },
          { label: "Streak", value: String(adaptiveStats.currentStreak) },
          { label: "Focus", value: focusTopic ?? mapScenarioToTopic(scenario) },
        ]}
      />

      <PokerTable scenario={scenario} highlightHero={submitted} />

      {!submitted ? (
        <div className="mt-4">
          <PokerActionButtons
            actions={scenario.availableActions}
            labels={scenario.actionLabels}
            onSelect={submit}
            large
          />
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

      <DrillNavigation>
        {submitted && (
          <PrimaryButton type="button" onClick={next}>
            Next Scenario
          </PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
