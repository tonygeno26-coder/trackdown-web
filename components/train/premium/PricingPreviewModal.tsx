"use client";

import { X } from "lucide-react";
import { PREVIEW_PRICING } from "@/lib/premium/types";
import { SecondaryPlayingButton } from "@/components/train/TrainingUi";

export default function PricingPreviewModal({ onClose }: { onClose: () => void }) {
  const tiers = [PREVIEW_PRICING.monthly, PREVIEW_PRICING.annual, PREVIEW_PRICING.lifetime];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] rounded-t-td-lg border border-td-border bg-td-surface px-6 pb-8 pt-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
              Solver Pro Pricing
            </h3>
            <p className="mt-1 text-[12px] text-td-muted">Preview pricing — not final. Payments not yet live.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-td-muted hover:text-td-cream">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className="flex items-center justify-between rounded-xl border border-td-border/80 bg-td-surface2/60 px-4 py-4"
            >
              <div>
                <p className="font-semibold text-td-cream">{tier.label}</p>
                <p className="text-[11px] text-td-muted">{tier.note}</p>
              </div>
              <p className="font-mono text-[18px] font-bold text-td-goldsoft">{tier.price}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-td-muted">
          Web billing may use Stripe. iOS may require Apple In-App Purchase. Entitlements will be
          managed independently from payment providers.
        </p>

        <SecondaryPlayingButton type="button" onClick={onClose} className="mt-5">
          Close Preview
        </SecondaryPlayingButton>
      </div>
    </div>
  );
}
