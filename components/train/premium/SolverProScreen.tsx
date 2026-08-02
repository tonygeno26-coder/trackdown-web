"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { demoSolverProvider, SOLVER_PRO_FEATURES } from "@/lib/solver/demo-provider";
import { SolverScenario } from "@/lib/solver/types";
import { parseCardList } from "@/lib/cards";
import PremiumBadge from "@/components/train/premium/PremiumBadge";
import SolverSummaryCard from "@/components/train/premium/SolverSummaryCard";
import RangePreview from "@/components/train/premium/RangePreview";
import FrequencyBreakdown from "@/components/train/premium/FrequencyBreakdown";
import BetSizeComparison from "@/components/train/premium/BetSizeComparison";
import ExplanationPanel from "@/components/train/premium/ExplanationPanel";
import { PrimaryButton, StatCard } from "@/components/ui";
import { DrillScreen, DrillHeader } from "@/components/train/shared";

export default function SolverProScreen({ onBack }: { onBack: () => void }) {
  const scenarios = demoSolverProvider.listScenarios();
  const [selected, setSelected] = useState<SolverScenario | null>(scenarios[0] ?? null);

  return (
    <DrillScreen>
      <div className="mb-4 rounded-xl border border-td-gold/40 bg-td-gold/10 px-4 py-3 text-[13px] text-td-cream">
        Developer Preview — demo analysis only. No solver calculations.
      </div>

      <DrillHeader
        title="Solver Pro"
        subtitle="Premium analysis preview with mock solver output."
        onBack={onBack}
      />

      <SolverSummaryCard title="Trackdown Solver Pro" badge={<PremiumBadge />}>
        <ul className="grid grid-cols-2 gap-1.5">
          {SOLVER_PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-[12px] text-td-cream">
              <span className="text-td-goldsoft">✓</span> {f}
            </li>
          ))}
        </ul>
      </SolverSummaryCard>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-td-muted">Demo Scenarios</p>
      <div className="mb-4 space-y-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${
              selected?.id === s.id
                ? "border-td-gold bg-td-gold/10 text-td-cream"
                : "border-td-border bg-td-surface2 text-td-muted hover:border-td-gold/30"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {selected && <SolverAnalysisPanel scenario={selected} />}
    </DrillScreen>
  );
}

function SolverAnalysisPanel({ scenario }: { scenario: SolverScenario }) {
  const heroCards = parseCardList(scenario.heroCards);
  const boardCards = parseCardList(scenario.board);

  return (
    <div className="space-y-4">
      <RangePreview
        heroCards={heroCards}
        boardCards={boardCards}
        actionHistory={scenario.actionHistory}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Pot" value={`$${scenario.potSize}`} />
        <StatCard label="Stack" value={scenario.effectiveStack} />
        <StatCard label="Preferred" value={scenario.preferredAction.toUpperCase()} />
      </div>

      <ExplanationPanel
        explanation={scenario.explanation}
        gto={scenario.gtoVsExploit?.gto}
        exploit={scenario.gtoVsExploit?.exploit}
      />

      <FrequencyBreakdown entries={scenario.rangeBreakdown} />

      {scenario.evComparison && <BetSizeComparison entries={scenario.evComparison} />}

      <PrimaryButton type="button" disabled className="opacity-60">
        Save Report (Coming Soon)
      </PrimaryButton>
    </div>
  );
}
