"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { AppSettingsUpdate } from "@/lib/settings";
import { APP_VERSION, getBuildIdentifier } from "@/lib/version";
import { SettingsField, SettingsSection, settingsInputClass } from "@/components/settings/SettingsUi";

const TAP_WINDOW_MS = 4000;
const UNLOCK_TAPS = 7;

export default function AppSettingsSection({
  values,
  onChange,
  onBlurSave,
  onUnlockDeveloperMode,
  unlockMessage,
}: {
  values: AppSettingsUpdate;
  onChange: (updates: AppSettingsUpdate) => void;
  onBlurSave: () => void;
  onUnlockDeveloperMode: () => void;
  unlockMessage: string | null;
}) {
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  const handleVersionTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current > TAP_WINDOW_MS) tapCountRef.current = 0;
    lastTapRef.current = now;
    tapCountRef.current += 1;
    if (tapCountRef.current >= UNLOCK_TAPS) {
      tapCountRef.current = 0;
      onUnlockDeveloperMode();
    }
  };

  return (
    <SettingsSection title="App" description="Currency and app information.">
      <SettingsField label="Currency">
        <select
          className={settingsInputClass}
          value={values.currency_code ?? "USD"}
          onChange={(e) => onChange({ currency_code: e.target.value })}
          onBlur={onBlurSave}
        >
          <option value="USD">USD</option>
        </select>
      </SettingsField>

      <button
        type="button"
        onClick={handleVersionTap}
        className="flex w-full items-center gap-3 rounded-xl border border-td-border/80 bg-td-surface2/50 px-4 py-4 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-td-bg ring-1 ring-td-border/60">
          <Image src="/logo-icon.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-td-cream">About Trackdown</span>
          <span className="mt-0.5 block text-[12px] text-td-muted">
            Version {APP_VERSION} · Build {getBuildIdentifier()}
          </span>
          {unlockMessage && (
            <span className="mt-1 block text-[12px] font-semibold text-td-goldsoft">{unlockMessage}</span>
          )}
        </span>
        <ChevronRight size={16} className="text-td-muted" />
      </button>
    </SettingsSection>
  );
}
