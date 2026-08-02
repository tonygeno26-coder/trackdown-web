"use client";

import { PREVIEW_PRICING } from "@/lib/premium/types";
import { BottomSheet, SheetFooter, SecondaryButton, SurfaceCard } from "@/components/ui";

export default function PricingPreviewModal({ onClose }: { onClose: () => void }) {
  const tiers = [PREVIEW_PRICING.monthly, PREVIEW_PRICING.annual, PREVIEW_PRICING.lifetime];

  return (
    <BottomSheet
      title="Solver Pro Pricing"
      onClose={onClose}
      footer={
        <SheetFooter>
          <SecondaryButton type="button" onClick={onClose} className="col-span-2">
            Close Preview
          </SecondaryButton>
        </SheetFooter>
      }
    >
      <p className="text-[12px] text-td-muted">Preview pricing — not final. Payments not yet live.</p>

      <div className="mt-4 space-y-3">
        {tiers.map((tier) => (
          <SurfaceCard key={tier.label} className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="font-semibold text-td-cream">{tier.label}</p>
              <p className="text-[11px] text-td-muted">{tier.note}</p>
            </div>
            <p className="font-mono text-[18px] font-bold text-td-goldsoft">{tier.price}</p>
          </SurfaceCard>
        ))}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-td-muted">
        Web billing may use Stripe. iOS may require Apple In-App Purchase. Entitlements will be
        managed independently from payment providers.
      </p>
    </BottomSheet>
  );
}
