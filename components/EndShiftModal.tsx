"use client";

import { useState } from "react";
import { Shift } from "@/lib/types";
import { fmtMoney, netTips } from "@/lib/blocks";
import { DealingBottomSheet } from "@/components/dealing/DealingUi";
import {
  FormField,
  CurrencyInput,
  SheetFooter,
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  SurfaceCard,
} from "@/components/ui";

export default function EndShiftModal({
  shift,
  grossTotal,
  onCancel,
  onConfirm,
}: {
  shift: Shift;
  grossTotal: number;
  onCancel: () => void;
  onConfirm: (settledStatus: "yes" | "no" | "partial" | null, settledAmount: number | null) => boolean | Promise<boolean>;
}) {
  const isHomegame = shift.type === "homegame";
  const netOwed = isHomegame && shift.house_tax_pct > 0 ? netTips(grossTotal, shift.house_tax_pct) : grossTotal;
  const [choice, setChoice] = useState<"yes" | "no" | "partial" | null>(null);
  const [partialAmount, setPartialAmount] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (!isHomegame) {
    return (
      <DealingBottomSheet
        title="End This Shift?"
        onClose={onCancel}
        destructive
        footer={
          <SheetFooter>
            <SecondaryButton type="button" onClick={onCancel} disabled={confirming}>
              Cancel
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={confirming}
              onClick={async () => {
                setConfirming(true);
                const ok = await Promise.resolve(onConfirm(null, null));
                if (!ok) setConfirming(false);
              }}
            >
              {confirming ? "Ending…" : "End Shift"}
            </DestructiveButton>
          </SheetFooter>
        }
      >
        <p className="text-[14px] leading-relaxed text-td-muted">
          Unlogged downs will be left blank and the shift moves to History.
        </p>
      </DealingBottomSheet>
    );
  }

  const canConfirm = choice === "yes" || choice === "no" || (choice === "partial" && parseFloat(partialAmount) > 0);

  return (
    <DealingBottomSheet
      title="End This Shift?"
      onClose={onCancel}
      footer={
        <SheetFooter>
          <SecondaryButton type="button" onClick={onCancel} disabled={confirming}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={!canConfirm || confirming}
            onClick={async () => {
              setConfirming(true);
              const ok = await Promise.resolve(
                onConfirm(choice, choice === "partial" ? parseFloat(partialAmount) || 0 : null)
              );
              if (!ok) setConfirming(false);
            }}
          >
            {confirming ? "Confirming…" : "Confirm & End Shift"}
          </PrimaryButton>
        </SheetFooter>
      }
    >
      <SurfaceCard className="px-4 py-3.5 text-center">
        <span className="block text-[11.5px] uppercase tracking-wide text-td-muted">Total owed</span>
        <span className="block font-mono text-3xl font-semibold text-td-goldsoft">{fmtMoney(netOwed)}</span>
        {shift.house_tax_pct > 0 && (
          <span className="mt-1 block text-[11px] text-td-muted">
            {fmtMoney(grossTotal)} gross · {shift.house_tax_pct}% house cut
          </span>
        )}
      </SurfaceCard>

      <p className="mt-4 text-[14px] text-td-muted">Settled?</p>
      <div className="mt-2 flex gap-2">
        {(["yes", "no", "partial"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setChoice(opt)}
            className={`min-h-[44px] flex-1 rounded-xl border py-3 text-[13px] font-bold capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60 ${
              choice === opt
                ? "border-td-gold bg-td-gold/10 text-td-goldsoft"
                : "border-td-border bg-td-surface2 text-td-cream hover:border-td-gold/40"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {choice === "partial" && (
        <div className="mt-4">
          <FormField label="Amount actually paid">
            <CurrencyInput
              value={partialAmount}
              onChange={setPartialAmount}
              autoFocus
              placeholder="0"
            />
          </FormField>
        </div>
      )}
    </DealingBottomSheet>
  );
}
