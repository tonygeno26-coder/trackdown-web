"use client";

import { SidePotPlayerInput } from "@/lib/training/dealer-types";
import { calculateSidePots } from "@/lib/training/side-pot";
import { SurfaceCard } from "@/components/ui";

export default function SidePotTable({ players }: { players: SidePotPlayerInput[] }) {
  const calc = calculateSidePots(players);
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="border-b border-td-border bg-td-surface2/60 px-4 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-td-muted">Table · Total ${calc.totalPot}</p>
      </div>
      <div className="divide-y divide-td-border/60">
        {players.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[14px] font-semibold text-td-cream">
                {p.name}
                {p.folded && <span className="ml-2 text-[11px] text-td-muted">(folded)</span>}
              </p>
              <p className="text-[12px] text-td-muted">Stack ${p.stack} · In ${p.committed}</p>
            </div>
            <span className="font-mono text-[14px] font-bold text-td-goldsoft">${p.committed}</span>
          </div>
        ))}
      </div>
      {calc.layers.length > 0 && (
        <div className="border-t border-td-border bg-td-bg/40 px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase text-td-muted">Pot layers</p>
          {calc.layers.map((l, i) => (
            <p key={i} className="text-[12px] text-td-cream">
              {l.label}: ${l.amount} — {l.eligibleIds.join(", ") || "none"}
            </p>
          ))}
        </div>
      )}
    </SurfaceCard>
  );
}
