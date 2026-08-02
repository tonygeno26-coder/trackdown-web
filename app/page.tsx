"use client";

import { useState, useEffect, useCallback } from "react";
import { Spade } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Shift, PlayingSession } from "@/lib/types";
import BottomNav, { AppTab } from "@/components/navigation/BottomNav";
import HomeDashboard from "@/components/home/HomeDashboard";
import StatsScreen from "@/components/stats/StatsScreen";
import HistoryScreen from "@/components/history/HistoryScreen";
import SettingsScreen from "@/components/settings/SettingsScreen";

export default function Home() {
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [playingSessions, setPlayingSessions] = useState<PlayingSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<AppTab>("home");

  const loadData = useCallback(async () => {
    const [shiftsRes, sessionsRes] = await Promise.all([
      supabase.from("shifts").select("*").order("start_time", { ascending: false }),
      supabase.from("playing_sessions").select("*").order("start_time", { ascending: false }),
    ]);

    if (shiftsRes.error) {
      setError(shiftsRes.error.message);
      return;
    }
    if (sessionsRes.error) {
      setError(sessionsRes.error.message);
      return;
    }

    setShifts(shiftsRes.data as Shift[]);
    setPlayingSessions(sessionsRes.data as PlayingSession[]);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (shifts === null || playingSessions === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-td-muted">
        <Spade size={26} className="animate-pulse text-td-gold" />
        <span>Loading Trackdown…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-td-bg pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {error && (
        <div className="mx-auto mt-2.5 max-w-[520px] rounded-lg border border-td-red bg-td-red/15 px-4 py-2.5 text-center text-[13px] text-red-300">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-[11px] underline opacity-80"
          >
            dismiss
          </button>
        </div>
      )}

      <main className="mx-auto max-w-[520px] px-5 pt-2">
        {tab === "home" && (
          <HomeDashboard
            shifts={shifts}
            playingSessions={playingSessions}
            onShiftsChange={setShifts}
            onSessionsChange={setPlayingSessions}
            setError={setError}
          />
        )}
        {tab === "stats" && <StatsScreen shifts={shifts} playingSessions={playingSessions} />}
        {tab === "history" && (
          <HistoryScreen
            shifts={shifts}
            playingSessions={playingSessions}
            onShiftsChange={setShifts}
            onSessionsChange={setPlayingSessions}
            setError={setError}
          />
        )}
        {tab === "settings" && <SettingsScreen />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
