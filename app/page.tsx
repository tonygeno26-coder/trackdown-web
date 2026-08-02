"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Shift, PlayingSession } from "@/lib/types";
import BottomNav, { AppTab } from "@/components/navigation/BottomNav";
import HomeDashboard from "@/components/home/HomeDashboard";
import StatsScreen from "@/components/stats/StatsScreen";
import HistoryScreen from "@/components/history/HistoryScreen";
import SettingsScreen from "@/components/settings/SettingsScreen";
import TrainScreen from "@/components/train/TrainScreen";
import { AppSettingsProvider } from "@/components/settings/AppSettingsContext";
import { DeveloperPreviewProvider } from "@/components/dev/DeveloperPreviewProvider";
import { LoadingState, ErrorState } from "@/components/ui";
import { fadeSlide } from "@/components/ui/motion";

function TrackdownApp() {
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [playingSessions, setPlayingSessions] = useState<PlayingSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<AppTab>("home");
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [shiftsRes, sessionsRes] = await Promise.all([
      supabase.from("shifts").select("*").order("start_time", { ascending: false }),
      supabase.from("playing_sessions").select("*").order("start_time", { ascending: false }),
    ]);

    if (shiftsRes.error) {
      setLoadError(shiftsRes.error.message);
      return;
    }
    if (sessionsRes.error) {
      setLoadError(sessionsRes.error.message);
      return;
    }

    setLoadError(null);
    setShifts(shiftsRes.data as Shift[]);
    setPlayingSessions(sessionsRes.data as PlayingSession[]);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-td-bg">
        <ErrorState message={loadError} onRetry={loadData} />
      </div>
    );
  }

  if (shifts === null || playingSessions === null) {
    return (
      <div className="min-h-screen bg-td-bg">
        <LoadingState message="Loading Trackdown…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-td-bg pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {error && (
        <div className="mx-auto mt-2.5 max-w-[520px] px-5">
          <div className="rounded-xl border border-td-red/50 bg-td-red/10 px-4 py-2.5 text-center text-[13px] text-red-300">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 min-h-[44px] text-[11px] underline opacity-80"
            >
              dismiss
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[520px] px-5 pt-2">
        <AnimatePresence mode="wait">
          <motion.div key={tab} {...fadeSlide}>
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
            {tab === "train" && <TrainScreen />}
            {tab === "history" && (
              <HistoryScreen
                shifts={shifts}
                playingSessions={playingSessions}
                onShiftsChange={setShifts}
                onSessionsChange={setPlayingSessions}
                setError={setError}
              />
            )}
            {tab === "settings" && (
              <SettingsScreen
                currentTab={tab}
                shifts={shifts}
                playingSessions={playingSessions}
                onReloadData={loadData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function Home() {
  return (
    <AppSettingsProvider>
      <DeveloperPreviewProvider>
        <TrackdownApp />
      </DeveloperPreviewProvider>
    </AppSettingsProvider>
  );
}
