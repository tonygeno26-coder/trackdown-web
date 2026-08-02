"use client";

import { useMemo } from "react";
import { parseCardList } from "@/lib/cards";
import { PokerScenario } from "@/lib/training/types";
import { getStreetFromBoard, logScenarioValidationWarnings } from "@/lib/training/scenario-validation";
import CardRow from "@/components/cards/CardRow";
import CardFan from "@/components/cards/CardFan";
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
      <div className="relative bg-gradient-to-b from-td-surface2 via-td-surface/95 to-td-bg px-3 py-4 sm:px-4 sm:py-5">
        <div className="absolute inset-3 rounded-[999px] border border-td-gold/10 bg-td-surface/30 sm:inset-4" aria-hidden />

        <div className="relative space-y-3">
          {/* Hero cards — primary focus */}
          <div className="space-y-2 pt-1">
            {isPlo && heroCards.length === 4 ? (
              <CardFan cards={heroCards} highlighted={highlightHero} />
            ) : (
              <CardRow cards={heroCards} size="hero" highlighted={highlightHero} />
            )}
            <div className="flex justify-center">
              <PokerSeat
                position={scenario.heroPosition}
                stack={scenario.effectiveStack}
                isHero
                isDealer={scenario.heroPosition === "BTN" || scenario.heroPosition === "SB"}
                isActive
              />
            </div>
          </div>

          {/* Board */}
          <PokerBoard cards={boardCards} street={street} size="medium" />

          {/* Pot — secondary */}
          <div className="text-center">
            <p className="font-mono text-[20px] font-bold text-td-goldsoft">${scenario.potSize}</p>
            <p className="text-[9px] font-semibold uppercase tracking-[1px] text-td-muted">Pot</p>
          </div>

          {/* Villain — tertiary */}
          <div className="flex justify-center">
            <PokerSeat
              position={villainPos}
              stack={scenario.effectiveStack}
              isDealer={!scenario.tags.includes("preflop") && scenario.heroPosition !== "BB"}
              isActive={scenario.actionHistory.toLowerCase().includes("villain") || scenario.actionHistory.includes("?")}
              folded={false}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-td-border/60 bg-td-surface/90 px-3 py-2.5 sm:px-4 sm:py-3">
        <p className="text-[11px] leading-relaxed text-td-muted">{scenario.actionHistory}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-td-muted">
            {scenario.gameType}
          </span>
          <span className="text-[9px] text-td-muted">{scenario.stakes}</span>
          <span className="rounded-full border border-td-border px-1.5 py-0.5 text-[9px] text-td-muted">
            {scenario.difficulty}
          </span>
        </div>
      </div>
    </SurfaceCard>
  );
}
