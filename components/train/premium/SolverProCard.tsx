"use client";

import { Lock, Sparkles } from "lucide-react";
import PremiumBadge from "@/components/train/premium/PremiumBadge";
import { TrainCard } from "@/components/train/TrainingUi";

export default function SolverProCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <div className="relative overflow-hidden rounded-td-lg border border-td-gold/30 bg-gradient-to-br from-td-surface via-td-surface2 to-td-surface p-5 shadow-td-card">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-playing-radial opacity-40"
        />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-td-gold/30 bg-td-gold/10 text-td-gold">
            <Sparkles size={22} strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[16px] font-bold text-td-cream">Trackdown Solver Pro</span>
              <PremiumBadge />
            </span>
            <span className="mt-1 block text-[13px] leading-relaxed text-td-muted">
              Advanced poker analysis, ranges, frequencies and hand review.
            </span>
          </span>
          <Lock size={16} className="mt-1 shrink-0 text-td-muted" />
        </div>
      </div>
    </button>
  );
}
