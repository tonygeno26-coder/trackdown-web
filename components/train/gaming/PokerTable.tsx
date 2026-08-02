"use client";

import { useMemo } from "react";
import { parseCardList } from "@/lib/cards";
import { PokerScenario } from "@/lib/training/types";
import { getStreetFromBoard, logScenarioValidationWarnings } from "@/lib/training/scenario-validation";
import CardRow from "@/components/cards/CardRow";
import { SurfaceCard } from "@/components/ui";
import PokerBoard from "@/components/train/gaming/PokerBoard";
import PokerSeat from "@/components/train/gaming/PokerSeat";

export default function PokerTable({
  scenario,
  highlightHero,
}: {
  scenario: PokerScenario;
  highlightHero?: boolean;
}) {
  useMemo(() => {
    logScenarioValidationWarnings(scenario);
    return null;
  }, [scenario.id]);

  const heroCards = parseCardList(scenario.heroCards);
  const boardCards = parseCardList(scenario.board);
  const street = getStreetFromBoard(boardCards.length);
  const villainPos = scenario.villainPosition ?? "Villain";
  const isPlo = scenario.gameType.toLowerCase().includes("plo") || scenario.tags.includes("plo");

  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="border-b border-td-border/60 bg-td-surface2/60 px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-td-muted">
            {scenario.gameType}
          </span>
          <span className="text-[10px] text-td-muted">{scenario.stakes}</span>
          <span className="rounded-full border border-td-border px-2 py-0.5 text-[10px] text-td-muted">
            {scenario.difficulty}
          </span>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-td-surface2 via-td-surface/95 to-td-bg px-4 py-5">
        <div className="absolute inset-4 rounded-[999px] border border-td-gold/10 bg-td-surface/30" aria-hidden />

        <div className="relative space-y-4">
          <div className="flex justify-center">
            <PokerSeat
              position={villainPos}
              stack={scenario.effectiveStack}
              isDealer={!scenario.tags.includes("preflop") && scenario.heroPosition !== "BB"}
              isActive={scenario.actionHistory.toLowerCase().includes("villain") || scenario.actionHistory.includes("?")}
              folded={false}
            />
          </div>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">Pot</p>
            <p className="font-mono text-[22px] font-bold text-td-goldsoft">${scenario.potSize}</p>
          </div>

          <PokerBoard cards={boardCards} street={street} size="medium" />

          <div className="space-y-3">
            <div className="flex justify-center">
              <PokerSeat
                position={scenario.heroPosition}
                stack={scenario.effectiveStack}
                isHero
                isDealer={scenario.heroPosition === "BTN" || scenario.heroPosition === "SB"}
                isActive
              />
            </div>
            <CardRow cards={heroCards} size="large" highlighted={highlightHero} gapClass="gap-2" />
            {isPlo && heroCards.length === 4 && (
              <p className="text-center text-[10px] uppercase tracking-wide text-td-muted">PLO — 4 hole cards</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-td-border/60 bg-td-surface/90 px-4 py-3">
        <p className="text-[12px] leading-relaxed text-td-muted">{scenario.actionHistory}</p>
      </div>
    </SurfaceCard>
  );
}
