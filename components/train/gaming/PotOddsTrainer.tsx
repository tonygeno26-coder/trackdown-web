"use client";

import { useRef, useState } from "react";
import { numericAnswerMatches } from "@/lib/training/calculations";
import { recordAdaptiveAttempt, loadAdaptiveTraining } from "@/lib/training/adaptive-storage";
import { computeTopicStats, difficultyForTopic } from "@/lib/training/adaptive-recommendations";
import { pickAdaptivePotOddsQuestion } from "@/lib/training/adaptive-session";
import { AdaptiveTopic, PokerTopic } from "@/lib/training/adaptive-types";
import {
  loadTrainingProgress,
  saveTrainingProgress,
  recordPotOddsResult,
} from "@/lib/training/progress";
import { PotOddsQuestion } from "@/lib/training/types";
import {
  PrimaryPlayingButton,
  TrainFeedback,
  TrainHeader,
  TrainNumericInput,
  TrainQuestionCard,
  TrainStatsRow,
  TrainStickyFooter,
} from "@/components/train/TrainingUi";

export default function PotOddsTrainer({
  onBack,
  focusTopic = "bet_sizing",
}: {
  onBack: () => void;
  focusTopic?: PokerTopic | AdaptiveTopic;
}) {
  const topic: PokerTopic = focusTopic === "bet_sizing" || !focusTopic ? "bet_sizing" : (focusTopic as PokerTopic);
  const [question, setQuestion] = useState<PotOddsQuestion>(() =>
    pickAdaptivePotOddsQuestion(topic)
  );
  const [equityAnswer, setEquityAnswer] = useState("");
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
    const userVal = parseFloat(equityAnswer);
    const isCorrect = numericAnswerMatches(userVal, question.correctEquityPct, 1);
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

    const progress = recordPotOddsResult(loadTrainingProgress(), isCorrect);
    saveTrainingProgress(progress);
    refreshAdaptiveStats();
  };

  const next = () => {
    setQuestion(pickAdaptivePotOddsQuestion(topic, question.id));
    setEquityAnswer("");
    setSubmitted(false);
    startMs.current = Date.now();
  };

  return (
    <div className="pb-28">
      <TrainHeader title="Pot Odds" subtitle="Adaptive bet sizing and required equity drills." onBack={onBack} />

      <div className="mb-4 space-y-2 rounded-xl border border-td-border/60 bg-td-surface2/40 p-4">
        <TrainStatsRow label="Topic accuracy" value={`${adaptiveStats.accuracy}%`} />
        <TrainStatsRow label="Confidence" value={String(adaptiveStats.confidence)} />
        <TrainStatsRow label="Streak" value={String(adaptiveStats.currentStreak)} />
        <TrainStatsRow label="Difficulty" value={difficultyForTopic(topic)} />
      </div>

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
