"use client";

import { CheckCircle2, Circle } from "lucide-react";
import {
  DEALING_PROCEDURES,
  DEALING_PROCEDURE_GAME_META,
  DealingProcedureGame,
} from "@/lib/training/dealing-procedures";
import {
  migrateDealingProcedureProgress,
  toggleProcedureReviewed,
} from "@/lib/training/dealing-procedure-progress";
import { TrainHeader } from "@/components/train/TrainingUi";
import { SurfaceCard, ProgressBar } from "@/components/ui";
import { useMemo, useState } from "react";

function ChecklistRow({
  title,
  detail,
  reviewed,
  onToggle,
}: {
  title: string;
  detail: string;
  reviewed: boolean;
  onToggle: () => void;
}) {
  return (
    <SurfaceCard className="p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 shrink-0 text-td-muted hover:text-td-goldsoft"
          aria-label={reviewed ? "Mark not reviewed" : "Mark reviewed"}
        >
          {reviewed ? (
            <CheckCircle2 size={22} className="text-td-goldsoft" />
          ) : (
            <Circle size={22} />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[14px] font-semibold ${reviewed ? "text-td-muted line-through" : "text-td-cream"}`}
          >
            {title}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-td-muted">{detail}</p>
        </div>
      </div>
    </SurfaceCard>
  );
}

export default function DealingProcedureChecklist({
  game,
  onBack,
}: {
  game: DealingProcedureGame;
  onBack: () => void;
}) {
  const meta = DEALING_PROCEDURE_GAME_META[game];
  const items = DEALING_PROCEDURES[game];
  const [progress, setProgress] = useState(() => migrateDealingProcedureProgress());

  const reviewedSet = useMemo(() => new Set(progress.reviewedIds), [progress.reviewedIds]);
  const reviewedCount = items.filter((i) => reviewedSet.has(i.id)).length;
  const pct = items.length > 0 ? Math.round((reviewedCount / items.length) * 100) : 0;

  const toggle = (id: string) => {
    setProgress(toggleProcedureReviewed(id));
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title={`${meta.title} Procedures`}
        subtitle={`${reviewedCount} of ${items.length} reviewed`}
        onBack={onBack}
      />

      <SurfaceCard feature className="mb-4 p-4">
        <p className="text-[13px] text-td-muted">{meta.description}</p>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[12px]">
            <span className="text-td-muted">Progress</span>
            <span className="font-mono text-td-cream">{pct}%</span>
          </div>
          <ProgressBar value={pct} max={100} />
        </div>
      </SurfaceCard>

      <div className="space-y-3">
        {items.map((item) => (
          <ChecklistRow
            key={item.id}
            title={item.title}
            detail={item.detail}
            reviewed={reviewedSet.has(item.id)}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
