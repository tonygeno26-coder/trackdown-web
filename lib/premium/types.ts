export type PremiumFeature = "solver_pro";

export interface PremiumEntitlementState {
  /** Real purchase entitlements — populated when billing is connected */
  purchased: PremiumFeature[];
}

export const PREVIEW_PRICING = {
  monthly: { label: "Monthly", price: "$9.99", note: "Preview pricing" },
  annual: { label: "Annual", price: "$79.99", note: "Preview pricing" },
  lifetime: { label: "Lifetime", price: "$149.99", note: "Preview pricing" },
} as const;

/**
 * Future billing notes (not implemented):
 * - Web: Stripe Checkout / Customer Portal for entitlements
 * - iOS: Apple In-App Purchase with receipt validation
 * Keep entitlement checks in lib/premium/entitlements.ts — never in UI components directly.
 */
