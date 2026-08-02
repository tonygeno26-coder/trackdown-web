"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, StickyNote, Clock, DollarSign, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { PlayingSession } from "@/lib/types";
import {
  formatDuration,
  formatMoneyPrecise,
  hoursPlayed,
  totalBuyIns,
} from "@/lib/playing";
import { sessionCategoryLabel, stakesOrMinimumLabel, getGamingCategory } from "@/lib/gaming";
import { fmtTime } from "@/lib/blocks";
import {
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  StatCard,
  MoneyValue,
  IconButton,
  fadeSlide,
} from "@/components/ui";
import TrackdownHeader from "@/components/TrackdownHeader";

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
    <motion.div {...fadeSlide} className="space-y-5 pb-4">
      <TrackdownHeader showToday compact />

      <SurfaceCard feature className="relative overflow-hidden px-6 py-7">
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
          <IconButton label="Edit session" onClick={onEdit} className="p-2.5">
            <Pencil size={15} strokeWidth={1.75} />
          </IconButton>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-td-muted">Total Invested</p>
        <div className="mt-2">
          <MoneyValue amount={formatMoneyPrecise(invested)} size="xl" />
        </div>
        <p className="mt-3 text-[12px] text-td-muted">
          Running {durationLabel} · Started {fmtTime(session.start_time)}
        </p>
      </SurfaceCard>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Duration" value={durationLabel} icon={Clock} accent="text-td-goldsoft" />
        <StatCard label={buyInLabel} value={formatMoneyPrecise(session.initial_buy_in)} icon={DollarSign} />
        <StatCard label="Additional" value={formatMoneyPrecise(session.additional_buy_ins)} icon={Layers} />
      </div>

      {session.notes && (
        <SurfaceCard className="px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-td-muted">Notes</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-td-cream">{session.notes}</p>
        </SurfaceCard>
      )}

      <div className="space-y-3 pt-1">
        <PrimaryButton session onClick={onAddBuyIn}>
          <Plus size={18} strokeWidth={2.5} aria-hidden />
          {category === "poker" && session.session_type === "tournament"
            ? "Add Re-entry / Add-on"
            : "Add Buy-in"}
        </PrimaryButton>
        <div className="grid grid-cols-2 gap-2.5">
          <SecondaryButton onClick={onAddNote}>
            <StickyNote size={16} aria-hidden /> Add Note
          </SecondaryButton>
          <DestructiveButton onClick={onEnd}>End Session</DestructiveButton>
        </div>
      </div>
    </motion.div>
  );
}
