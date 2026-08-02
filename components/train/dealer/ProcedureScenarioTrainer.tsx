"use client";

import { useState } from "react";
import { ProcedureScenario } from "@/lib/training/dealer-types";
import { pickMisdealScenario } from "@/lib/training/dealer-procedure-scenarios";
import { recordAdaptiveAttempt } from "@/lib/training/adaptive-storage";
import { loadTrainingProgress, saveTrainingProgress, recordMisdealResult } from "@/lib/training/progress";
import {
  DrillScreen,
  DrillHeader,
  DrillPromptCard,
  DrillResultCard,
  DrillNavigation,
} from "@/components/train/shared";
import { ChoiceButton, PrimaryButton } from "@/components/ui";

export default function ProcedureScenarioTrainer({ onBack }: { onBack: () => void }) {
  const [scenario, setScenario] = useState<ProcedureScenario>(() => pickMisdealScenario());
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const startMs = useState(() => Date.now())[0];

  const correct = selected === scenario.correctOptionId;

  const submit = () => {
    if (!selected) return;
    setSubmitted(true);
    const ms = Date.now() - startMs;
    recordAdaptiveAttempt({
      date: new Date().toISOString(),
      topic: "procedures",
      difficulty: scenario.difficulty,
      correct: selected === scenario.correctOptionId,
      responseMs: ms,
      questionId: scenario.id,
    });
    saveTrainingProgress(
      recordMisdealResult(loadTrainingProgress(), scenario.id, selected === scenario.correctOptionId, ms)
    );
  };

  const next = () => {
    setScenario(pickMisdealScenario(scenario.id));
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <DrillScreen>
      <DrillHeader title="Misdeal & Exposed Cards" subtitle="Floor-call scenarios. House rules may vary." onBack={onBack} />
      <DrillPromptCard meta={scenario.title} prompt={scenario.situation} />
      <div className="mt-4 space-y-2">
        {scenario.options.map((opt) => (
          <ChoiceButton
            key={opt.id}
            selected={selected === opt.id}
            disabled={submitted}
            onClick={() => !submitted && setSelected(opt.id)}
            className={
              submitted && opt.id === scenario.correctOptionId
                ? "!border-td-goldsoft !bg-td-goldsoft/15"
                : submitted && selected === opt.id
                  ? "!border-td-red/50 !bg-td-red/10"
                  : ""
            }
          >
            {opt.text}
          </ChoiceButton>
        ))}
      </div>
      {submitted && (
        <div className="mt-4">
          <DrillResultCard correct={correct} title={correct ? "Correct" : "Review"}>
            <p>{scenario.explanation}</p>
            {scenario.caveat && <p className="mt-2 italic text-td-muted">{scenario.caveat}</p>}
          </DrillResultCard>
        </div>
      )}
      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton type="button" onClick={submit} disabled={!selected}>Submit</PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={next}>Next Scenario</PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
