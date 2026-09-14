"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Shift } from "@/lib/types";
import { fetchUnclaimedShifts, claimShifts } from "@/lib/claim";
import { fmtDateHeader, fmtMoneyPrecise } from "@/lib/blocks";
import { shiftTypeLabel, shiftTotalEarnings } from "@/lib/shift-segments";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppScreen, PrimaryButton, SecondaryButton, LoadingState } from "@/components/ui";
import TrackdownHeader from "@/components/TrackdownHeader";

export default function ClaimScreen({ onDone }: { onDone: () => void }) {
  const { userId, completeClaim } = useAuth();
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchUnclaimedShifts().then(({ shifts: rows, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err);
        setShifts([]);
        return;
      }
      if (rows.length === 0) {
        completeClaim().then(onDone);
        return;
      }
      setShifts(rows);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const finish = async (ids: string[]) => {
    if (!userId || submitting) return;
    setSubmitting(true);
    const { error: err } = await claimShifts(ids, userId);
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }
    await completeClaim();
    onDone();
  };

  if (shifts === null) {
    return (
      <div className="min-h-screen bg-td-bg">
        <LoadingState message="Checking for past entries…" />
      </div>
    );
  }

  return (
    <AppScreen>
      <TrackdownHeader />
      <div className="mb-5 text-center">
        <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
          Claim Your Past Entries
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-td-muted">
          These shifts aren&apos;t tied to any account yet. Check off anything that&apos;s yours — this is a
          one-time thing, and once claimed it&apos;s permanently yours.
        </p>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-center text-[12.5px] text-red-300">
          {error}
        </p>
      )}

      <div className="mb-5 space-y-2">
        {shifts.map((shift) => {
          const isSelected = selected.has(shift.id);
          return (
            <button
              key={shift.id}
              type="button"
              onClick={() => toggle(shift.id)}
              className={`flex w-full items-center gap-3 rounded-[11px] border px-3.5 py-3 text-left transition-colors ${
                isSelected
                  ? "border-td-gold bg-td-gold/10"
                  : "border-td-border bg-td-surface hover:border-td-gold/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  isSelected ? "border-td-gold bg-td-gold text-[#1a1305]" : "border-td-border"
                }`}
                aria-hidden
              >
                {isSelected && <Check size={13} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-td-cream">
                  {shift.title || shiftTypeLabel(shift.type)}
                </span>
                <span className="block text-[11.5px] text-td-muted">
                  {fmtDateHeader(shift.start_time)} · {shiftTypeLabel(shift.type)}
                </span>
              </span>
              <span className="font-mono text-[13px] font-semibold text-td-goldsoft">
                {fmtMoneyPrecise(shiftTotalEarnings(shift))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        <PrimaryButton disabled={selected.size === 0 || submitting} onClick={() => finish(Array.from(selected))}>
          {submitting ? "Claiming…" : `Claim Selected (${selected.size})`}
        </PrimaryButton>
        <SecondaryButton disabled={submitting} onClick={() => finish([])}>
          None Of These Are Mine
        </SecondaryButton>
      </div>
    </AppScreen>
  );
}
