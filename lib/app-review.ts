/** Dedicated App Store Review sign-in account (see lib/auth.ts). */
export const APP_REVIEW_EMAIL = "appreview@trackdownpoker.com";

export function isAppReviewEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === APP_REVIEW_EMAIL;
}

/**
 * During App Review, Apple must be able to locate the subscription from Settings
 * even when the review account is grandfathered in `public.entitlements`.
 */
export function shouldShowSubscriptionPaywallFromSettings(
  email: string | null | undefined,
  grandfathered: boolean
): boolean {
  if (isAppReviewEmail(email)) return true;
  return !grandfathered;
}
