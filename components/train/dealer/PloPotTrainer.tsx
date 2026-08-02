"use client";

import { useState } from "react";
import { getRandomPloQuestion } from "@/lib/training/plo-questions";
import { numericAnswerMatches } from "@/lib/training/calculations";
import {
  loadTrainingProgress,
  saveTrainingProgress,
  recordPloCalcResult,
  accuracyPct,
} from "@/lib/training/progress";
import { PloCalculationQuestion } from "@/lib/training/types";
import {
  DifficultyPicker,
  PrimaryPlayingButton,
  TrainFeedback,
  TrainHeader,
  TrainNumericInput,
  TrainQuestionCard,
  TrainStatsRow,
  TrainStickyFooter,
} from "@/components/train/TrainingUi";

export default function PloPotTrainer({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState("beginner");
  const [question, setQuestion] = useState<PloCalculationQuestion>(() =>
    getRandomPloQuestion("beginner")
  );
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [stats, setStats] = useState(() => loadTrainingProgress().dealer.ploCalc);

  const submit = () => {
    const userVal = parseFloat(answer);
    const isCorrect = numericAnswerMatches(userVal, question.correctAnswer);
    setCorrect(isCorrect);
    setSubmitted(true);
    const progress = recordPloCalcResult(loadTrainingProgress(), isCorrect);
    saveTrainingProgress(progress);
    setStats(progress.dealer.ploCalc);
  };

  const next = () => {
    setQuestion(getRandomPloQuestion(difficulty, question.id));
    setAnswer("");
    setSubmitted(false);
  };

  const changeDifficulty = (d: string) => {
    setDifficulty(d);
    setQuestion(getRandomPloQuestion(d));
    setAnswer("");
    setSubmitted(false);
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title="PLO Pot Calculation"
        subtitle="Pot-limit Omaha call, pot-after-call, and max raise math."
        onBack={onBack}
      />

      <div className="mb-4 space-y-2 rounded-xl border border-td-border/60 bg-td-surface2/40 p-4">
        <TrainStatsRow label="Accuracy" value={`${accuracyPct(stats)}%`} />
        <TrainStatsRow label="Streak" value={String(stats.currentStreak)} />
        <TrainStatsRow label="Best streak" value={String(stats.bestStreak)} />
      </div>

      <DifficultyPicker value={difficulty} onChange={changeDifficulty} />

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
