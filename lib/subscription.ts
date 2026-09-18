import { Purchases, PURCHASES_ERROR_CODE, type PurchasesPackage } from "@revenuecat/purchases-capacitor";

const REVENUECAT_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ?? "";

/**
 * The entitlement identifier configured in the RevenueCat dashboard. Kept
 * generic ("pro") rather than tied to a specific plan name so additional
 * tiers can grant the same entitlement later without an app update — a
 * future higher tier would just also map to "pro" (plus its own additional
 * entitlement, if it unlocks something extra).
 */
const PRO_ENTITLEMENT_ID = process.env.NEXT_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "pro";

let configured = false;

/** No-ops if the API key isn't set (e.g. local dev without RevenueCat configured) or if already configured this session. */
export async function configurePurchases(appUserId: string): Promise<void> {
  if (!REVENUECAT_API_KEY || configured) return;
  await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: appUserId });
  configured = true;
}

/** True if the current user has an active "pro" entitlement — including an active free trial. */
export async function hasActiveProEntitlement(): Promise<boolean> {
  if (!REVENUECAT_API_KEY) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
  } catch {
    return false;
  }
}

export interface MonthlyOffer {
  pkg: PurchasesPackage;
  priceString: string;
}

/** The package to purchase for the paywall's single offer, plus its display price. */
export async function getMonthlyOffer(): Promise<MonthlyOffer | null> {
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) return null;
  const pkg =
    current.monthly ??
    current.availablePackages.find((p: PurchasesPackage) => p.packageType === "MONTHLY") ??
    current.availablePackages[0];
  if (!pkg) return null;
  return { pkg, priceString: pkg.product.priceString };
}

export interface PurchaseOutcome {
  success: boolean;
  cancelled: boolean;
  error: string | null;
}

export async function purchaseMonthly(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return { success: Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]), cancelled: false, error: null };
  } catch (e) {
    const err = e as { code?: PURCHASES_ERROR_CODE; message?: string };
    if (err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, cancelled: true, error: null };
    }
    return { success: false, cancelled: false, error: err.message ?? "Purchase failed." };
  }
}

export async function restorePurchases(): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const success = Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
    return {
      success,
      cancelled: false,
      error: success ? null : "No active subscription was found for this account.",
    };
  } catch (e) {
    const err = e as { message?: string };
    return { success: false, cancelled: false, error: err.message ?? "Restore failed." };
  }
}
