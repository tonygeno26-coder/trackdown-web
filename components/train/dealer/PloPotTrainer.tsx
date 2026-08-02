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
import { PrimaryButton } from "@/components/ui";
import {
  DrillScreen,
  DrillHeader,
  DrillPromptCard,
  DrillAnswerInput,
  DrillResultCard,
  DrillStatsStrip,
  DrillNavigation,
} from "@/components/train/shared";

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
    <DrillScreen>
      <DrillHeader
        title="PLO Pot Calculation"
        subtitle="Adaptive pot-limit Omaha call, pot-after-call, and max raise math."
        onBack={onBack}
      />

      <DrillStatsStrip
        rows={[
          { label: "Topic accuracy", value: `${adaptiveStats.accuracy}%` },
          { label: "Confidence", value: String(adaptiveStats.confidence) },
          { label: "Streak", value: String(adaptiveStats.currentStreak) },
          { label: "Difficulty", value: difficultyForTopic(topic) },
        ]}
      />

      <DrillPromptCard
        meta={`${question.difficulty} · ${question.type.replace(/_/g, " ")}`}
        context={question.actionHistory}
        prompt={question.prompt}
        hint="Sequence: call → add to pot → raise by resulting pot → total put in = call + raise."
      >
        {!submitted ? (
          <DrillAnswerInput value={answer} onChange={setAnswer} label="Your answer" />
        ) : (
          <DrillResultCard correct={correct} title={correct ? "Correct" : "Incorrect"}>
            <p>
              Correct answer:{" "}
              <span className="font-mono font-bold text-td-goldsoft">${question.correctAnswer}</span>
            </p>
            <div className="mt-2 space-y-1 font-mono text-[12px] text-td-muted">
              {question.steps.map((step, i) => (
                <p key={i}>{step}</p>
              ))}
            </div>
          </DrillResultCard>
        )}
      </DrillPromptCard>

      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton type="button" onClick={submit} disabled={!answer.trim()}>
            Submit Answer
          </PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={next}>
            Next Question
          </PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
