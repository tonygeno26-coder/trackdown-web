"use client";

import { useState } from "react";
import { Sparkles, Lock, RotateCcw } from "lucide-react";
import PremiumBadge from "@/components/train/premium/PremiumBadge";
import PricingPreviewModal from "@/components/train/premium/PricingPreviewModal";
import { SolverSummaryCard } from "@/components/train/premium/SolverSummaryCard";
import { isDeveloperSolverProPreview } from "@/lib/premium/entitlements";
import { SOLVER_PRO_FEATURES } from "@/lib/solver/demo-provider";
import { PrimaryButton, SecondaryButton, SurfaceCard, InlineFeedback } from "@/components/ui";
import { DrillScreen, DrillHeader } from "@/components/train/shared";

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
    <DrillScreen>
      {devPreview && unlocked && (
        <InlineFeedback variant="success">
          Developer Preview — Solver Pro entitlement override active. No payment record created.
        </InlineFeedback>
      )}

      <DrillHeader
        title="Solver Pro"
        subtitle={
          unlocked
            ? "Premium preview — solver backend not yet connected."
            : "Advanced poker analysis for serious study."
        }
        onBack={onBack}
      />

      <SolverSummaryCard
        title="Trackdown Solver Pro"
        badge={<PremiumBadge />}
      >
        {!unlocked && (
          <div className="flex items-center gap-2 rounded-lg border border-td-border/80 bg-td-surface2/60 px-3 py-2.5 text-[13px] text-td-muted">
            <Lock size={16} aria-hidden />
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
      </SolverSummaryCard>

      {!unlocked ? (
        <div className="space-y-3">
          <PrimaryButton type="button" onClick={() => setPricingOpen(true)}>
            Upgrade
          </PrimaryButton>
          <SecondaryButton type="button" onClick={() => setPricingOpen(true)}>
            <RotateCcw size={16} /> Restore Purchase
          </SecondaryButton>
        </div>
      ) : (
        <SurfaceCard className="p-5 text-center text-[14px] text-td-muted">
          Solver Pro UI preview — analysis engine coming in a future release.
        </SurfaceCard>
      )}

      {pricingOpen && <PricingPreviewModal onClose={() => setPricingOpen(false)} />}
    </DrillScreen>
  );
}
