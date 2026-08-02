"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TrackdownHeader from "@/components/TrackdownHeader";
import { PrimaryButton } from "@/components/ui";
import { useAppSettings } from "@/components/settings/AppSettingsContext";
import { AppSettings, AppSettingsUpdate } from "@/lib/settings";
import DefaultsSettings from "@/components/settings/DefaultsSettings";
import DealingDefaultsSettings from "@/components/settings/DealingDefaultsSettings";
import AppSettingsSection from "@/components/settings/AppSettingsSection";
import DeveloperSettings from "@/components/settings/DeveloperSettings";
import { AppTab } from "@/components/navigation/BottomNav";
import { Shift, PlayingSession } from "@/lib/types";

function settingsToDraft(settings: AppSettings): AppSettingsUpdate {
  return {
    default_location: settings.default_location,
    default_poker_game: settings.default_poker_game,
    default_poker_stakes: settings.default_poker_stakes,
    default_table_game: settings.default_table_game,
    default_table_minimum: settings.default_table_minimum,
    default_tournament_hourly_rate: settings.default_tournament_hourly_rate,
    default_tournament_down_length: settings.default_tournament_down_length,
    default_dealer_shift_type: settings.default_dealer_shift_type,
    currency_code: settings.currency_code,
    developer_mode: settings.developer_mode,
  };
}

export default function SettingsScreen({
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
  const { settings, loading, saving, savedAt, error, saveSettings, setDeveloperMode } = useAppSettings();
  const [draft, setDraft] = useState<AppSettingsUpdate>({});
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);
  const blurSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef<AppSettingsUpdate>({});

  useEffect(() => {
    if (settings) {
      const next = settingsToDraft(settings);
      setDraft(next);
      draftRef.current = next;
    }
  }, [settings]);

  const mergeDraft = useCallback((updates: AppSettingsUpdate) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      draftRef.current = next;
      return next;
    });
  }, []);

  const persistDraft = useCallback(async () => {
    if (!settings || saving) return;
    await saveSettings(draftRef.current);
  }, [settings, saving, saveSettings]);

  const scheduleBlurSave = useCallback(() => {
    if (blurSaveTimer.current) clearTimeout(blurSaveTimer.current);
    blurSaveTimer.current = setTimeout(() => {
      persistDraft();
    }, 350);
  }, [persistDraft]);

  const handleUnlockDeveloperMode = async () => {
    const ok = await setDeveloperMode(true);
    if (ok) {
      setUnlockMessage("Developer Mode unlocked");
      mergeDraft({ developer_mode: true });
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-5 pb-28">
        <TrackdownHeader />
        <p className="text-[14px] text-td-muted">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <TrackdownHeader />

      <DefaultsSettings values={draft} onChange={mergeDraft} onBlurSave={scheduleBlurSave} />
      <DealingDefaultsSettings values={draft} onChange={mergeDraft} onBlurSave={scheduleBlurSave} />
      <AppSettingsSection
        values={draft}
        onChange={mergeDraft}
        onBlurSave={scheduleBlurSave}
        onUnlockDeveloperMode={handleUnlockDeveloperMode}
        unlockMessage={unlockMessage}
      />

      {settings.developer_mode && (
        <DeveloperSettings
          currentTab={currentTab}
          shifts={shifts}
          playingSessions={playingSessions}
          onReloadData={onReloadData}
        />
      )}

      <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 space-y-2">
        {error && (
          <div className="rounded-xl border border-td-red/50 bg-td-red/10 px-4 py-3 text-center text-[13px] text-red-300">
            {error}
          </div>
        )}
        {savedAt && !saving && !error && (
          <div className="rounded-xl border border-td-goldsoft/30 bg-td-goldsoft/10 px-4 py-2.5 text-center text-[13px] text-td-goldsoft">
            Settings saved
          </div>
        )}
        <PrimaryButton type="button" onClick={persistDraft} disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </PrimaryButton>
      </div>
    </div>
  );
}
