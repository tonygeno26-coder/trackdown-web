"use client";

import { useEffect, useRef, useState } from "react";
import {
  BlackjackRules,
  BlackjackSituation,
  BlackjackTrainingMode,
  BlackjackAction,
  ACTION_LABELS,
  BLACKJACK_MODE_LABELS,
  loadBlackjackRules,
  rulesSummary,
} from "@/lib/training/blackjack";
import { generateSituation } from "@/lib/training/blackjack-hands";
import { recordAdaptiveAttempt, loadAdaptiveTraining } from "@/lib/training/adaptive-storage";
import { computeTopicStats } from "@/lib/training/adaptive-recommendations";
import { pickAdaptiveBlackjackSituation } from "@/lib/training/adaptive-session";
import { mapBlackjackToTopic } from "@/lib/training/adaptive-topics";
import { BlackjackTopic } from "@/lib/training/adaptive-types";
import {
  loadTrainingProgress,
  recordBlackjackResult,
  saveTrainingProgress,
  accuracyPct,
} from "@/lib/training/progress";
import { getAvailableActions, gradeStrategy } from "@/lib/training/blackjack-strategy";
import BlackjackHandDisplay from "@/components/train/gaming/BlackjackHand";
import BlackjackResult from "@/components/train/gaming/BlackjackResult";
import { EmptyState, SecondaryButton } from "@/components/ui";
import { RotateCcw } from "lucide-react";
import {
  DrillScreen,
  DrillHeader,
  DrillPromptCard,
  DrillStatsStrip,
} from "@/components/train/shared";

export default function BlackjackTrainer({
  mode,
  onBack,
  focusTopic,
}: {
  mode: BlackjackTrainingMode;
  onBack: () => void;
  focusTopic?: BlackjackTopic;
}) {
  const [rules] = useState<BlackjackRules>(() => loadBlackjackRules());
  const [situation, setSituation] = useState<BlackjackSituation | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [grade, setGrade] = useState<ReturnType<typeof gradeStrategy> | null>(null);
  const [userChoice, setUserChoice] = useState<BlackjackAction | null>(null);
  const [stats, setStats] = useState(() => loadTrainingProgress().blackjack);
  const [adaptiveStats, setAdaptiveStats] = useState(() =>
    computeTopicStats(focusTopic ?? "hard_totals", loadAdaptiveTraining().attempts)
  );
  const startMs = useRef<number>(Date.now());
  const [speedRemaining, setSpeedRemaining] = useState<number | null>(
    mode === "speed" ? 10 : null
  );

  const loadHand = () => {
    const progress = loadTrainingProgress();
    const next = focusTopic
      ? pickAdaptiveBlackjackSituation(rules, focusTopic, progress.blackjack.mistakeQueue)
      : generateSituation(mode, rules, progress.blackjack.mistakeQueue);
    setSituation(next);
    setSubmitted(false);
    setGrade(null);
    setUserChoice(null);
    startMs.current = Date.now();
  };

  useEffect(() => {
    loadHand();
  }, [mode, rules, focusTopic]);

  useEffect(() => {
    if (mode !== "speed" || speedRemaining == null || submitted) return;
    if (speedRemaining <= 0) return;
    const t = setTimeout(() => setSpeedRemaining((s) => (s != null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [mode, speedRemaining, submitted]);

  const answer = (action: BlackjackAction) => {
    if (!situation || submitted) return;
    const responseMs = Date.now() - startMs.current;
    const result = gradeStrategy(situation, rules, action);
    const topic = mapBlackjackToTopic(result.category, result.recommended);
    setUserChoice(action);
    setGrade(result);
    setSubmitted(true);

    recordAdaptiveAttempt({
      date: new Date().toISOString(),
      topic,
      difficulty: "intermediate",
      correct: result.correct,
      responseMs,
      questionId: situation.id,
    });

    let progress = loadTrainingProgress();
    progress = recordBlackjackResult(progress, {
      correct: result.correct,
      category: result.category,
      situationKey: situation.id,
      responseMs: mode === "speed" ? responseMs : undefined,
      isSpeedMode: mode === "speed",
    });
    saveTrainingProgress(progress);
    setStats(progress.blackjack);
    setAdaptiveStats(computeTopicStats(focusTopic ?? topic, loadAdaptiveTraining().attempts));
  };

  if (!situation) return null;

  const available = getAvailableActions(situation);

  if (mode === "mistakes" && stats.mistakeQueue.length === 0 && !submitted) {
    return (
      <DrillScreen>
        <DrillHeader title="Mistakes Review" onBack={onBack} />
        <EmptyState
          icon={RotateCcw}
          title="No Mistakes Queued"
          description="No mistakes queued yet. Train in other modes first."
        />
      </DrillScreen>
    );
  }

  return (
    <DrillScreen>
      <DrillHeader
        title={BLACKJACK_MODE_LABELS[mode]}
        subtitle={rulesSummary(rules)}
        onBack={onBack}
      />

      <DrillStatsStrip
        rows={[
          { label: "Topic accuracy", value: `${adaptiveStats.accuracy}%` },
          { label: "Confidence", value: String(adaptiveStats.confidence) },
          { label: "Overall accuracy", value: `${accuracyPct(stats.total)}%` },
          ...(focusTopic ? [{ label: "Focus", value: focusTopic.replace(/_/g, " ") }] : []),
        ]}
      />

      {mode === "speed" && speedRemaining != null && !submitted && (
        <p className="mb-3 text-center font-mono text-[13px] text-td-goldsoft">
          {speedRemaining}s · Streak {stats.speedCurrentStreak}
        </p>
      )}

      <BlackjackHandDisplay playerHand={situation.playerHand} dealerUpcard={situation.dealerUpcard} />

      {!submitted ? (
        <DrillPromptCard prompt="What do you do?">
          <div className="grid grid-cols-2 gap-2">
            {available.map((action) => (
              <SecondaryButton
                key={action}
                type="button"
                onClick={() => answer(action)}
                className="min-h-[56px] py-4 text-[14px] font-bold uppercase tracking-wide"
              >
                {ACTION_LABELS[action]}
              </SecondaryButton>
            ))}
          </div>
        </DrillPromptCard>
      ) : (
        grade &&
        userChoice && (
          <div className="mt-4">
            <BlackjackResult
              correct={grade.correct}
              userChoice={userChoice}
              recommended={grade.recommended}
              explanation={grade.explanation}
              ruleNote={grade.ruleNote}
              streak={stats.total.currentStreak}
              accuracy={accuracyPct(stats.total)}
              responseMs={mode === "speed" ? Date.now() - startMs.current : undefined}
              onNext={loadHand}
            />
          </div>
        )
      )}
    </DrillScreen>
  );
}
