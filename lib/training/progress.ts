import {
  ACCEPTABLE_ACTION_THRESHOLD,
  ModuleStats,
  PokerAction,
  ScenarioStats,
  TrainingProgress,
} from "./types";

export const TRAINING_PROGRESS_KEY = "trackdown_training_progress_v1";

function emptyModuleStats(): ModuleStats {
  return { attempted: 0, correct: 0, currentStreak: 0, bestStreak: 0 };
}

function emptyScenarioStats(): ScenarioStats {
  return {
    attempted: 0,
    correct: 0,
    acceptable: 0,
    currentStreak: 0,
    bestStreak: 0,
    byPosition: {},
    byTag: {},
  };
}

export function createDefaultProgress(): TrainingProgress {
  return {
    version: 1,
    dealer: {
      completedTipIds: [],
      potCalc: emptyModuleStats(),
      ploCalc: emptyModuleStats(),
    },
    poker: {
      scenarios: emptyScenarioStats(),
      potOdds: emptyModuleStats(),
    },
  };
}

function isModuleStats(value: unknown): value is ModuleStats {
  if (!value || typeof value !== "object") return false;
  const v = value as ModuleStats;
  return (
    typeof v.attempted === "number" &&
    typeof v.correct === "number" &&
    typeof v.currentStreak === "number" &&
    typeof v.bestStreak === "number"
  );
}

function isScenarioStats(value: unknown): value is ScenarioStats {
  if (!isModuleStats(value)) return false;
  const v = value as ScenarioStats;
  return typeof v.acceptable === "number" && typeof v.byPosition === "object" && typeof v.byTag === "object";
}

function isTrainingProgress(value: unknown): value is TrainingProgress {
  if (!value || typeof value !== "object") return false;
  const v = value as TrainingProgress;
  return (
    v.version === 1 &&
    Array.isArray(v.dealer?.completedTipIds) &&
    isModuleStats(v.dealer?.potCalc) &&
    isModuleStats(v.dealer?.ploCalc) &&
    isScenarioStats(v.poker?.scenarios) &&
    isModuleStats(v.poker?.potOdds)
  );
}

export function loadTrainingProgress(): TrainingProgress {
  if (typeof window === "undefined") return createDefaultProgress();
  try {
    const raw = localStorage.getItem(TRAINING_PROGRESS_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as unknown;
    if (!isTrainingProgress(parsed)) return createDefaultProgress();
    return parsed;
  } catch {
    return createDefaultProgress();
  }
}

export function saveTrainingProgress(progress: TrainingProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRAINING_PROGRESS_KEY, JSON.stringify(progress));
}

function applyModuleResult(stats: ModuleStats, correct: boolean): ModuleStats {
  const attempted = stats.attempted + 1;
  const correctCount = stats.correct + (correct ? 1 : 0);
  const currentStreak = correct ? stats.currentStreak + 1 : 0;
  const bestStreak = Math.max(stats.bestStreak, currentStreak);
  return { attempted, correct: correctCount, currentStreak, bestStreak };
}

export function recordPotCalcResult(progress: TrainingProgress, correct: boolean): TrainingProgress {
  return {
    ...progress,
    dealer: {
      ...progress.dealer,
      potCalc: applyModuleResult(progress.dealer.potCalc, correct),
    },
  };
}

export function recordPloCalcResult(progress: TrainingProgress, correct: boolean): TrainingProgress {
  return {
    ...progress,
    dealer: {
      ...progress.dealer,
      ploCalc: applyModuleResult(progress.dealer.ploCalc, correct),
    },
  };
}

export function recordPotOddsResult(progress: TrainingProgress, correct: boolean): TrainingProgress {
  return {
    ...progress,
    poker: {
      ...progress.poker,
      potOdds: applyModuleResult(progress.poker.potOdds, correct),
    },
  };
}

export function toggleTipCompleted(progress: TrainingProgress, tipId: string): TrainingProgress {
  const ids = new Set(progress.dealer.completedTipIds);
  if (ids.has(tipId)) ids.delete(tipId);
  else ids.add(tipId);
  return {
    ...progress,
    dealer: { ...progress.dealer, completedTipIds: [...ids] },
  };
}

export function recordScenarioResult(
  progress: TrainingProgress,
  opts: {
    preferred: boolean;
    acceptable: boolean;
    heroPosition: string;
    tags: string[];
  }
): TrainingProgress {
  const stats = progress.poker.scenarios;
  const attempted = stats.attempted + 1;
  const correct = stats.correct + (opts.preferred ? 1 : 0);
  const acceptable = stats.acceptable + (opts.acceptable ? 1 : 0);
  const currentStreak = opts.preferred ? stats.currentStreak + 1 : 0;
  const bestStreak = Math.max(stats.bestStreak, currentStreak);

  const byPosition = { ...stats.byPosition };
  const pos = byPosition[opts.heroPosition] || { attempted: 0, preferred: 0 };
  byPosition[opts.heroPosition] = {
    attempted: pos.attempted + 1,
    preferred: pos.preferred + (opts.preferred ? 1 : 0),
  };

  const byTag = { ...stats.byTag };
  for (const tag of opts.tags) {
    const t = byTag[tag] || { attempted: 0, preferred: 0 };
    byTag[tag] = {
      attempted: t.attempted + 1,
      preferred: t.preferred + (opts.preferred ? 1 : 0),
    };
  }

  return {
    ...progress,
    poker: {
      ...progress.poker,
      scenarios: {
        attempted,
        correct,
        acceptable,
        currentStreak,
        bestStreak,
        byPosition,
        byTag,
      },
    },
  };
}

export function isActionAcceptable(
  recommended: { action: PokerAction; frequency: number }[],
  chosen: PokerAction
): boolean {
  const match = recommended.find((r) => r.action === chosen);
  return (match?.frequency ?? 0) >= ACCEPTABLE_ACTION_THRESHOLD;
}

export function accuracyPct(stats: ModuleStats): number {
  if (stats.attempted === 0) return 0;
  return Math.round((stats.correct / stats.attempted) * 100);
}

export function scenarioPreferredAccuracy(stats: ScenarioStats): number {
  if (stats.attempted === 0) return 0;
  return Math.round((stats.correct / stats.attempted) * 100);
}

export function scenarioAcceptableAccuracy(stats: ScenarioStats): number {
  if (stats.attempted === 0) return 0;
  return Math.round((stats.acceptable / stats.attempted) * 100);
}
