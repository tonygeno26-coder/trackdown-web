"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { demoSolverProvider, SOLVER_PRO_FEATURES } from "@/lib/solver/demo-provider";
import { SolverScenario } from "@/lib/solver/types";
import { parseCardList } from "@/lib/cards";
import CardRow from "@/components/cards/CardRow";
import PremiumBadge from "@/components/train/premium/PremiumBadge";
import {
  TrainHeader,
  TrainQuestionCard,
  TrainStatsRow,
  PrimaryPlayingButton,
} from "@/components/train/TrainingUi";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function SolverProScreen({ onBack }: { onBack: () => void }) {
  const scenarios = demoSolverProvider.listScenarios();
  const [selected, setSelected] = useState<SolverScenario | null>(scenarios[0] ?? null);

  return (
    <div className="pb-28">
      <div className="mb-4 rounded-xl border border-td-gold/40 bg-td-gold/10 px-4 py-3 text-[13px] text-td-cream">
        Developer Preview — demo analysis only. No solver calculations.
      </div>

      <TrainHeader
        title="Solver Pro"
        subtitle="Premium analysis preview with mock solver output."
        onBack={onBack}
      />

      <PlayingCard className="mb-4 p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-td-gold" />
          <span className="font-display font-bold text-td-cream">Trackdown Solver Pro</span>
          <PremiumBadge />
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-1.5">
          {SOLVER_PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-[12px] text-td-cream">
              <span className="text-td-goldsoft">✓</span> {f}
            </li>
          ))}
        </ul>
      </PlayingCard>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-td-muted">Demo Scenarios</p>
      <div className="mb-4 space-y-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-[13px] ${
              selected?.id === s.id
                ? "border-td-gold bg-td-gold/10 text-td-cream"
                : "border-td-border bg-td-surface2 text-td-muted"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {selected && <SolverAnalysisPanel scenario={selected} />}
    </div>
  );
}

function SolverAnalysisPanel({ scenario }: { scenario: SolverScenario }) {
  const heroCards = parseCardList(scenario.heroCards);
  const boardCards = parseCardList(scenario.board);

  return (
    <TrainQuestionCard>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-td-goldsoft">
        {scenario.gameType} · {scenario.stakes}
      </p>
      <CardRow cards={heroCards} size="medium" highlighted />
      {boardCards.length > 0 && <CardRow cards={boardCards} size="medium" />}
      <p className="text-[13px] text-td-muted">{scenario.actionHistory}</p>

      <div className="space-y-1 border-t border-td-border/60 pt-3">
        <TrainStatsRow label="Pot" value={`$${scenario.potSize}`} />
        <TrainStatsRow label="Stack" value={scenario.effectiveStack} />
        <TrainStatsRow label="Preferred" value={scenario.preferredAction.toUpperCase()} />
      </div>

      <p className="text-[13px] leading-relaxed text-td-cream">{scenario.explanation}</p>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">Range Breakdown</p>
      {scenario.rangeBreakdown.map((r) => (
        <div key={r.label} className="rounded-lg border border-td-border/60 bg-td-surface2/50 px-3 py-2">
          <div className="flex justify-between text-[13px]">
            <span className="font-semibold text-td-cream">{r.label}</span>
            <span className="font-mono text-td-muted">{r.percentage}%</span>
          </div>
          <p className="text-[11px] text-td-muted">{r.examples.join(", ")}</p>
        </div>
      ))}

      {scenario.evComparison && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">EV Comparison</p>
          {scenario.evComparison.map(({ action, ev }) => (
            <TrainStatsRow key={action} label={action.toUpperCase()} value={`${ev.toFixed(1)} bb`} />
          ))}
        </>
      )}

      {scenario.gtoVsExploit && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">GTO vs Exploit</p>
          <p className="text-[12px] text-td-cream"><span className="text-td-goldsoft">GTO:</span> {scenario.gtoVsExploit.gto}</p>
          <p className="text-[12px] text-td-cream"><span className="text-td-goldsoft">Exploit:</span> {scenario.gtoVsExploit.exploit}</p>
        </>
      )}

      <PrimaryPlayingButton type="button" disabled className="opacity-60">
        Save Report (Coming Soon)
      </PrimaryPlayingButton>
    </TrainQuestionCard>
  );
}
