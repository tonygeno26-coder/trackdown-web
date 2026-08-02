"use client";

import { motion } from "framer-motion";
import { Hand } from "lucide-react";
import { PlayingSession } from "@/lib/types";
import {
  cashOutLabel,
  formatDuration,
  formatMoneyPrecise,
  formatSignedMoney,
  hoursPlayed,
  netResult,
  sessionHourlyRate,
  totalBuyIns,
} from "@/lib/playing";
import { sessionCategoryLabel } from "@/lib/gaming";
import { fmtTime } from "@/lib/blocks";
import {
  ResultPanel,
  SurfaceCard,
  MoneyValue,
  StatusBadge,
  PrimaryButton,
  SecondaryButton,
  fadeSlide,
} from "@/components/ui";

function DetailRow({
  label,
  value,
  accent = "text-td-cream",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-td-muted">{label}</span>
      <span className={`text-right font-mono text-[13px] font-semibold ${accent}`}>{value}</span>
    </div>
  );
}

export default function PlayingSessionResult({
  session,
  onDismiss,
  dismissLabel = "Done",
  showSaveHandPrompt,
  onSaveHand,
}: {
  session: PlayingSession;
  onDismiss: () => void;
  dismissLabel?: string;
  showSaveHandPrompt?: boolean;
  onSaveHand?: () => void;
}) {
  const net = netResult(session);
  const hours = hoursPlayed(session.start_time, session.ended_at);
  const hourly = sessionHourlyRate(session);
  const isWin = net != null && net > 0;
  const isLoss = net != null && net < 0;
  const variant = isWin ? "win" : isLoss ? "loss" : "neutral";
  const badgeVariant = isWin ? "positive" : isLoss ? "negative" : "neutral";
  const badgeLabel = isWin ? "WIN" : isLoss ? "LOSS" : "BREAK EVEN";
  const hourlyAccent = isWin ? "text-td-goldsoft" : isLoss ? "text-red-300" : "text-td-cream";

  return (
    <motion.div {...fadeSlide} className="space-y-5">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[1.5px] text-td-gold">
        {sessionCategoryLabel(session)}
      </p>

      <ResultPanel variant={variant} label="Session Result">
        <div className="flex flex-col items-center gap-4">
          <StatusBadge variant={badgeVariant}>{badgeLabel}</StatusBadge>
          <MoneyValue
            amount={net != null ? formatSignedMoney(net) : "—"}
            signed
            positive={isWin ? true : isLoss ? false : undefined}
            size="xl"
          />
        </div>
      </ResultPanel>

      <SurfaceCard className="space-y-3 px-5 py-5 text-[13px]">
        <DetailRow label="Total Buy-ins" value={formatMoneyPrecise(totalBuyIns(session))} />
        <DetailRow
          label={cashOutLabel(session.session_type)}
          value={formatMoneyPrecise(session.cash_out || 0)}
        />
        <DetailRow label="Expenses" value={formatMoneyPrecise(session.expenses || 0)} />
        {hours != null && <DetailRow label="Hours Played" value={formatDuration(hours)} />}
        {hourly != null && (
          <DetailRow label="Hourly Rate" value={`${formatSignedMoney(hourly)}/hr`} accent={hourlyAccent} />
        )}
        {session.ended_at && (
          <div className="space-y-3 border-t border-td-border/70 pt-3">
            <DetailRow label="Ended" value={fmtTime(session.ended_at)} />
          </div>
        )}
      </SurfaceCard>

      {session.notes && (
        <p className="px-1 text-[13px] italic leading-relaxed text-td-muted">{session.notes}</p>
      )}

      {showSaveHandPrompt && onSaveHand && (
        <SurfaceCard className="space-y-3 p-5">
          <p className="text-center text-[14px] font-semibold text-td-cream">
            Would you like to save a hand?
          </p>
          <p className="text-center text-[12px] text-td-muted">
            Save a memorable hand from this session for study and review.
          </p>
          <PrimaryButton type="button" onClick={onSaveHand}>
            <Hand size={16} aria-hidden /> Save a Hand
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onDismiss}>
            No Thanks
          </SecondaryButton>
        </SurfaceCard>
      )}

      {(!showSaveHandPrompt || !onSaveHand) && (
        <PrimaryButton onClick={onDismiss}>{dismissLabel}</PrimaryButton>
      )}
    </motion.div>
  );
}
