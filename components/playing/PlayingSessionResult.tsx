"use client";

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
    <div className="bg-td-surface border border-td-border rounded-2xl px-5.5 py-6 text-center">
      <span className="text-[11px] text-td-muted uppercase tracking-[2px] block mb-3">Session Result</span>
      <span
        className={`block font-display font-extrabold text-lg uppercase tracking-wide mb-2 ${
          isWin ? "text-td-goldsoft" : isLoss ? "text-red-300" : "text-td-cream"
        }`}
      >
        {isWin ? "Win" : isLoss ? "Loss" : "Even"}
      </span>
      <span className={`block font-mono font-semibold text-4xl leading-tight mb-3 ${netResultColorClass(net)}`}>
        {net != null ? formatSignedMoney(net) : "—"}
      </span>
      {hours != null && (
        <span className="block text-[13px] text-td-muted mb-1">{formatDuration(hours)} played</span>
      )}
      {hourly != null && (
        <span className={`block font-mono font-semibold text-[15px] mb-4 ${netResultColorClass(hourly)}`}>
          {formatSignedMoney(hourly)}/hour
        </span>
      )}

      <div className="text-left bg-td-surface2 border border-td-border rounded-xl px-4 py-3.5 space-y-2 text-[13px]">
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
          <div className="flex justify-between pt-1 border-t border-td-border">
            <span className="text-td-muted">Ended</span>
            <span className="font-mono">{fmtTime(session.ended_at)}</span>
          </div>
        )}
      </div>

      {session.notes && (
        <p className="text-[12.5px] text-td-muted mt-3 text-left italic">{session.notes}</p>
      )}

      <button
        onClick={onDismiss}
        className="mt-5 w-full rounded-[10px] py-3 font-bold text-sm bg-td-gold text-[#1a1305] hover:bg-td-goldsoft"
      >
        Done
      </button>
    </div>
  );
}
