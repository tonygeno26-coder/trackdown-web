import { PremiumFeature } from "./types";

const DEV_SOLVER_PRO_KEY = "trackdown_dev_solver_pro_preview";

/** Developer-only UI override — does not create payment records */
export function isDeveloperSolverProPreview(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEV_SOLVER_PRO_KEY) === "true";
}

export function setDeveloperSolverProPreview(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) localStorage.setItem(DEV_SOLVER_PRO_KEY, "true");
  else localStorage.removeItem(DEV_SOLVER_PRO_KEY);
}

function getPurchasedFeatures(): PremiumFeature[] {
  // V1: no real purchases yet. Future: read from Supabase / receipt validation.
  return [];
}

export function hasPremiumFeature(feature: PremiumFeature): boolean {
  if (feature === "solver_pro" && isDeveloperSolverProPreview()) return true;
  return getPurchasedFeatures().includes(feature);
}

export function isSolverProUnlocked(): boolean {
  return hasPremiumFeature("solver_pro");
}
