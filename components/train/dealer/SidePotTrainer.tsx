"use client";

import { useRef, useState } from "react";
import { SidePotQuestion } from "@/lib/training/dealer-types";
import { pickSidePotQuestion } from "@/lib/training/side-pot-questions";
import { calculateSidePots } from "@/lib/training/side-pot";
import { recordAdaptiveAttempt } from "@/lib/training/adaptive-storage";
import { loadTrainingProgress, saveTrainingProgress, recordSidePotResult, accuracyPct } from "@/lib/training/progress";
import {
  DrillScreen,
  DrillHeader,
  DrillNavigation,
  DrillStatsStrip,
} from "@/components/train/shared";
import { TrainNumericInput } from "@/components/train/TrainingUi";
import { PrimaryButton } from "@/components/ui";
import { SidePotQuestionView, SidePotResult } from "./SidePotBreakdown";

export default function SidePotTrainer({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState<SidePotQuestion>(() => pickSidePotQuestion());
  const [layerCount, setLayerCount] = useState("");
  const [totalPot, setTotalPot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const startMs = useRef(Date.now());

  const calc = calculateSidePots(question.players);
  const progress = loadTrainingProgress().dealer.sidePot;

  const submit = () => {
    const countOk = parseInt(layerCount, 10) === calc.layers.length;
    const totalOk = Math.abs(parseFloat(totalPot) - calc.totalPot) <= 0.51;
    const isCorrect = countOk && totalOk;
    setCorrect(isCorrect);
    setSubmitted(true);
    const ms = Date.now() - startMs.current;
    recordAdaptiveAttempt({
      date: new Date().toISOString(),
      topic: "side_pots",
      difficulty: question.difficulty,
      correct: isCorrect,
      responseMs: ms,
      questionId: question.id,
    });
    saveTrainingProgress(recordSidePotResult(loadTrainingProgress(), question.id, isCorrect, ms));
  };

  const next = () => {
    setQuestion(pickSidePotQuestion(question.id));
    setLayerCount("");
    setTotalPot("");
    setSubmitted(false);
    startMs.current = Date.now();
  };

  return (
    <DrillScreen>
      <DrillHeader title="Side Pot Simulator" subtitle="Build and verify pot layers." onBack={onBack} />
      <DrillStatsStrip
        rows={[
          { label: "Accuracy", value: `${accuracyPct(progress)}%` },
          { label: "Streak", value: String(progress.currentStreak) },
        ]}
      />
      <SidePotQuestionView question={question} />
      <div className="mt-4 grid gap-3">
        <TrainNumericInput label="Number of pot layers (main + side)" value={layerCount} onChange={setLayerCount} prefix="" />
        <TrainNumericInput label="Total pot amount" value={totalPot} onChange={setTotalPot} prefix="$" />
      </div>
      {submitted && (
        <div className="mt-4">
          <SidePotResult question={question} correct={correct} />
        </div>
      )}
      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton type="button" onClick={submit} disabled={!layerCount || !totalPot}>Submit</PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={next}>Next Scenario</PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
