"use client";

import { useRef, useState } from "react";
import { BoardReadingScenario } from "@/lib/training/dealer-types";
import { pickBoardReadingScenario } from "@/lib/training/board-reading-scenarios";
import { recordAdaptiveAttempt } from "@/lib/training/adaptive-storage";
import { loadTrainingProgress, saveTrainingProgress, recordBoardReadingResult, accuracyPct } from "@/lib/training/progress";
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

export default function BoardReadingTrainer({ onBack }: { onBack: () => void }) {
  const [scenario, setScenario] = useState<BoardReadingScenario>(() => pickBoardReadingScenario());
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const startMs = useRef(Date.now());
  const progress = loadTrainingProgress().dealer.boardReading;

  const correct = selected !== null && scenario.winningHandIds.includes(selected);

  const submit = () => {
    if (!selected) return;
    setSubmitted(true);
    const ms = Date.now() - startMs.current;
    recordAdaptiveAttempt({
      date: new Date().toISOString(),
      topic: "board_reading",
      difficulty: scenario.difficulty,
      correct: scenario.winningHandIds.includes(selected),
      responseMs: ms,
      questionId: scenario.id,
    });
    saveTrainingProgress(
      recordBoardReadingResult(loadTrainingProgress(), scenario.id, scenario.winningHandIds.includes(selected), ms)
    );
  };

  const next = () => {
    setScenario(pickBoardReadingScenario(scenario.id));
    setSelected(null);
    setSubmitted(false);
    startMs.current = Date.now();
  };

  const boardCards = parseCardList(scenario.board);

  return (
    <DrillScreen>
      <DrillHeader
        title="Board Reading"
        subtitle={scenario.gameType === "plo" ? "PLO — use exactly 2 hole + 3 board" : "Hold'em best hand"}
        onBack={onBack}
      />
      <DrillStatsStrip rows={[{ label: "Accuracy", value: `${accuracyPct(progress)}%` }]} />
      <DrillPromptCard meta={`${scenario.difficulty} · ${scenario.gameType}`} prompt="Which player has the best hand?" />
      <div className="my-4">
        <p className="mb-2 text-[11px] font-semibold uppercase text-td-muted">Board</p>
        <CardRow cards={boardCards} size="medium" />
      </div>
      <div className="space-y-3">
        {scenario.hands.map((h) => (
          <button
            key={h.id}
            type="button"
            disabled={submitted}
            onClick={() => setSelected(h.id)}
            className={`w-full rounded-xl border p-4 text-left transition ${
              selected === h.id ? "border-td-gold bg-td-gold/10" : "border-td-border bg-td-surface2/50"
            }`}
          >
            <p className="mb-2 text-[13px] font-semibold text-td-cream">{h.label}</p>
            <CardRow cards={parseCardList(h.cards)} size="small" />
          </button>
        ))}
      </div>
      {submitted && (
        <div className="mt-4">
          <DrillResultCard correct={correct} title={correct ? "Correct" : "Incorrect"}>
            <p>{scenario.explanation}</p>
            {scenario.caveat && <p className="mt-2 italic text-td-muted">{scenario.caveat}</p>}
          </DrillResultCard>
        </div>
      )}
      <DrillNavigation>
        {!submitted ? (
          <PrimaryButton type="button" onClick={submit} disabled={!selected}>Submit</PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={next}>Next Board</PrimaryButton>
        )}
      </DrillNavigation>
    </DrillScreen>
  );
}
