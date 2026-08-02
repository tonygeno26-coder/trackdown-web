"use client";

import { AppSettingsUpdate, parseOptionalNumber } from "@/lib/settings";
import { TABLE_GAME_OPTIONS } from "@/lib/gaming";
import { SettingsField, SettingsSection, settingsInputClass } from "@/components/settings/SettingsUi";

export default function DefaultsSettings({
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
      title="Defaults"
      description="Pre-fill common fields when starting a new gaming session."
    >
      <SettingsField label="Default Casino / Location">
        <input
          className={settingsInputClass}
          value={values.default_location ?? ""}
          onChange={(e) => onChange({ default_location: e.target.value })}
          onBlur={onBlurSave}
          placeholder="e.g. Bellagio"
        />
      </SettingsField>

      <SettingsField label="Default Poker Game">
        <input
          className={settingsInputClass}
          value={values.default_poker_game ?? ""}
          onChange={(e) => onChange({ default_poker_game: e.target.value })}
          onBlur={onBlurSave}
          placeholder="e.g. No-Limit Hold'em"
        />
      </SettingsField>

      <SettingsField label="Default Poker Stakes">
        <input
          className={settingsInputClass}
          value={values.default_poker_stakes ?? ""}
          onChange={(e) => onChange({ default_poker_stakes: e.target.value })}
          onBlur={onBlurSave}
          placeholder="e.g. 2/5 NLH"
        />
      </SettingsField>

      <SettingsField label="Default Table Game">
        <select
          className={settingsInputClass}
          value={values.default_table_game ?? ""}
          onChange={(e) => onChange({ default_table_game: e.target.value })}
          onBlur={onBlurSave}
        >
          <option value="">None</option>
          {TABLE_GAME_OPTIONS.map((game) => (
            <option key={game} value={game}>
              {game}
            </option>
          ))}
        </select>
      </SettingsField>

      <SettingsField label="Default Table Minimum">
        <div className="flex items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
          <span className="font-mono text-td-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="flex-1 border-none bg-transparent py-3 pl-1 font-mono text-td-cream focus:outline-none"
            value={values.default_table_minimum ?? ""}
            onChange={(e) =>
              onChange({
                default_table_minimum: parseOptionalNumber(e.target.value),
              })
            }
            onBlur={onBlurSave}
            placeholder="e.g. 25"
          />
        </div>
      </SettingsField>
    </SettingsSection>
  );
}
