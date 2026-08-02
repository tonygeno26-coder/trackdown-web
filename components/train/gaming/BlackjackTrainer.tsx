"use client";

import { useEffect, useReducer, useRef, useState } from "react";
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
import { generateSituation, validateBlackjackScenario } from "@/lib/training/blackjack-hands";
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

type GradeResult = ReturnType<typeof gradeStrategy>;

type TrainerState =
  | { phase: "idle" }
  | { phase: "playing"; situation: BlackjackSituation; startMs: number }
  | {
      phase: "result";
      situation: BlackjackSituation;
      userChoice: BlackjackAction;
      grade: GradeResult;
      startMs: number;
    };

type TrainerAction =
  | { type: "NEW_HAND"; situation: BlackjackSituation }
  | { type: "SUBMIT"; userChoice: BlackjackAction; grade: GradeResult };

function trainerReducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case "NEW_HAND":
      validateBlackjackScenario(action.situation);
      return { phase: "playing", situation: action.situation, startMs: Date.now() };
    case "SUBMIT":
      if (state.phase !== "playing") return state;
      validateBlackjackScenario(state.situation);
      return {
        phase: "result",
        situation: state.situation,
        userChoice: action.userChoice,
        grade: action.grade,
        startMs: state.startMs,
      };
    default:
      return state;
  }
}

function pickNextSituation(
  mode: BlackjackTrainingMode,
  rules: BlackjackRules,
  focusTopic?: BlackjackTopic
): BlackjackSituation {
  const progress = loadTrainingProgress();
  const next = focusTopic
    ? pickAdaptiveBlackjackSituation(rules, focusTopic, progress.blackjack.mistakeQueue)
    : generateSituation(mode, rules, progress.blackjack.mistakeQueue);
  validateBlackjackScenario(next, rules);
  return next;
}

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
  const [trainer, dispatch] = useReducer(trainerReducer, { phase: "idle" });
  const [stats, setStats] = useState(() => loadTrainingProgress().blackjack);
  const [adaptiveStats, setAdaptiveStats] = useState(() =>
    computeTopicStats(focusTopic ?? "hard_totals", loadAdaptiveTraining().attempts)
  );
  const [speedRemaining, setSpeedRemaining] = useState<number | null>(
    mode === "speed" ? 10 : null
  );
  const modeRef = useRef(mode);
  const focusTopicRef = useRef(focusTopic);

  useEffect(() => {
    modeRef.current = mode;
    focusTopicRef.current = focusTopic;
    dispatch({ type: "NEW_HAND", situation: pickNextSituation(mode, rules, focusTopic) });
    if (mode === "speed") setSpeedRemaining(10);
  }, [mode, rules, focusTopic]);

  const isPlaying = trainer.phase === "playing";
  const isResult = trainer.phase === "result";

  useEffect(() => {
    if (mode !== "speed" || speedRemaining == null || !isPlaying) return;
    if (speedRemaining <= 0) return;
    const t = setTimeout(() => setSpeedRemaining((s) => (s != null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [mode, speedRemaining, isPlaying]);

  const loadHand = () => {
    dispatch({
      type: "NEW_HAND",
      situation: pickNextSituation(modeRef.current, rules, focusTopicRef.current),
    });
    if (modeRef.current === "speed") setSpeedRemaining(10);
  };

  const answer = (action: BlackjackAction) => {
    if (trainer.phase !== "playing") return;
    const { situation, startMs } = trainer;
    const responseMs = Date.now() - startMs;
    const result = gradeStrategy(situation, rules, action);
    const topic = mapBlackjackToTopic(result.category, result.recommended);

    dispatch({ type: "SUBMIT", userChoice: action, grade: result });

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

  if (trainer.phase === "idle") return null;

  const situation = trainer.situation;
  const available = getAvailableActions(situation);

  if (mode === "mistakes" && stats.mistakeQueue.length === 0 && isPlaying) {
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

      {mode === "speed" && speedRemaining != null && isPlaying && (
        <p className="mb-3 text-center font-mono text-[13px] text-td-goldsoft">
          {speedRemaining}s · Streak {stats.speedCurrentStreak}
        </p>
      )}

      <BlackjackHandDisplay
        key={situation.id}
        playerHand={situation.playerHand}
        dealerUpcard={situation.dealerUpcard}
      />

      {isPlaying ? (
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
      ) : isResult ? (
        <div className="mt-4">
          <BlackjackResult
            correct={trainer.grade.correct}
            userChoice={trainer.userChoice}
            recommended={trainer.grade.recommended}
            explanation={trainer.grade.explanation}
            ruleNote={trainer.grade.ruleNote}
            streak={stats.total.currentStreak}
            accuracy={accuracyPct(stats.total)}
            responseMs={mode === "speed" ? Date.now() - trainer.startMs : undefined}
            onNext={loadHand}
          />
        </div>
      ) : null}
    </DrillScreen>
  );
}
