"use client";

import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { Shift, WeeklyRate } from "@/lib/types";
import { computeWeeklyPay } from "@/lib/pay";
import { upsertWeeklyRate } from "@/lib/db-mutations";
import { useAuth } from "@/components/auth/AuthProvider";
import TrackdownHeader from "@/components/TrackdownHeader";
import { EmptyState } from "@/components/ui";
import WeekPayCard from "@/components/pay/WeekPayCard";

export default function PayScreen({
  shifts,
  weeklyRates,
  onWeeklyRatesChange,
  setError,
}: {
  shifts: Shift[];
  weeklyRates: WeeklyRate[];
  onWeeklyRatesChange: (next: WeeklyRate[]) => void;
  setError: (msg: string | null) => void;
}) {
  const { userId } = useAuth();
  const weeks = useMemo(() => computeWeeklyPay(shifts, weeklyRates), [shifts, weeklyRates]);

  const saveRate = async (weekStart: string, downRate: number) => {
    if (!userId) return;
    const { rate, error: err } = await upsertWeeklyRate(userId, weekStart, downRate);
    if (err || !rate) {
      setError(err ?? "Could not save down rate.");
      return;
    }
    const next = weeklyRates.some((r) => r.week_start === weekStart)
      ? weeklyRates.map((r) => (r.week_start === weekStart ? rate : r))
      : [...weeklyRates, rate];
    onWeeklyRatesChange(next);
  };

  return (
    <div className="space-y-3 pb-4">
      <TrackdownHeader compact />

      {weeks.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No Pay Yet"
          description="Once you've worked a shift, its week will show up here so you can post a down rate and see what you made."
        />
      ) : (
        weeks.map((week) => (
          <WeekPayCard key={week.weekStart} week={week} onSaveRate={(rate) => saveRate(week.weekStart, rate)} />
        ))
      )}
    </div>
  );
}
