"use client";

import { useState } from "react";
import { getRandomPotOddsQuestion } from "@/lib/training/pot-odds-questions";
import { numericAnswerMatches } from "@/lib/training/calculations";
import {
  loadTrainingProgress,
  saveTrainingProgress,
  recordPotOddsResult,
  accuracyPct,
} from "@/lib/training/progress";
import { PotOddsQuestion } from "@/lib/training/types";
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

export default function PotOddsTrainer({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState("beginner");
  const [question, setQuestion] = useState<PotOddsQuestion>(() => getRandomPotOddsQuestion("beginner"));
  const [equityAnswer, setEquityAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [stats, setStats] = useState(() => loadTrainingProgress().poker.potOdds);

  const submit = () => {
    const userVal = parseFloat(equityAnswer);
    const isCorrect = numericAnswerMatches(userVal, question.correctEquityPct, 1);
    setCorrect(isCorrect);
    setSubmitted(true);
    const progress = recordPotOddsResult(loadTrainingProgress(), isCorrect);
    saveTrainingProgress(progress);
    setStats(progress.poker.potOdds);
  };

  const next = () => {
    setQuestion(getRandomPotOddsQuestion(difficulty, question.id));
    setEquityAnswer("");
    setSubmitted(false);
  };

  const changeDifficulty = (d: string) => {
    setDifficulty(d);
    setQuestion(getRandomPotOddsQuestion(d));
    setEquityAnswer("");
    setSubmitted(false);
  };

  return (
    <div className="pb-28">
      <TrainHeader title="Pot Odds" subtitle="Calculate required equity for profitable calls." onBack={onBack} />

      <div className="mb-4 space-y-2 rounded-xl border border-td-border/60 bg-td-surface2/40 p-4">
        <TrainStatsRow label="Accuracy" value={`${accuracyPct(stats)}%`} />
        <TrainStatsRow label="Streak" value={String(stats.currentStreak)} />
        <TrainStatsRow label="Best streak" value={String(stats.bestStreak)} />
      </div>

      <DifficultyPicker value={difficulty} onChange={changeDifficulty} />

      <TrainQuestionCard className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">
          {question.difficulty}
        </p>
        <p className="text-[16px] font-semibold leading-snug text-td-cream">{question.prompt}</p>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <p className="text-td-muted">Pot before bet</p>
            <p className="font-mono font-bold text-td-cream">${question.potBefore}</p>
          </div>
          <div>
            <p className="text-td-muted">Bet to call</p>
            <p className="font-mono font-bold text-td-cream">${question.betToCall}</p>
          </div>
        </div>

        {!submitted ? (
          <TrainNumericInput
            value={equityAnswer}
            onChange={setEquityAnswer}
            label="Required equity (%)"
            prefix=""
          />
        ) : (
          <TrainFeedback correct={correct} title={correct ? "Correct" : "Incorrect"}>
            <p>
              Required equity:{" "}
              <span className="font-mono font-bold text-td-goldsoft">
                {question.correctEquityPct}%
              </span>
            </p>
            <p>
              Call: ${question.correctCallAmount} · Final pot: ${question.correctFinalPot}
            </p>
            <div className="mt-2 space-y-1 font-mono text-[12px] text-td-muted">
              {question.steps.map((step, i) => (
                <p key={i}>{step}</p>
              ))}
            </div>
            <p className="mt-2">{question.explanation}</p>
          </TrainFeedback>
        )}
      </TrainQuestionCard>

      <TrainStickyFooter>
        {!submitted ? (
          <PrimaryPlayingButton type="button" onClick={submit} disabled={!equityAnswer.trim()}>
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
