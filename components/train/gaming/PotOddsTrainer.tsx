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
    <DrillScreen>
      <DrillHeader title="Pot Odds" subtitle="Adaptive bet sizing and required equity drills." onBack={onBack} />

      <DrillStatsStrip
        rows={[
          { label: "Topic accuracy", value: `${adaptiveStats.accuracy}%` },
          { label: "Confidence", value: String(adaptiveStats.confidence) },
          { label: "Streak", value: String(adaptiveStats.currentStreak) },
          { label: "Difficulty", value: difficultyForTopic(topic) },
        ]}
      />

      <DrillPromptCard meta={question.difficulty} prompt={question.prompt}>
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
          <DrillAnswerInput
            value={equityAnswer}
            onChange={setEquityAnswer}
            label="Required equity (%)"
            prefix=""
          />
        ) : (
          <DrillResultCard correct={correct} title={correct ? "Correct" : "Incorrect"}>
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
          </DrillResultCard>
        )}
      </DrillPromptCard>

      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton type="button" onClick={submit} disabled={!equityAnswer.trim()}>
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
