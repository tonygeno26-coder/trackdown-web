"use client";

import { useRef, useState } from "react";
import { SidePotQuestion } from "@/lib/training/dealer-types";
import { pickSidePotQuestion, getSidePotQuestion } from "@/lib/training/side-pot-questions";
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
import {
  SidePotVisualBuilder,
  computeVisualCanSubmit,
  gradeVisualSidePotAnswer,
} from "./SidePotVisualBuilder";
import { SidePotGradeResult } from "@/lib/training/side-pot";
import { motion } from "framer-motion";
import { SidePotBreakdown } from "./SidePotBreakdown";

const VISUAL_PROTOTYPE_ID = "sp-01";

function isVisualPrototype(question: SidePotQuestion) {
  return question.id === VISUAL_PROTOTYPE_ID;
}

export default function SidePotTrainer({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState<SidePotQuestion>(
    () => getSidePotQuestion(VISUAL_PROTOTYPE_ID) ?? pickSidePotQuestion()
  );
  const [layerCount, setLayerCount] = useState("");
  const [totalPot, setTotalPot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const startMs = useRef(Date.now());

  const [boundaries, setBoundaries] = useState<number[]>([]);
  const [selectedBand, setSelectedBand] = useState<number | null>(null);
  const [eligibility, setEligibility] = useState<Record<number, string[]>>({});
  const [visualGrade, setVisualGrade] = useState<SidePotGradeResult | null>(null);

  const calc = calculateSidePots(question.players);
  const progress = loadTrainingProgress().dealer.sidePot;
  const useVisual = isVisualPrototype(question);

  const recordResult = (isCorrect: boolean) => {
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

  const submitClassic = () => {
    const countOk = parseInt(layerCount, 10) === calc.layers.length;
    const totalOk = Math.abs(parseFloat(totalPot) - calc.totalPot) <= 0.51;
    const isCorrect = countOk && totalOk;
    setCorrect(isCorrect);
    setSubmitted(true);
    recordResult(isCorrect);
  };

  const submitVisual = () => {
    const grade = gradeVisualSidePotAnswer(question, boundaries, eligibility);
    setVisualGrade(grade);
    setCorrect(grade.correct);
    setSubmitted(true);
    recordResult(grade.correct);
  };

  const resetVisualState = () => {
    setBoundaries([]);
    setSelectedBand(null);
    setEligibility({});
    setVisualGrade(null);
  };

  const next = () => {
    setQuestion(pickSidePotQuestion(question.id));
    setLayerCount("");
    setTotalPot("");
    setSubmitted(false);
    setCorrect(false);
    resetVisualState();
    startMs.current = Date.now();
  };

  const canSubmitVisual = computeVisualCanSubmit(question, boundaries, eligibility);

  return (
    <DrillScreen>
      <DrillHeader title="Side Pot Simulator" subtitle="Build and verify pot layers." onBack={onBack} />
      <DrillStatsStrip
        rows={[
          { label: "Accuracy", value: `${accuracyPct(progress)}%` },
          { label: "Streak", value: String(progress.currentStreak) },
        ]}
      />

      {useVisual ? (
        <>
          <SidePotVisualBuilder
            question={question}
            boundaries={boundaries}
            onBoundariesChange={setBoundaries}
            selectedBand={selectedBand}
            onSelectedBandChange={setSelectedBand}
            eligibility={eligibility}
            onEligibilityChange={setEligibility}
            submitted={submitted}
            grade={visualGrade}
          />
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-xl border px-4 py-4 ${
                correct
                  ? "border-td-goldsoft/40 bg-td-goldsoft/10"
                  : "border-td-red/40 bg-td-red/10"
              }`}
            >
              <p
                className={`font-display text-[14px] font-bold uppercase ${
                  correct ? "text-td-goldsoft" : "text-red-300"
                }`}
              >
                {correct ? "Correct" : "Review breakdown"}
              </p>
              {!correct && (
                <div className="mt-3">
                  <SidePotBreakdown question={question} />
                </div>
              )}
            </motion.div>
          )}
        </>
      ) : (
        <>
          <div className="mb-3 rounded-lg border border-td-border/50 bg-td-surface2/30 px-3 py-2 text-[12px] text-td-muted">
            Visual builder coming soon for this scenario — using classic input for now.
          </div>
          <SidePotQuestionView question={question} hideLayers />
          <div className="mt-4 grid gap-3">
            <TrainNumericInput
              label="Number of pot layers (main + side)"
              value={layerCount}
              onChange={setLayerCount}
              prefix=""
            />
            <TrainNumericInput
              label="Total pot amount"
              value={totalPot}
              onChange={setTotalPot}
              prefix="$"
            />
          </div>
          {submitted && (
            <div className="mt-4">
              <SidePotResult question={question} correct={correct} />
            </div>
          )}
        </>
      )}

      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton
            type="button"
            onClick={useVisual ? submitVisual : submitClassic}
            disabled={useVisual ? !canSubmitVisual : !layerCount || !totalPot}
          >
            Submit
          </PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={next}>
            Next Scenario
          </PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
