"use client";

import { useRef, useState } from "react";
import { HiLoScenario } from "@/lib/training/dealer-types";
import { pickHiLoScenario } from "@/lib/training/board-reading-scenarios";
import { recordAdaptiveAttempt } from "@/lib/training/adaptive-storage";
import { loadTrainingProgress, saveTrainingProgress, recordHiLoResult, accuracyPct } from "@/lib/training/progress";
import { parseCardList } from "@/lib/cards";
import CardRow from "@/components/cards/CardRow";
import {
  DrillScreen,
  DrillHeader,
  DrillPromptCard,
  DrillResultCard,
  DrillNavigation,
  DrillStatsStrip,
} from "@/components/train/shared";
import { PrimaryButton } from "@/components/ui";

type AnswerMode = "high" | "low" | "split";

export default function HiLoTrainer({ onBack }: { onBack: () => void }) {
  const [scenario, setScenario] = useState<HiLoScenario>(() => pickHiLoScenario());
  const [answer, setAnswer] = useState<AnswerMode | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const startMs = useRef(Date.now());
  const progress = loadTrainingProgress().dealer.hiLo;

  const expectedAnswer = (): AnswerMode => {
    const scoops =
      scenario.highWinnerIds.length === 1 &&
      scenario.lowWinnerIds.length === 1 &&
      scenario.highWinnerIds[0] === scenario.lowWinnerIds[0];
    if (scoops) return "high";
    if (scenario.lowWinnerIds.length === 0) return "high";
    if (scenario.highWinnerIds.length > 0 && scenario.lowWinnerIds.length > 0) return "split";
    return "high";
  };

  const correct = answer === expectedAnswer();

  const submit = () => {
    if (!answer) return;
    setSubmitted(true);
    const ms = Date.now() - startMs.current;
    recordAdaptiveAttempt({
      date: new Date().toISOString(),
      topic: "board_reading",
      difficulty: scenario.difficulty,
      correct,
      responseMs: ms,
      questionId: scenario.id,
    });
    saveTrainingProgress(recordHiLoResult(loadTrainingProgress(), scenario.id, correct, ms));
  };

  const next = () => {
    setScenario(pickHiLoScenario(scenario.id));
    setAnswer(null);
    setSubmitted(false);
    startMs.current = Date.now();
  };

  return (
    <DrillScreen>
      <DrillHeader title="Split Pot / Hi-Lo" subtitle="Quartering, odd chips, scoops. House rules may vary." onBack={onBack} />
      <DrillStatsStrip rows={[{ label: "Accuracy", value: `${accuracyPct(progress)}%` }]} />
      <DrillPromptCard meta={scenario.difficulty} prompt="How is this pot awarded?" />
      <div className="my-4">
        <p className="mb-2 text-[11px] font-semibold uppercase text-td-muted">Board</p>
        <CardRow cards={parseCardList(scenario.board)} size="medium" />
      </div>
      <div className="space-y-2">
        {(["high", "low", "split"] as AnswerMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            disabled={submitted}
            onClick={() => setAnswer(mode)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-[14px] font-semibold capitalize ${
              answer === mode ? "border-td-gold bg-td-gold/10 text-td-goldsoft" : "border-td-border text-td-cream"
            }`}
          >
            {mode === "high" && "High only (or scoop)"}
            {mode === "low" && "Low only"}
            {mode === "split" && "Split high and low"}
          </button>
        ))}
      </div>
      {submitted && (
        <div className="mt-4">
          <DrillResultCard correct={correct} title={correct ? "Correct" : "Review"}>
            <p>{scenario.explanation}</p>
            <p className="mt-2 font-mono text-td-goldsoft">{scenario.payoutDescription}</p>
            {scenario.caveat && <p className="mt-2 italic text-td-muted">{scenario.caveat}</p>}
          </DrillResultCard>
        </div>
      )}
      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton type="button" onClick={submit} disabled={!answer}>Submit</PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={next}>Next Scenario</PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
