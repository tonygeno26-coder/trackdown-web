"use client";

import { useMemo, useState } from "react";
import { Search, Bookmark, Sparkles } from "lucide-react";
import { DEALER_TIPS } from "@/lib/training/dealer-tips";
import { DEALER_TIP_CATEGORY_LABELS, DealerTipCategory } from "@/lib/training/types";
import {
  loadTrainingProgress,
  saveTrainingProgress,
  toggleTipCompleted,
  toggleTipSaved,
  markTipViewed,
  setDailyTip,
} from "@/lib/training/progress";
import DealerTipCard from "@/components/train/dealer/DealerTipCard";
import { TrainHeader } from "@/components/train/TrainingUi";
import { SurfaceCard, SegmentedControl } from "@/components/ui";

const ALL_CATEGORIES: { key: DealerTipCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...Object.entries(DEALER_TIP_CATEGORY_LABELS).map(([key, label]) => ({
    key: key as DealerTipCategory,
    label,
  })),
];

type FilterMode = "all" | "saved" | "completed" | "incomplete";

export default function DealingTips({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DealerTipCategory | "all">("all");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [progress, setProgress] = useState(() => loadTrainingProgress().dealer.tips);

  const dailyTip = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (progress.dailyTipDate === today && progress.dailyTipId) {
      return DEALER_TIPS.find((t) => t.id === progress.dailyTipId);
    }
    const tip = DEALER_TIPS[Math.floor(Math.random() * DEALER_TIPS.length)];
    const next = setDailyTip(loadTrainingProgress(), tip.id);
    saveTrainingProgress(next);
    setProgress(next.dealer.tips);
    return tip;
  }, [progress.dailyTipDate, progress.dailyTipId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEALER_TIPS.filter((tip) => {
      if (category !== "all" && tip.category !== category) return false;
      if (filterMode === "saved" && !progress.savedIds.includes(tip.id)) return false;
      if (filterMode === "completed" && !progress.completedIds.includes(tip.id)) return false;
      if (filterMode === "incomplete" && progress.completedIds.includes(tip.id)) return false;
      if (!q) return true;
      return (
        tip.title.toLowerCase().includes(q) ||
        tip.explanation.toLowerCase().includes(q) ||
        tip.practicalTip.toLowerCase().includes(q)
      );
    });
  }, [search, category, filterMode, progress]);

  const refresh = () => setProgress(loadTrainingProgress().dealer.tips);

  const toggleComplete = (id: string) => {
    saveTrainingProgress(toggleTipCompleted(loadTrainingProgress(), id));
    refresh();
  };

  const toggleSaved = (id: string) => {
    saveTrainingProgress(toggleTipSaved(loadTrainingProgress(), id));
    refresh();
  };

  const onView = (id: string) => {
    saveTrainingProgress(markTipViewed(loadTrainingProgress(), id));
    refresh();
  };

  return (
    <div className="pb-28">
      <TrainHeader
        title="Dealing Tips"
        subtitle={`${progress.completedIds.length} of ${DEALER_TIPS.length} completed`}
        onBack={onBack}
      />

      {dailyTip && (
        <SurfaceCard feature className="mb-4 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase text-td-gold">
            <Sparkles size={12} /> Tip of the day
          </p>
          <p className="text-[15px] font-bold text-td-cream">{dailyTip.title}</p>
          <p className="mt-1 text-[13px] text-td-muted">{dailyTip.practicalTip}</p>
        </SurfaceCard>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-td-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search lessons…"
          className="w-full rounded-xl border border-td-border bg-td-bg/80 py-3 pl-10 pr-4 text-[14px] text-td-cream focus:outline focus:outline-2 focus:outline-td-gold/60"
        />
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {(["all", "saved", "completed", "incomplete"] as FilterMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setFilterMode(m)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize ${
              filterMode === m ? "border-td-gold bg-td-gold/10 text-td-goldsoft" : "border-td-border text-td-muted"
            }`}
          >
            {m}
          </button>
        ))}
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
            <div key={tip.id} onMouseEnter={() => onView(tip.id)}>
              <DealerTipCard
                tip={tip}
                completed={progress.completedIds.includes(tip.id)}
                onToggleComplete={() => toggleComplete(tip.id)}
              />
              <button
                type="button"
                onClick={() => toggleSaved(tip.id)}
                className={`mt-1 flex items-center gap-1 text-[11px] ${
                  progress.savedIds.includes(tip.id) ? "text-td-gold" : "text-td-muted"
                }`}
              >
                <Bookmark size={12} fill={progress.savedIds.includes(tip.id) ? "currentColor" : "none"} />
                {progress.savedIds.includes(tip.id) ? "Saved" : "Save"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
