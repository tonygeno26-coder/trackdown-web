"use client";

import { useState, useEffect, useCallback } from "react";
import { Spade } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Shift, PlayingSession } from "@/lib/types";
import AppHeader, { MainView } from "@/components/AppHeader";
import DealingSection from "@/components/dealing/DealingSection";
import PlayingSection from "@/components/playing/PlayingSection";
import HistorySection from "@/components/HistorySection";

export default function Home() {
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [playingSessions, setPlayingSessions] = useState<PlayingSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<MainView>("dealing");

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-td-muted">
        <Spade size={26} className="animate-pulse text-td-gold" />
        <span>Loading Trackdown…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <AppHeader view={view} onViewChange={setView} />

      {error && (
        <div className="max-w-[520px] mx-auto mt-2.5 px-4 py-2.5 bg-[#331d1d] border border-td-red rounded-lg text-[13px] text-center">
          {error}
        </div>
      )}

      <main className={`mx-auto max-w-[520px] px-5 pb-8 ${view === "playing" ? "pt-2" : "pt-4.5"}`}>
        {view === "dealing" && (
          <DealingSection shifts={shifts} onShiftsChange={setShifts} setError={setError} />
        )}
        {view === "playing" && (
          <PlayingSection
            sessions={playingSessions}
            onSessionsChange={setPlayingSessions}
            setError={setError}
          />
        )}
        {view === "history" && (
          <HistorySection
            shifts={shifts}
            playingSessions={playingSessions}
            onShiftsChange={setShifts}
            onSessionsChange={setPlayingSessions}
            setError={setError}
          />
        )}
      </main>
    </div>
  );
}
