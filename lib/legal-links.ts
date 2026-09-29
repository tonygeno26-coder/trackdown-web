const PRODUCTION_ORIGIN =
  process.env.NEXT_PUBLIC_APP_ORIGIN ?? "https://trackdown-web-production.up.railway.app";

export const PRIVACY_POLICY_URL = `${PRODUCTION_ORIGIN}/privacy`;

/** Standard Apple EULA for apps that do not ship a custom Terms of Use. */
export const TERMS_OF_USE_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

export const MANAGE_APPLE_SUBSCRIPTIONS_URL = "https://apps.apple.com/account/subscriptions";
