"use client";

import { SidePotQuestion } from "@/lib/training/dealer-types";
import { calculateSidePots, layersMatchExpected } from "@/lib/training/side-pot";
import SidePotTable from "./SidePotTable";

export function SidePotQuestionView({ question }: { question: SidePotQuestion }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-[15px] font-bold text-td-cream">{question.title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-td-muted">{question.description}</p>
      </div>
      <SidePotTable players={question.players} />
    </div>
  );
}

export function SidePotBreakdown({ question }: { question: SidePotQuestion }) {
  const calc = calculateSidePots(question.players);
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-semibold uppercase text-td-muted">Step-by-step breakdown</p>
      <ol className="list-decimal space-y-1 pl-4 text-[13px] text-td-cream">
        {question.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <div className="mt-3 rounded-lg border border-td-border/60 bg-td-surface2/40 p-3">
        {calc.layers.map((l, i) => (
          <p key={i} className="font-mono text-[13px] text-td-goldsoft">
            {l.label}: ${l.amount} → [{l.eligibleIds.join(", ")}]
          </p>
        ))}
      </div>
      {question.caveat && <p className="text-[12px] italic text-td-muted">{question.caveat}</p>}
    </div>
  );
}

export function gradeSidePotAnswer(
  question: SidePotQuestion,
  userLayers: { amount: number; eligibleIds: string[] }[]
): boolean {
  const calc = calculateSidePots(question.players);
  return layersMatchExpected(calc.layers, userLayers.length ? userLayers : question.expectedLayers);
}

export function SidePotResult({
  question,
  correct,
}: {
  question: SidePotQuestion;
  correct: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        correct ? "border-td-goldsoft/40 bg-td-goldsoft/10" : "border-td-red/40 bg-td-red/10"
      }`}
    >
      <p className={`font-display text-[14px] font-bold uppercase ${correct ? "text-td-goldsoft" : "text-red-300"}`}>
        {correct ? "Correct" : "Review breakdown"}
      </p>
      <SidePotBreakdown question={question} />
    </div>
  );
}
