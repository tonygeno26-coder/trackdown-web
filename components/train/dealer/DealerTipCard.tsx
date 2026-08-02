"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { DealerTip } from "@/lib/training/types";
import { DEALER_TIP_CATEGORY_LABELS } from "@/lib/training/types";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function DealerTipCard({
  tip,
  completed,
  onToggleComplete,
}: {
  tip: DealerTip;
  completed: boolean;
  onToggleComplete: () => void;
}) {
  return (
    <PlayingCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-td-gold">
            {DEALER_TIP_CATEGORY_LABELS[tip.category]}
          </p>
          <h3 className="mt-1 text-[15px] font-bold text-td-cream">{tip.title}</h3>
        </div>
        <button
          type="button"
          onClick={onToggleComplete}
          className="shrink-0 p-1 text-td-muted hover:text-td-goldsoft"
          aria-label={completed ? "Mark incomplete" : "Mark completed"}
        >
          {completed ? (
            <CheckCircle2 size={22} className="text-td-goldsoft" />
          ) : (
            <Circle size={22} />
          )}
        </button>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-td-muted">{tip.explanation}</p>
      <div className="mt-3 rounded-lg border border-td-gold/20 bg-td-gold/5 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-goldsoft">Practical tip</p>
        <p className="mt-1 text-[13px] leading-relaxed text-td-cream">{tip.practicalTip}</p>
      </div>
      {tip.commonMistake && (
        <p className="mt-2 text-[12px] text-td-muted">
          <span className="font-semibold text-red-300">Common mistake: </span>
          {tip.commonMistake}
        </p>
      )}
    </PlayingCard>
  );
}
