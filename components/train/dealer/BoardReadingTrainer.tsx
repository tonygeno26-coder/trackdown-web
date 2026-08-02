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
  const isPlo = scenario.gameType === "plo";

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
        subtitle={isPlo ? "PLO — use exactly 2 hole + 3 board" : "Hold'em best hand"}
        onBack={onBack}
      />
      <DrillStatsStrip rows={[{ label: "Accuracy", value: `${accuracyPct(progress)}%` }]} />
      <DrillPromptCard meta={`${scenario.difficulty} · ${scenario.gameType}`} prompt="Which player has the best hand?" />

      <div className="my-3 rounded-xl border border-td-border/60 bg-td-surface2/30 px-3 py-4">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase text-td-muted">Board</p>
        <CardRow cards={boardCards} size="medium" overlap />
      </div>

      <div className="space-y-2.5">
        {scenario.hands.map((h) => {
          const isWinner = submitted && scenario.winningHandIds.includes(h.id);
          const isSelected = selected === h.id;
          return (
            <button
              key={h.id}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(h.id)}
              className={`w-full rounded-xl border p-3 text-left transition sm:p-4 ${
                isSelected ? "border-td-gold bg-td-gold/10" : "border-td-border bg-td-surface2/50"
              } ${isWinner ? "ring-2 ring-td-goldsoft/50" : ""}`}
              aria-pressed={isSelected}
            >
              <div className="mb-2 flex items-center gap-2">
                <p className="text-[13px] font-semibold text-td-cream">{h.label}</p>
                {isWinner && (
                  <span className="rounded-full border border-td-goldsoft/60 bg-td-goldsoft/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-td-goldsoft">
                    Best hand
                  </span>
                )}
                {submitted && !isWinner && isSelected && (
                  <span className="rounded-full border border-td-border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-td-muted">
                    Not best
                  </span>
                )}
              </div>
              <CardRow cards={parseCardList(h.cards)} size="small" overlap />
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="mt-4">
          <DrillResultCard correct={correct} title={correct ? "Correct" : "Incorrect"}>
            <p>{scenario.explanation}</p>
            {isPlo && (
              <p className="mt-2 text-[12px] text-td-muted">
                PLO rule: exactly 2 hole cards + 3 board cards.
              </p>
            )}
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
