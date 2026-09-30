"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { SettingsSection } from "@/components/settings/SettingsUi";
import PaywallScreen from "@/components/paywall/PaywallScreen";
import { useAuth } from "@/components/auth/AuthProvider";
import { isGrandfathered } from "@/lib/entitlements";
import { shouldShowSubscriptionPaywallFromSettings } from "@/lib/app-review";
import { configurePurchases, hasActiveProEntitlement } from "@/lib/subscription";
import { MANAGE_APPLE_SUBSCRIPTIONS_URL } from "@/lib/legal-links";

type ProView = "closed" | "loading" | "included" | "subscribed" | "paywall";

export default function TrackdownProSection() {
  const { userId, email } = useAuth();
  const [view, setView] = useState<ProView>("closed");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (view !== "loading" || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const grandfathered = await isGrandfathered(userId);
        if (shouldShowSubscriptionPaywallFromSettings(email, grandfathered)) {
          await configurePurchases(userId);
          const active = await hasActiveProEntitlement();
          if (!cancelled) setView(active ? "subscribed" : "paywall");
          return;
        }
        if (!cancelled) setView("included");
      } catch {
        if (!cancelled) {
          setLoadError("Could not load Trackdown Pro status.");
          setView("closed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, userId, email]);

  const openPro = () => {
    setLoadError(null);
    setView("loading");
  };

  return (
    <>
      <SettingsSection title="Subscription">
        <button
          type="button"
          onClick={openPro}
          className="flex w-full items-center justify-between rounded-xl border border-td-border bg-td-bg/60 px-4 py-3.5 text-left transition-colors hover:border-td-gold/40"
        >
          <span className="flex items-center gap-2.5 text-[15px] font-medium text-td-cream">
            <Sparkles size={18} className="text-td-gold" />
            Trackdown Pro
          </span>
          <ChevronRight size={18} className="text-td-muted" />
        </button>
        {loadError && (
          <p role="alert" className="text-[12.5px] text-red-300">
            {loadError}
          </p>
        )}
      </SettingsSection>

      {view !== "closed" && view !== "loading" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-td-bg px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="mx-auto w-full max-w-[520px] flex-1 overflow-y-auto">
            {view === "included" && (
              <div className="space-y-4 py-4">
                <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
                  Trackdown Pro Included
                </h2>
                <p className="text-[13.5px] leading-relaxed text-td-muted">
                  Your account includes Trackdown Pro access (beta / complimentary entitlement). No
                  subscription purchase is required for this account.
                </p>
                <button
                  type="button"
                  onClick={() => setView("closed")}
                  className="text-[13px] text-td-gold underline"
                >
                  Close
                </button>
              </div>
            )}

            {view === "subscribed" && (
              <div className="space-y-4 py-4">
                <h2 className="font-display text-lg font-bold uppercase tracking-[1px] text-td-cream">
                  Trackdown Pro Active
                </h2>
                <p className="text-[13.5px] leading-relaxed text-td-muted">
                  Your Trackdown Pro Monthly subscription is active on this Apple ID.
                </p>
                <a
                  href={MANAGE_APPLE_SUBSCRIPTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[13px] text-td-gold underline"
                >
                  Manage Apple Subscription
                </a>
                <button
                  type="button"
                  onClick={() => setView("closed")}
                  className="block text-[13px] text-td-gold underline"
                >
                  Close
                </button>
              </div>
            )}

            {view === "paywall" && userId && (
              <div className="relative py-2">
                <button
                  type="button"
                  onClick={() => setView("closed")}
                  className="mb-2 text-[13px] text-td-gold underline"
                >
                  Close
                </button>
                <PaywallScreen userId={userId} onUnlocked={() => setView("subscribed")} />
              </div>
            )}
          </div>
        </div>
      )}

      {view === "loading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-td-bg/90">
          <p className="text-[14px] text-td-muted">Loading Trackdown Pro…</p>
        </div>
      )}
    </>
  );
}
