"use client";

import { Card } from "@/lib/cards";
import CardRow from "@/components/cards/CardRow";
import { SurfaceCard } from "@/components/ui";

export function RangePreview({
  heroCards,
  boardCards,
  actionHistory,
}: {
  heroCards: Card[];
  boardCards: Card[];
  actionHistory: string;
}) {
  return (
    <SurfaceCard className="space-y-3 p-4">
      <CardRow cards={heroCards} size="medium" highlighted />
      {boardCards.length > 0 && <CardRow cards={boardCards} size="medium" />}
      <p className="text-[13px] text-td-muted">{actionHistory}</p>
    </SurfaceCard>
  );
}
