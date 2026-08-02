export const APP_VERSION = "0.1.0";

export function getBuildIdentifier(): string {
  return process.env.NEXT_PUBLIC_COMMIT_SHA || "local-dev";
}
