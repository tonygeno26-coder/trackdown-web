"use client";

import { motion } from "framer-motion";
import { PlayingSession } from "@/lib/types";
import {
  cashOutLabel,
  formatDuration,
  formatMoneyPrecise,
  formatSignedMoney,
  hoursPlayed,
  netResult,
  netResultColorClass,
  sessionHourlyRate,
  totalBuyIns,
} from "@/lib/playing";
import { fmtTime } from "@/lib/blocks";
import { PlayingCard, PrimaryPlayingButton, playingFadeIn } from "@/components/playing/PlayingUi";

export default function PlayingSessionResult({
  session,
  onDismiss,
}: {
  session: PlayingSession;
  onDismiss: () => void;
}) {
  const net = netResult(session);
  const hours = hoursPlayed(session.start_time, session.ended_at);
  const hourly = sessionHourlyRate(session);
  const isWin = net != null && net > 0;
  const isLoss = net != null && net < 0;

  return (
    <motion.div {...playingFadeIn} className="space-y-6">
      <PlayingCard className="relative overflow-hidden px-6 py-10 text-center">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${
            isWin
              ? "bg-[radial-gradient(circle_at_50%_20%,color-mix(in_srgb,#2ecc71_12%,transparent),transparent_60%)]"
              : isLoss
                ? "bg-[radial-gradient(circle_at_50%_20%,color-mix(in_srgb,#8a1620_18%,transparent),transparent_60%)]"
                : ""
          }`}
        />

        <span className="relative text-[10px] font-semibold uppercase tracking-[2.5px] text-td-muted">
          Session Result
        </span>
        <span
          className={`relative mt-4 block font-display text-2xl font-extrabold uppercase tracking-[3px] ${
            isWin ? "text-td-goldsoft" : isLoss ? "text-red-300" : "text-td-cream"
          }`}
        >
          {isWin ? "Win" : isLoss ? "Loss" : "Even"}
        </span>
        <span
          className={`relative mt-3 block font-mono text-[44px] font-semibold leading-none ${netResultColorClass(net)}`}
        >
          {net != null ? formatSignedMoney(net) : "—"}
        </span>

        {hours != null && (
          <span className="relative mt-5 block text-[14px] text-td-muted">
            {formatDuration(hours)} played
          </span>
        )}
        {hourly != null && (
          <span
            className={`relative mt-1 block font-mono text-[18px] font-semibold ${netResultColorClass(hourly)}`}
          >
            {formatSignedMoney(hourly)}/hour
          </span>
        )}
      </PlayingCard>

      <PlayingCard className="space-y-3 px-5 py-5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-td-muted">Total Buy-ins</span>
          <span className="font-mono font-semibold">{formatMoneyPrecise(totalBuyIns(session))}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-td-muted">{cashOutLabel(session.session_type)}</span>
          <span className="font-mono font-semibold">{formatMoneyPrecise(session.cash_out || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-td-muted">Expenses</span>
          <span className="font-mono font-semibold">{formatMoneyPrecise(session.expenses || 0)}</span>
        </div>
        {session.ended_at && (
          <div className="flex justify-between border-t border-td-border/70 pt-3">
            <span className="text-td-muted">Ended</span>
            <span className="font-mono">{fmtTime(session.ended_at)}</span>
          </div>
        )}
      </PlayingCard>

      {session.notes && (
        <p className="px-1 text-[13px] italic leading-relaxed text-td-muted">{session.notes}</p>
      )}

      <PrimaryPlayingButton onClick={onDismiss}>Done</PrimaryPlayingButton>
    </motion.div>
  );
}
