"use client";

import { useRef, useState } from "react";
import { numericAnswerMatches } from "@/lib/training/calculations";
import { recordAdaptiveAttempt, loadAdaptiveTraining } from "@/lib/training/adaptive-storage";
import { computeTopicStats, difficultyForTopic } from "@/lib/training/adaptive-recommendations";
import { pickAdaptivePloQuestion } from "@/lib/training/adaptive-session";
import { AdaptiveTopic } from "@/lib/training/adaptive-types";
import {
  loadTrainingProgress,
  saveTrainingProgress,
  recordPloCalcResult,
} from "@/lib/training/progress";
import { PloCalculationQuestion } from "@/lib/training/types";
import {
  PrimaryPlayingButton,
  TrainFeedback,
  TrainHeader,
  TrainNumericInput,
  TrainQuestionCard,
  TrainStatsRow,
  TrainStickyFooter,
} from "@/components/train/TrainingUi";

export default function PloPotTrainer({
  onBack,
  focusTopic = "plo_pot_calculations",
}: {
  onBack: () => void;
  focusTopic?: AdaptiveTopic;
}) {
  const topic = focusTopic === "plo_pot_calculations" ? focusTopic : "plo_pot_calculations";
  const [question, setQuestion] = useState<PloCalculationQuestion>(() =>
    pickAdaptivePloQuestion(topic)
  );
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [adaptiveStats, setAdaptiveStats] = useState(() =>
    computeTopicStats(topic, loadAdaptiveTraining().attempts)
  );
  const startMs = useRef(Date.now());

  const refreshAdaptiveStats = () => {
    setAdaptiveStats(computeTopicStats(topic, loadAdaptiveTraining().attempts));
  };

  const submit = () => {
    const userVal = parseFloat(answer);
    const isCorrect = numericAnswerMatches(userVal, question.correctAnswer);
    const responseMs = Date.now() - startMs.current;
    setCorrect(isCorrect);
    setSubmitted(true);

    recordAdaptiveAttempt({
      date: new Date().toISOString(),
      topic,
      difficulty: question.difficulty,
      correct: isCorrect,
      responseMs,
      questionId: question.id,
    });

    const progress = recordPloCalcResult(loadTrainingProgress(), isCorrect);
    saveTrainingProgress(progress);
    refreshAdaptiveStats();
  };

  const next = () => {
    setQuestion(pickAdaptivePloQuestion(topic, question.id));
    setAnswer("");
    setSubmitted(false);
    startMs.current = Date.now();
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title="PLO Pot Calculation"
        subtitle="Adaptive pot-limit Omaha call, pot-after-call, and max raise math."
        onBack={onBack}
      />

      <div className="mb-4 space-y-2 rounded-xl border border-td-border/60 bg-td-surface2/40 p-4">
        <TrainStatsRow label="Topic accuracy" value={`${adaptiveStats.accuracy}%`} />
        <TrainStatsRow label="Confidence" value={String(adaptiveStats.confidence)} />
        <TrainStatsRow label="Streak" value={String(adaptiveStats.currentStreak)} />
        <TrainStatsRow label="Difficulty" value={difficultyForTopic(topic)} />
      </div>

      <TrainQuestionCard className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">
          {question.difficulty} · {question.type.replace(/_/g, " ")}
        </p>
        <p className="text-[13px] text-td-muted">{question.actionHistory}</p>
        <p className="text-[16px] font-semibold leading-snug text-td-cream">{question.prompt}</p>
        <p className="text-[11px] italic text-td-muted">
          Sequence: call → add to pot → raise by resulting pot → total put in = call + raise.
        </p>

        {!submitted ? (
          <TrainNumericInput value={answer} onChange={setAnswer} label="Your answer" prefix="$" />
        ) : (
          <TrainFeedback correct={correct} title={correct ? "Correct" : "Incorrect"}>
            <p>
              Correct answer:{" "}
              <span className="font-mono font-bold text-td-goldsoft">${question.correctAnswer}</span>
            </p>
            <div className="mt-2 space-y-1 font-mono text-[12px] text-td-muted">
              {question.steps.map((step, i) => (
                <p key={i}>{step}</p>
              ))}
            </div>
          </TrainFeedback>
        )}
      </TrainQuestionCard>

      <TrainStickyFooter>
        {!submitted ? (
          <PrimaryPlayingButton type="button" onClick={submit} disabled={!answer.trim()}>
            Submit Answer
          </PrimaryPlayingButton>
        ) : (
          <PrimaryPlayingButton type="button" onClick={next}>
            Next Question
          </PrimaryPlayingButton>
        )}
      </TrainStickyFooter>
    </div>
  );
}
