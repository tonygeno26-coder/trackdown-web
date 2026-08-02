"use client";

import { ParsedCard } from "@/lib/cards";
import CardRow from "@/components/cards/CardRow";
import CardFan from "@/components/cards/CardFan";
import { SurfaceCard } from "@/components/ui";

export function RangePreview({
  heroCards,
  boardCards,
  actionHistory,
}: {
  heroCards: ParsedCard[];
  boardCards: ParsedCard[];
  actionHistory: string;
}) {
  const isPlo = heroCards.length === 4;

  return (
    <SurfaceCard className="space-y-3 p-4">
      {isPlo ? (
        <CardFan cards={heroCards} highlighted />
      ) : (
        <CardRow cards={heroCards} size="hero" highlighted />
      )}
      {boardCards.length > 0 && <CardRow cards={boardCards} size="medium" overlap />}
      <p className="text-[12px] text-td-muted">{actionHistory}</p>
    </SurfaceCard>
  );
}
