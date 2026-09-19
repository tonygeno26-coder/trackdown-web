"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import {
  configurePurchases,
  getMonthlyOffer,
  purchaseMonthly,
  restorePurchases,
  type MonthlyOffer,
} from "@/lib/subscription";
import { AppScreen, SurfaceCard, PrimaryButton, SecondaryButton, LoadingState } from "@/components/ui";
import TrackdownHeader from "@/components/TrackdownHeader";

const FEATURES = [
  "Track every dealer shift, down, and tip",
  "Log poker and table-games sessions",
  "Dealer training, hand review, and Solver Pro",
];

export default function PaywallScreen({ userId, onUnlocked }: { userId: string; onUnlocked: () => void }) {
  const [offer, setOffer] = useState<MonthlyOffer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await configurePurchases(userId);
        const result = await getMonthlyOffer();
        if (!cancelled) {
          if (result) setOffer(result);
          else setLoadError("Subscription options aren't available right now.");
        }
      } catch {
        if (!cancelled) setLoadError("Couldn't load subscription options. Check your connection and try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleStartTrial = async () => {
    if (!offer || purchasing) return;
    setPurchasing(true);
    setActionError(null);
    const result = await purchaseMonthly(offer.pkg);
    setPurchasing(false);
    if (result.success) {
      onUnlocked();
      return;
    }
    if (!result.cancelled) setActionError(result.error);
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    setActionError(null);
    const result = await restorePurchases();
    setRestoring(false);
    if (result.success) {
      onUnlocked();
      return;
    }
    setActionError(result.error);
  };

  return (
    <AppScreen>
      <TrackdownHeader />
      <SurfaceCard className="px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-td-gold/40 bg-td-gold/10 text-td-gold">
          <Sparkles size={22} />
        </div>
        <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
          Try Trackdown Free
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-td-muted">
          7 days free, then {offer?.priceString ?? "$4.99"}/month. Cancel anytime.
        </p>

        <ul className="mx-auto mt-5 max-w-[320px] space-y-2.5 text-left">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-[13px] text-td-cream">
              <Check size={16} className="mt-0.5 shrink-0 text-td-gold" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {actionError && (
          <p role="alert" className="mt-5 text-[12.5px] text-red-300">
            {actionError}
          </p>
        )}

        <div className="mt-6 space-y-2.5">
          {!offer && !loadError ? (
            <LoadingState message="Loading…" />
          ) : (
            <PrimaryButton type="button" disabled={!offer || purchasing} onClick={handleStartTrial}>
              {purchasing ? "Starting Trial…" : "Start Free Trial"}
            </PrimaryButton>
          )}
          {loadError && <p className="text-[12.5px] text-red-300">{loadError}</p>}
          <SecondaryButton type="button" disabled={restoring} onClick={handleRestore}>
            {restoring ? "Restoring…" : "Restore Purchases"}
          </SecondaryButton>
        </div>
      </SurfaceCard>
    </AppScreen>
  );
}
