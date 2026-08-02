"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DEALER_TIPS } from "@/lib/training/dealer-tips";
import { DEALER_TIP_CATEGORY_LABELS, DealerTipCategory } from "@/lib/training/types";
import { loadTrainingProgress, saveTrainingProgress, toggleTipCompleted } from "@/lib/training/progress";
import DealerTipCard from "@/components/train/dealer/DealerTipCard";
import { TrainHeader } from "@/components/train/TrainingUi";

const ALL_CATEGORIES: { key: DealerTipCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...Object.entries(DEALER_TIP_CATEGORY_LABELS).map(([key, label]) => ({
    key: key as DealerTipCategory,
    label,
  })),
];

export default function DealingTips({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DealerTipCategory | "all">("all");
  const [completedIds, setCompletedIds] = useState<string[]>(() =>
    loadTrainingProgress().dealer.completedTipIds
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEALER_TIPS.filter((tip) => {
      if (category !== "all" && tip.category !== category) return false;
      if (!q) return true;
      return (
        tip.title.toLowerCase().includes(q) ||
        tip.explanation.toLowerCase().includes(q) ||
        tip.practicalTip.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  const toggleComplete = (id: string) => {
    const next = toggleTipCompleted(loadTrainingProgress(), id);
    saveTrainingProgress(next);
    setCompletedIds(next.dealer.completedTipIds);
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title="Dealing Tips"
        subtitle={`${completedIds.length} of ${DEALER_TIPS.length} completed`}
        onBack={onBack}
      />

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-td-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search lessons…"
          className="w-full rounded-xl border border-td-border bg-td-bg/80 py-3 pl-10 pr-4 text-[14px] text-td-cream focus:outline focus:outline-2 focus:outline-td-gold/60"
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {ALL_CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
              category === key
                ? "border-td-gold bg-td-gold/10 text-td-goldsoft"
                : "border-td-border bg-td-surface2 text-td-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-td-muted">No lessons match your search.</p>
        ) : (
          filtered.map((tip) => (
            <DealerTipCard
              key={tip.id}
              tip={tip}
              completed={completedIds.includes(tip.id)}
              onToggleComplete={() => toggleComplete(tip.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
