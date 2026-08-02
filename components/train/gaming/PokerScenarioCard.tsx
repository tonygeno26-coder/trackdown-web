"use client";

import { PokerScenario } from "@/lib/training/types";
import { PlayingCard } from "@/components/playing/PlayingUi";

export default function PokerScenarioCard({ scenario }: { scenario: PokerScenario }) {
  return (
    <PlayingCard className="space-y-3 p-5">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-td-border px-2.5 py-0.5 text-[10px] font-semibold uppercase text-td-muted">
          {scenario.gameType}
        </span>
        <span className="rounded-full border border-td-border px-2.5 py-0.5 text-[10px] font-semibold uppercase text-td-muted">
          {scenario.difficulty}
        </span>
        {scenario.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-td-gold/20 px-2.5 py-0.5 text-[10px] font-semibold text-td-goldsoft"
          >
            {tag.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <p className="text-td-muted">Hero</p>
          <p className="font-mono font-bold text-td-cream">{scenario.heroCards}</p>
        </div>
        <div>
          <p className="text-td-muted">Board</p>
          <p className="font-mono font-bold text-td-cream">{scenario.board}</p>
        </div>
        <div>
          <p className="text-td-muted">Position</p>
          <p className="font-semibold text-td-cream">{scenario.heroPosition}</p>
        </div>
        <div>
          <p className="text-td-muted">Pot</p>
          <p className="font-mono font-bold text-td-goldsoft">${scenario.potSize}</p>
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-td-muted">{scenario.actionHistory}</p>
      <p className="text-[10px] text-td-muted">{scenario.source}</p>
    </PlayingCard>
  );
}
