"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, StickyNote, Clock, DollarSign, Layers } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import {
  formatDuration,
  formatMoneyPrecise,
  hoursPlayed,
  totalBuyIns,
} from "@/lib/playing";
import { sessionCategoryLabel, stakesOrMinimumLabel } from "@/lib/gaming";
import { fmtTime } from "@/lib/blocks";
import {
  PlayingCard,
  PrimaryPlayingButton,
  SecondaryPlayingButton,
  playingFadeIn,
} from "@/components/playing/PlayingUi";
import TrackdownHeader from "@/components/TrackdownHeader";
import { motion } from "framer-motion";
import { getGamingCategory } from "@/lib/gaming";

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

export default function GamingCockpit({
  session,
  onAddBuyIn,
  onEdit,
  onAddNote,
  onEnd,
}: {
  session: PlayingSession;
  onAddBuyIn: () => void;
  onEdit: () => void;
  onAddNote: () => void;
  onEnd: () => void;
}) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const category = getGamingCategory(session);
  const durationHours = hoursPlayed(session.start_time, null);
  const invested = totalBuyIns(session);
  const durationLabel = durationHours != null ? formatDuration(durationHours) : "—";
  const buyInLabel =
    category === "poker" && session.session_type === "tournament" ? "Entry Cost" : "Initial Buy-in";

  return (
    <motion.div {...playingFadeIn} className="space-y-5 pb-4">
      <TrackdownHeader showToday />

      <PlayingCard className="relative overflow-hidden px-6 py-7">
        <div className="relative mb-5 flex items-start justify-between">
          <div className="text-left">
            <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-td-gold">
              {sessionCategoryLabel(session)}
            </span>
            {session.location && <p className="mt-1 text-[13px] text-td-muted">{session.location}</p>}
            <p className="mt-1 font-display text-[16px] font-bold text-td-cream">{session.game}</p>
            {session.stakes && (
              <p className="mt-0.5 text-[13px] text-td-muted">
                {stakesOrMinimumLabel(session)}: {session.stakes}
              </p>
            )}
          </div>
          <button
            onClick={onEdit}
            className="rounded-full border border-td-border/80 bg-td-surface2/70 p-2.5 text-td-muted hover:border-td-gold/30 hover:text-td-cream"
            aria-label="Edit session"
          >
            <Pencil size={15} strokeWidth={1.75} />
          </button>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-td-muted">Total Invested</p>
        <p className="mt-2 font-mono text-[40px] font-semibold leading-none text-td-cream">
          {formatMoneyPrecise(invested)}
        </p>
        <p className="mt-3 text-[12px] text-td-muted">
          Running {durationLabel} · Started {fmtTime(session.start_time)}
        </p>
      </PlayingCard>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Duration" value={durationLabel} icon={Clock} accent="text-td-goldsoft" />
        <StatTile label={buyInLabel} value={formatMoneyPrecise(session.initial_buy_in)} icon={DollarSign} />
        <StatTile label="Additional" value={formatMoneyPrecise(session.additional_buy_ins)} icon={Layers} />
      </div>

      {session.notes && (
        <PlayingCard className="px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">Notes</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-td-cream">{session.notes}</p>
        </PlayingCard>
      )}

      <div className="space-y-3 pt-1">
        <PrimaryPlayingButton onClick={onAddBuyIn}>
          <Plus size={18} strokeWidth={2.5} />
          {category === "poker" && session.session_type === "tournament"
            ? "Add Re-entry / Add-on"
            : "Add Buy-in"}
        </PrimaryPlayingButton>
        <div className="grid grid-cols-2 gap-2.5">
          <SecondaryPlayingButton onClick={onAddNote}>
            <StickyNote size={16} /> Add Note
          </SecondaryPlayingButton>
          <SecondaryPlayingButton onClick={onEnd} className="border-td-red/40 text-red-300">
            End Session
          </SecondaryPlayingButton>
        </div>
      </div>
    </motion.div>
  );
}
