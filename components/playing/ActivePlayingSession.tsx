"use client";

import { useEffect, useState } from "react";
import { PlayingSession } from "@/lib/types";
import {
  formatDuration,
  formatMoneyPrecise,
  hoursPlayed,
  sessionTypeLabel,
  totalBuyIns,
} from "@/lib/playing";
import { fmtTime } from "@/lib/blocks";

export default function ActivePlayingSession({
  session,
  onAddBuyIn,
  onEdit,
  onEnd,
}: {
  session: PlayingSession;
  onAddBuyIn: () => void;
  onEdit: () => void;
  onEnd: () => void;
}) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const duration = hoursPlayed(session.start_time, null);
  const invested = totalBuyIns(session);

  return (
    <section className="bg-td-surface border border-td-border rounded-2xl px-5.5 py-5 mb-4">
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-xs text-td-muted font-semibold uppercase tracking-wide">
          {sessionTypeLabel(session.session_type)}
        </span>
        <span className="text-xs font-mono text-td-goldsoft font-semibold">
          {duration != null ? formatDuration(duration) : "—"}
        </span>
      </div>

      {session.title && <div className="text-sm font-semibold text-td-cream mb-1">{session.title}</div>}
      {session.location && <div className="text-[13px] text-td-muted mb-1">{session.location}</div>}
      <div className="text-[13.5px] font-semibold text-td-cream mb-0.5">
        {session.game}
        {session.stakes ? ` · ${session.stakes}` : ""}
      </div>
      <div className="text-[12px] text-td-muted mb-4">Started {fmtTime(session.start_time)}</div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-td-surface2 border border-td-border rounded-xl px-3.5 py-3">
          <span className="text-[10.5px] text-td-muted uppercase tracking-wide block mb-1">Initial Buy-in</span>
          <span className="font-mono font-semibold text-[15px]">{formatMoneyPrecise(session.initial_buy_in)}</span>
        </div>
        <div className="bg-td-surface2 border border-td-border rounded-xl px-3.5 py-3">
          <span className="text-[10.5px] text-td-muted uppercase tracking-wide block mb-1">Additional</span>
          <span className="font-mono font-semibold text-[15px]">
            {formatMoneyPrecise(session.additional_buy_ins)}
          </span>
        </div>
      </div>

      <div className="bg-td-surface2 border border-td-border rounded-xl px-4 py-3.5 mb-4 text-center">
        <span className="text-[11px] text-td-muted uppercase tracking-wide block mb-1">Total Invested</span>
        <span className="font-mono font-semibold text-2xl text-td-cream">{formatMoneyPrecise(invested)}</span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={onAddBuyIn}
          className="w-full rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream hover:border-td-gold"
        >
          {session.session_type === "tournament" ? "Add Re-entry / Add-on" : "Add Buy-in"}
        </button>
        <button
          onClick={onEdit}
          className="w-full rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream hover:border-td-gold"
        >
          Edit Session
        </button>
        <button
          onClick={onEnd}
          className="w-full rounded-[10px] py-3 font-bold text-sm bg-td-red text-td-cream hover:opacity-90"
        >
          End Session
        </button>
      </div>
    </section>
  );
}
