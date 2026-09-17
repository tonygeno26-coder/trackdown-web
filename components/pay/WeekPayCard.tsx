"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { WeekPaySummary, formatWeekLabel } from "@/lib/pay";
import { fmtMoney, fmtMoneyPrecise } from "@/lib/blocks";
import { SurfaceCard, MoneyValue, FormField, CurrencyInput } from "@/components/ui";

function StatCell({
  label,
  value,
  valueClass = "text-td-cream",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-td-border/70 bg-td-surface2/50 px-3 py-2.5">
      <span className="text-[10px] uppercase tracking-[1px] text-td-muted">{label}</span>
      <span className={`mt-0.5 block font-mono font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function WeekPayCard({
  week,
  onSaveRate,
}: {
  week: WeekPaySummary;
  onSaveRate: (downRate: number) => Promise<void> | void;
}) {
  const [rateInput, setRateInput] = useState(week.downRate != null ? String(week.downRate) : "");
  const [saving, setSaving] = useState(false);

  const parsed = parseFloat(rateInput);
  const canSave = rateInput.trim() !== "" && !isNaN(parsed) && parsed >= 0;
  const dirty = canSave && parsed !== week.downRate;

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    await onSaveRate(parsed);
    setSaving(false);
  };

  return (
    <SurfaceCard className="px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-td-muted">
          {formatWeekLabel(week.weekStart)}
        </p>
        <MoneyValue amount={fmtMoneyPrecise(week.weekTotal)} positive size="md" />
      </div>

      <FormField label="Down rate ($/down)">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <CurrencyInput value={rateInput} onChange={setRateInput} placeholder="Not posted yet" />
          </div>
          {dirty && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              aria-label="Save down rate"
              className="flex min-h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-td-gradient-red text-td-cream shadow-td-glow-sm hover:shadow-td-glow disabled:opacity-45"
            >
              <Check size={16} />
            </button>
          )}
        </div>
      </FormField>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <StatCell label="Tournament Downs" value={String(week.tournamentDowns)} />
        <StatCell
          label="Tournament Pay"
          value={week.tournamentPay != null ? fmtMoney(week.tournamentPay) : "Rate not posted"}
          valueClass="text-td-goldsoft"
        />
        <StatCell label="Cash Total" value={fmtMoney(week.cashTotal)} valueClass="text-td-goldsoft" />
        <StatCell label="Home Game Total" value={fmtMoney(week.homegameTotal)} valueClass="text-td-goldsoft" />
      </div>
    </SurfaceCard>
  );
}
