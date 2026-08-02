"use client";

import { PokerAction, PokerScenario } from "@/lib/training/types";
import { TrainFeedback } from "@/components/train/TrainingUi";

const ACTION_LABELS: Record<PokerAction, string> = {
  fold: "Fold",
  call: "Call",
  check: "Check",
  bet: "Bet",
  raise: "Raise",
};

export default function PokerScenarioResult({
  scenario,
  chosen,
  preferred,
  acceptable,
}: {
  scenario: PokerScenario;
  chosen: PokerAction;
  preferred: boolean;
  acceptable: boolean;
}) {
  return (
    <TrainFeedback
      correct={preferred}
      title={
        preferred
          ? "Preferred action"
          : acceptable
            ? "Acceptable action"
            : "Suboptimal action"
      }
    >
      <p>
        You chose <span className="font-bold">{ACTION_LABELS[chosen]}</span>. Preferred:{" "}
        <span className="font-bold text-td-goldsoft">{ACTION_LABELS[scenario.preferredAction]}</span>.
      </p>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">
          Solver-style frequencies
        </p>
        <div className="mt-2 space-y-1.5">
          {scenario.recommended.map(({ action, frequency }) => (
            <div key={action} className="flex items-center gap-2">
              <span className="w-14 text-[12px] font-semibold">{ACTION_LABELS[action]}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-td-surface2">
                <div
                  className={`h-full rounded-full ${
                    action === scenario.preferredAction ? "bg-td-goldsoft" : "bg-td-muted/50"
                  }`}
                  style={{ width: `${frequency}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-[11px]">{frequency}%</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 leading-relaxed">{scenario.explanation}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {scenario.concepts.map((c) => (
          <span
            key={c}
            className="rounded-full border border-td-border px-2 py-0.5 text-[10px] text-td-muted"
          >
            {c}
          </span>
        ))}
      </div>
    </TrainFeedback>
  );
}
