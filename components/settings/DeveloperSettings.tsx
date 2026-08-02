"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Monitor, Trash2, FlaskConical, Eye, EyeOff, Sparkles } from "lucide-react";
import { AppTab } from "@/components/navigation/BottomNav";
import { Shift, PlayingSession } from "@/lib/types";
import { useAppSettings } from "@/components/settings/AppSettingsContext";
import { useDeveloperPreview, DeveloperPreviewMode } from "@/components/dev/DeveloperPreviewProvider";
import { seedDemoData, clearDemoData, countDemoRecords } from "@/lib/demo-data";
import { supabase } from "@/lib/supabase";
import { APP_VERSION, getBuildIdentifier } from "@/lib/version";
import {
  isDeveloperSolverProPreview,
  setDeveloperSolverProPreview,
} from "@/lib/premium/entitlements";
import { SettingsSection, settingsInputClass } from "@/components/settings/SettingsUi";
import { PrimaryPlayingButton, SecondaryPlayingButton, PlayingCard } from "@/components/playing/PlayingUi";

import { ConfirmSheet } from "@/components/dealing/DealingUi";

export default function DeveloperSettings({
  currentTab,
  shifts,
  playingSessions,
  onReloadData,
}: {
  currentTab: AppTab;
  shifts: Shift[];
  playingSessions: PlayingSession[];
  onReloadData: () => Promise<void>;
}) {
  const {
    settings,
    setDeveloperMode,
    lastFetchAt,
    lastSaveAt,
    lastSupabaseError,
    recordSupabaseError,
  } = useAppSettings();
  const { previewMode, setPreviewMode, clearPreview, isPreviewActive } = useDeveloperPreview();

  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClearDemo, setConfirmClearDemo] = useState(false);
  const [demoCounts, setDemoCounts] = useState({ shifts: 0, sessions: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [solverProPreview, setSolverProPreview] = useState(false);

  useEffect(() => {
    setSolverProPreview(isDeveloperSolverProPreview());
  }, []);

  const activeShift = shifts.find((s) => s.status === "active" && !s.is_demo);
  const activeSession = playingSessions.find((s) => s.status === "active" && !s.is_demo);
  const completedShifts = shifts.filter((s) => s.status === "completed" && !s.is_demo).length;
  const completedSessions = playingSessions.filter((s) => s.status === "completed" && !s.is_demo).length;

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    countDemoRecords().then((res) => {
      if (!res.error) setDemoCounts({ shifts: res.shifts, sessions: res.sessions });
    });
  }, [shifts.length, playingSessions.length]);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("id")
      .limit(1)
      .maybeSingle()
      .then(({ error }) => {
        if (error) {
          setConnectionStatus("error");
          recordSupabaseError(error.message);
        } else {
          setConnectionStatus("connected");
        }
      });
  }, [recordSupabaseError]);

  const runAction = async (label: string, fn: () => Promise<{ error: string | null }>) => {
    setBusy(true);
    setActionMessage(null);
    setActionError(null);
    const { error } = await fn();
    setBusy(false);
    if (error) {
      setActionError(error);
      recordSupabaseError(error);
      return;
    }
    setActionMessage(label);
    await onReloadData();
    const counts = await countDemoRecords();
    if (!counts.error) setDemoCounts({ shifts: counts.shifts, sessions: counts.sessions });
  };

  const previewButtons: { mode: DeveloperPreviewMode; label: string }[] = [
    { mode: "empty", label: "Preview Empty Home" },
    { mode: "dealer", label: "Preview Dealer Cockpit" },
    { mode: "gaming", label: "Preview Gaming Cockpit" },
  ];

  const displayMode =
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
      ? "standalone"
      : "browser";

  return (
    <SettingsSection
      title="Developer"
      description="Testing tools for previewing Home states and managing demo records."
    >
      <div className="flex items-center gap-3 rounded-xl border border-td-border/80 bg-td-surface2/50 px-4 py-3">
        <Image src="/logo-icon.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" aria-hidden />
        <div>
          <p className="text-[13px] font-semibold text-td-cream">Trackdown Developer</p>
          <p className="text-[11px] text-td-muted">Internal tools · v{APP_VERSION}</p>
        </div>
      </div>

      <PlayingCard className="space-y-3 p-4 text-[12.5px]">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">App State</p>
        <DiagRow label="Navigation tab" value={currentTab} />
        <DiagRow label="Active dealer shift" value={activeShift?.id ?? "None"} />
        <DiagRow label="Active gaming session" value={activeSession?.id ?? "None"} />
        <DiagRow label="Completed dealer shifts" value={String(completedShifts)} />
        <DiagRow label="Completed gaming sessions" value={String(completedSessions)} />
        <DiagRow
          label="Supabase connection"
          value={connectionStatus === "checking" ? "Checking…" : connectionStatus}
        />
        <DiagRow label="App version" value={`${APP_VERSION} (${getBuildIdentifier()})`} />
      </PlayingCard>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Test Home States</p>
        {previewButtons.map(({ mode, label }) => (
          <SecondaryPlayingButton
            key={mode}
            type="button"
            disabled={busy}
            onClick={() => {
              setPreviewMode(mode);
              setActionMessage(`Preview set to ${mode}`);
            }}
            className={previewMode === mode ? "border-td-gold/50 text-td-goldsoft" : ""}
          >
            <Eye size={16} /> {label}
          </SecondaryPlayingButton>
        ))}
        {isPreviewActive && (
          <SecondaryPlayingButton type="button" onClick={() => { clearPreview(); setActionMessage("Preview cleared"); }}>
            <EyeOff size={16} /> Clear Preview Override
          </SecondaryPlayingButton>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Premium Preview</p>
        <SecondaryPlayingButton
          type="button"
          onClick={() => {
            const next = !solverProPreview;
            setDeveloperSolverProPreview(next);
            setSolverProPreview(next);
            setActionMessage(next ? "Solver Pro preview unlocked" : "Solver Pro preview disabled");
          }}
          className={solverProPreview ? "border-td-gold/50 text-td-goldsoft" : ""}
        >
          <Sparkles size={16} /> {solverProPreview ? "Disable" : "Preview"} Solver Pro Unlocked
        </SecondaryPlayingButton>
        <p className="text-[11px] text-td-muted">UI-only entitlement override. No payment record created.</p>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Demo Data</p>
        <p className="text-[12px] text-td-muted">
          Demo records: {demoCounts.shifts} shifts, {demoCounts.sessions} sessions
        </p>
        <SecondaryPlayingButton
          type="button"
          disabled={busy}
          onClick={() => runAction("Demo data seeded", seedDemoData)}
        >
          <FlaskConical size={16} /> Seed Demo Data
        </SecondaryPlayingButton>
        <SecondaryPlayingButton
          type="button"
          disabled={busy || demoCounts.shifts + demoCounts.sessions === 0}
          onClick={() => setConfirmClearDemo(true)}
          className="border-td-red/40 text-red-300"
        >
          <Trash2 size={16} /> Clear Demo Data
        </SecondaryPlayingButton>
      </div>

      <PlayingCard className="space-y-2 p-4 text-[12px]">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-td-muted">Diagnostics</p>
        <DiagRow label="Last settings fetch" value={formatTs(lastFetchAt)} />
        <DiagRow label="Last settings save" value={formatTs(lastSaveAt)} />
        <DiagRow label="Last Supabase error" value={lastSupabaseError || "None"} />
        <DiagRow label="Viewport" value={`${viewport.w} × ${viewport.h}`} />
        <DiagRow label="Display mode" value={displayMode} />
        <DiagRow label="Time zone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
      </PlayingCard>

      <SecondaryPlayingButton
        type="button"
        disabled={busy}
        onClick={async () => {
          const ok = await setDeveloperMode(false);
          if (ok) {
            clearPreview();
            setActionMessage("Developer Mode disabled");
          }
        }}
        className="border-td-red/40 text-red-300"
      >
        <Monitor size={16} /> Disable Developer Mode
      </SecondaryPlayingButton>

      {actionMessage && <p className="text-[13px] font-semibold text-td-goldsoft">{actionMessage}</p>}
      {actionError && <p className="text-[13px] text-red-300">{actionError}</p>}

      {confirmClearDemo && (
        <ConfirmSheet
          title="Clear Demo Data?"
          message="This will permanently delete only records marked as demo data. Real shifts and gaming sessions will not be affected."
          confirmLabel="Clear Demo Data"
          busy={busy}
          destructive
          onCancel={() => setConfirmClearDemo(false)}
          onConfirm={async () => {
            await runAction("Demo data cleared", clearDemoData);
            setConfirmClearDemo(false);
          }}
        />
      )}
    </SettingsSection>
  );
}

function DiagRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="text-td-muted">{label}</span>
      <span className="max-w-[55%] truncate text-right font-mono text-td-cream">{value}</span>
    </div>
  );
}

function formatTs(ts: number | null): string {
  if (!ts) return "Never";
  return new Date(ts).toLocaleTimeString();
}
