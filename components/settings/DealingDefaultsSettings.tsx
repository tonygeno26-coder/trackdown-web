"use client";

import { ShiftType } from "@/lib/types";
import { AppSettingsUpdate, parseOptionalNumber } from "@/lib/settings";
import { SettingsField, SettingsSection, settingsInputClass } from "@/components/settings/SettingsUi";

const SHIFT_TYPES: { key: ShiftType; label: string }[] = [
  { key: "tournament", label: "Tournament" },
  { key: "cash", label: "Cash" },
  { key: "homegame", label: "Home Game" },
];

export default function DealingDefaultsSettings({
  values,
  onChange,
  onBlurSave,
}: {
  values: AppSettingsUpdate;
  onChange: (updates: AppSettingsUpdate) => void;
  onBlurSave: () => void;
}) {
  return (
    <SettingsSection
      title="Dealing Defaults"
      description="Pre-fill dealer shift options. Cash and home-game downs remain 30 minutes."
    >
      <SettingsField label="Default Dealer Shift Type">
        <div className="grid grid-cols-3 gap-2">
          {SHIFT_TYPES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange({
                  default_dealer_shift_type:
                    values.default_dealer_shift_type === key ? null : key,
                });
                onBlurSave();
              }}
              className={`rounded-xl border px-2 py-3 text-[12px] font-semibold ${
                values.default_dealer_shift_type === key
                  ? "border-td-gold bg-td-gold/10 text-td-goldsoft"
                  : "border-td-border bg-td-surface2 text-td-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingsField>

      <SettingsField label="Default Tournament Down Length">
        <div className="grid grid-cols-2 gap-2">
          {[30, 40].map((len) => (
            <button
              key={len}
              type="button"
              onClick={() => {
                onChange({
                  default_tournament_down_length:
                    values.default_tournament_down_length === len ? null : (len as 30 | 40),
                });
                onBlurSave();
              }}
              className={`rounded-xl border px-2 py-3 text-[13px] font-semibold ${
                values.default_tournament_down_length === len
                  ? "border-td-gold bg-td-gold/10 text-td-goldsoft"
                  : "border-td-border bg-td-surface2 text-td-muted"
              }`}
            >
              {len} minutes
            </button>
          ))}
        </div>
      </SettingsField>

      <SettingsField
        label="Default Tournament Hourly Rate"
        hint="Optional. Used to pre-fill tournament shifts only."
      >
        <div className="flex items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
          <span className="font-mono text-td-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="flex-1 border-none bg-transparent py-3 pl-1 font-mono text-td-cream focus:outline-none"
            value={
              values.default_tournament_hourly_rate == null
                ? ""
                : String(values.default_tournament_hourly_rate)
            }
            onChange={(e) =>
              onChange({
                default_tournament_hourly_rate: parseOptionalNumber(e.target.value),
              })
            }
            onBlur={onBlurSave}
            placeholder="e.g. 35.00"
          />
          <span className="text-[12px] text-td-muted">/hr</span>
        </div>
      </SettingsField>
    </SettingsSection>
  );
}
