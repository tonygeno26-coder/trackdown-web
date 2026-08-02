"use client";

import { useState } from "react";
import { Sparkles, Lock, RotateCcw } from "lucide-react";
import PremiumBadge from "@/components/train/premium/PremiumBadge";
import PricingPreviewModal from "@/components/train/premium/PricingPreviewModal";
import { isDeveloperSolverProPreview } from "@/lib/premium/entitlements";
import { SOLVER_PRO_FEATURES } from "@/lib/solver/demo-provider";
import { PrimaryPlayingButton, SecondaryPlayingButton, TrainHeader } from "@/components/train/TrainingUi";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function SolverProLockedScreen({
  onBack,
  unlocked,
}: {
  onBack: () => void;
  unlocked?: boolean;
}) {
  const [pricingOpen, setPricingOpen] = useState(false);
  const devPreview = isDeveloperSolverProPreview();

  return (
    <div className="pb-28">
      {devPreview && unlocked && (
        <div className="mb-4 rounded-xl border border-td-gold/40 bg-td-gold/10 px-4 py-3 text-[13px] text-td-cream">
          Developer Preview — Solver Pro entitlement override active. No payment record created.
        </div>
      )}

      <TrainHeader
        title="Solver Pro"
        subtitle={
          unlocked
            ? "Premium preview — solver backend not yet connected."
            : "Advanced poker analysis for serious study."
        }
        onBack={onBack}
      />

      <PlayingCard className="mb-4 space-y-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-td-gold/30 bg-td-gold/10 text-td-gold">
            <Sparkles size={26} strokeWidth={1.75} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-td-cream">Trackdown Solver Pro</h2>
              <PremiumBadge />
            </div>
            <p className="text-[12px] text-td-muted">Coming Soon — billing not yet connected</p>
          </div>
        </div>

        {!unlocked && (
          <div className="flex items-center gap-2 rounded-lg border border-td-border/80 bg-td-surface2/60 px-3 py-2.5 text-[13px] text-td-muted">
            <Lock size={16} />
            Unlock advanced solver tools with a Pro subscription.
          </div>
        )}

        <ul className="grid grid-cols-2 gap-2">
          {SOLVER_PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-[13px] text-td-cream">
              <span className="text-td-goldsoft">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <p className="text-[11px] leading-relaxed text-td-muted">
          Solver Pro will connect to real range and frequency analysis. The standard Poker Decision
          Trainer remains free and uses curated training scenarios — not a full mathematical solver.
        </p>
      </PlayingCard>

      {!unlocked ? (
        <div className="space-y-3">
          <PrimaryPlayingButton type="button" onClick={() => setPricingOpen(true)}>
            Upgrade
          </PrimaryPlayingButton>
          <SecondaryPlayingButton type="button" onClick={() => setPricingOpen(true)}>
            <RotateCcw size={16} /> Restore Purchase
          </SecondaryPlayingButton>
        </div>
      ) : (
        <PlayingCard className="p-5 text-center text-[14px] text-td-muted">
          Solver Pro UI preview — analysis engine coming in a future release.
        </PlayingCard>
      )}

      {pricingOpen && <PricingPreviewModal onClose={() => setPricingOpen(false)} />}
    </div>
  );
}
