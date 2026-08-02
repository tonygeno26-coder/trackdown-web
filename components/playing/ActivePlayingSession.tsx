"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Clock, DollarSign, Layers } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import {
  formatDuration,
  formatMoneyPrecise,
  hoursPlayed,
  sessionTypeLabel,
  totalBuyIns,
} from "@/lib/playing";
import { fmtTime } from "@/lib/blocks";
import {
  PlayingCard,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
  playingFadeIn,
} from "@/components/playing/PlayingUi";

function StatTile({
  label,
  value,
  icon: Icon,
  accent = "text-td-cream",
}: {
  label: string;
  value: string;
  icon: typeof Clock;
  accent?: string;
}) {
  return (
    <PlayingCard className="px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-td-muted">
        <Icon size={14} strokeWidth={1.75} />
        <span className="text-[10px] font-semibold uppercase tracking-[1px]">{label}</span>
      </div>
      <span className={`font-mono text-[17px] font-semibold ${accent}`}>{value}</span>
    </PlayingCard>
  );
}

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
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const durationHours = hoursPlayed(session.start_time, null);
  const invested = totalBuyIns(session);
  const durationLabel = durationHours != null ? formatDuration(durationHours) : "—";

  return (
    <motion.div
      {...playingFadeIn}
      className="flex min-h-[calc(100vh-220px)] flex-col gap-6"
    >
      <PlayingCard className="relative overflow-hidden px-6 py-8 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,#c8202f_10%,transparent),transparent_55%)]"
        />

        <div className="relative mb-6 flex items-start justify-between">
          <div className="text-left">
            <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-td-gold">
              {sessionTypeLabel(session.session_type)}
            </span>
            {session.location && (
              <p className="mt-1 text-[13px] text-td-muted">{session.location}</p>
            )}
            <p className="mt-1 font-display text-[15px] font-bold text-td-cream">
              {session.game}
              {session.stakes ? ` · ${session.stakes}` : ""}
            </p>
          </div>
          <button
            onClick={onEdit}
            className="rounded-full border border-td-border/80 bg-td-surface2/70 p-2.5 text-td-muted transition-colors hover:border-td-gold/30 hover:text-td-cream"
            aria-label="Edit session"
          >
            <Pencil size={15} strokeWidth={1.75} />
          </button>
        </div>

        <p className="relative text-[10px] font-semibold uppercase tracking-[2px] text-td-muted">
          Bankroll in Play
        </p>
        <motion.p
          key={invested}
          initial={{ scale: 0.98, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mt-2 font-mono text-[44px] font-semibold leading-none text-td-cream"
        >
          {formatMoneyPrecise(invested)}
        </motion.p>

        <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-td-border/60 pt-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">
              Session P/L
            </p>
            <p className="mt-1 font-mono text-[20px] font-semibold text-td-muted">—</p>
            <p className="mt-1 text-[11px] text-td-muted/80">Set when session ends</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">
              Hourly Rate
            </p>
            <p className="mt-1 font-mono text-[20px] font-semibold text-td-muted">—</p>
            <p className="mt-1 text-[11px] text-td-muted/80">Live after cash-out</p>
          </div>
        </div>
      </PlayingCard>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Duration" value={durationLabel} icon={Clock} accent="text-td-goldsoft" />
        <StatTile
          label="Initial Buy-in"
          value={formatMoneyPrecise(session.initial_buy_in)}
          icon={DollarSign}
        />
        <StatTile
          label="Additional"
          value={formatMoneyPrecise(session.additional_buy_ins)}
          icon={Layers}
        />
      </div>

      <PlayingCard className="px-5 py-4">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-td-muted">Started</span>
          <span className="font-mono font-medium text-td-cream">{fmtTime(session.start_time)}</span>
        </div>
        {session.title && (
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-td-muted">Title</span>
            <span className="font-medium text-td-cream">{session.title}</span>
          </div>
        )}
      </PlayingCard>

      <div className="mt-auto space-y-3 pt-2">
        <PrimaryPlayingButton onClick={onAddBuyIn}>
          <Plus size={18} strokeWidth={2.5} />
          {session.session_type === "tournament" ? "Add Re-entry / Add-on" : "Add Buy-in"}
        </PrimaryPlayingButton>
        <SecondaryPlayingButton
          onClick={onEnd}
          className="border-td-red/40 text-red-300 hover:border-td-red/60"
        >
          End Session
        </SecondaryPlayingButton>
      </div>
    </motion.div>
  );
}
