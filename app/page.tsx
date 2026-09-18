"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Shift, PlayingSession, WeeklyRate } from "@/lib/types";
import BottomNav, { AppTab } from "@/components/navigation/BottomNav";
import HomeDashboard from "@/components/home/HomeDashboard";
import StatsScreen from "@/components/stats/StatsScreen";
import PayScreen from "@/components/pay/PayScreen";
import HistoryScreen from "@/components/history/HistoryScreen";
import SettingsScreen from "@/components/settings/SettingsScreen";
import TrainScreen from "@/components/train/TrainScreen";
import { AppSettingsProvider } from "@/components/settings/AppSettingsContext";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import LoginScreen from "@/components/auth/LoginScreen";
import ClaimScreen from "@/components/auth/ClaimScreen";
import PaywallScreen from "@/components/paywall/PaywallScreen";
import { isGrandfathered } from "@/lib/entitlements";
import { configurePurchases, hasActiveProEntitlement } from "@/lib/subscription";
import { DeveloperPreviewProvider } from "@/components/dev/DeveloperPreviewProvider";
import DeveloperPreviewGuard from "@/components/dev/DeveloperPreviewGuard";
import { LoadingState, ErrorState } from "@/components/ui";
import { fadeSlide } from "@/components/ui/motion";

function TrackdownApp() {
  const { userId, ready, authError, authDiagnosticCode, isAnonymous, claimCompleted, retryAuth } = useAuth();
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [playingSessions, setPlayingSessions] = useState<PlayingSession[] | null>(null);
  const [weeklyRates, setWeeklyRates] = useState<WeeklyRate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<AppTab>("home");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;
    const [shiftsRes, sessionsRes, ratesRes] = await Promise.all([
      supabase.from("shifts").select("*").order("start_time", { ascending: false }),
      supabase.from("playing_sessions").select("*").order("start_time", { ascending: false }),
      supabase.from("weekly_rates").select("*"),
    ]);

    if (shiftsRes.error) {
      setLoadError(shiftsRes.error.message);
      return;
    }
    if (sessionsRes.error) {
      setLoadError(sessionsRes.error.message);
      return;
    }
    if (ratesRes.error) {
      setLoadError(ratesRes.error.message);
      return;
    }

    setLoadError(null);
    setShifts(shiftsRes.data as Shift[]);
    setPlayingSessions(sessionsRes.data as PlayingSession[]);
    setWeeklyRates(ratesRes.data as WeeklyRate[]);
  }, [userId]);

  useEffect(() => {
    if (!ready || !userId) return;
    setShifts(null);
    setPlayingSessions(null);
    setWeeklyRates(null);
    loadData();
  }, [ready, userId, loadData]);

  // Grandfathered beta testers (and the App Review account) skip the
  // paywall entirely, regardless of RevenueCat status. Everyone else needs
  // an active "pro" entitlement (a live trial counts as active).
  useEffect(() => {
    if (!ready || !userId || isAnonymous || claimCompleted !== true) return;
    let cancelled = false;
    setHasAccess(null);
    (async () => {
      const grandfathered = await isGrandfathered(userId);
      if (grandfathered) {
        if (!cancelled) setHasAccess(true);
        return;
      }
      await configurePurchases(userId);
      const active = await hasActiveProEntitlement();
      if (!cancelled) setHasAccess(active);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, userId, isAnonymous, claimCompleted]);

  if (!ready) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg">
        <LoadingState message="Loading Trackdown…" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg">
        <ErrorState
          message={authError}
          onRetry={retryAuth}
          diagnosticCode={authDiagnosticCode}
        />
      </div>
    );
  }

  if (isAnonymous) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg pb-10">
        <main className="mx-auto max-w-[520px] px-5 pt-2">
          <LoginScreen />
        </main>
      </div>
    );
  }

  if (claimCompleted === null) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg">
        <LoadingState message="Loading Trackdown…" />
      </div>
    );
  }

  if (claimCompleted === false) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg pb-10">
        <main className="mx-auto max-w-[520px] px-5 pt-2">
          <ClaimScreen onDone={loadData} />
        </main>
      </div>
    );
  }

  if (hasAccess === null) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg">
        <LoadingState message="Loading Trackdown…" />
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg pb-10">
        <main className="mx-auto max-w-[520px] px-5 pt-2">
          <PaywallScreen userId={userId as string} onUnlocked={() => setHasAccess(true)} />
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg">
        <ErrorState message={loadError} onRetry={loadData} />
      </div>
    );
  }

  if (shifts === null || playingSessions === null || weeklyRates === null) {
    return (
      <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg">
        <LoadingState message="Loading Trackdown…" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-td-bg pb-[calc(5rem+env(safe-area-inset-bottom))]">
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
            {tab === "pay" && (
              <PayScreen
                shifts={shifts}
                weeklyRates={weeklyRates}
                onWeeklyRatesChange={setWeeklyRates}
                setError={setError}
              />
            )}
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
    <AuthProvider>
      <AppSettingsProvider>
        <DeveloperPreviewProvider>
          <DeveloperPreviewGuard />
          <TrackdownApp />
        </DeveloperPreviewProvider>
      </AppSettingsProvider>
    </AuthProvider>
  );
}
