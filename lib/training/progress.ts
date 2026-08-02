import {
  ACCEPTABLE_ACTION_THRESHOLD,
  BlackjackStats,
  ModuleStats,
  PokerAction,
  ScenarioStats,
  TrainingProgress,
} from "./types";
import { BlackjackAction, HandCategory } from "./blackjack";
import { DealerSkillProgress, SpeedDrillMode } from "./dealer-types";
import {
  applyProcedureResult,
  createDefaultDealerSkillProgress,
  migrateDealerV2ToV3,
  recordSpeedSession,
} from "./dealer-progress";

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

function emptyBlackjackStats(): BlackjackStats {
  return {
    total: emptyModuleStats(),
    hard: emptyModuleStats(),
    soft: emptyModuleStats(),
    pair: emptyModuleStats(),
    surrender: emptyModuleStats(),
    mistakeQueue: [],
    totalResponseMs: 0,
    responseCount: 0,
    speedBestStreak: 0,
    speedCurrentStreak: 0,
  };
}

export function createDefaultProgress(): TrainingProgress {
  return {
    version: 3,
    dealer: createDefaultDealerSkillProgress(),
    poker: {
      scenarios: emptyScenarioStats(),
      potOdds: emptyModuleStats(),
    },
    blackjack: emptyBlackjackStats(),
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

function isBlackjackStats(value: unknown): value is BlackjackStats {
  if (!value || typeof value !== "object") return false;
  const v = value as BlackjackStats;
  return (
    isModuleStats(v.total) &&
    isModuleStats(v.hard) &&
    isModuleStats(v.soft) &&
    isModuleStats(v.pair) &&
    isModuleStats(v.surrender) &&
    Array.isArray(v.mistakeQueue)
  );
}

function isDealerV2(dealer: unknown): boolean {
  if (!dealer || typeof dealer !== "object") return false;
  const d = dealer as Record<string, unknown>;
  return Array.isArray(d.completedTipIds) && isModuleStats(d.potCalc);
}

function migrateV1ToV2(v1: Record<string, unknown>): TrainingProgress {
  const base = createDefaultProgress();
  const dealer = v1.dealer as Record<string, unknown> | undefined;
  const poker = v1.poker as TrainingProgress["poker"] | undefined;
  if (dealer) base.dealer = migrateDealerV2ToV3(dealer);
  if (poker) base.poker = poker;
  return base;
}

function migrateV2ToV3(v2: Record<string, unknown>): TrainingProgress {
  const base = createDefaultProgress();
  const dealer = v2.dealer as Record<string, unknown> | undefined;
  const poker = v2.poker as TrainingProgress["poker"] | undefined;
  const blackjack = v2.blackjack as TrainingProgress["blackjack"] | undefined;
  if (dealer) base.dealer = migrateDealerV2ToV3(dealer);
  if (poker) base.poker = poker;
  if (blackjack) base.blackjack = blackjack;
  return base;
}

function isTrainingProgress(value: unknown): value is TrainingProgress {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 3 &&
    isModuleStats((v.dealer as DealerSkillProgress)?.potCalc) &&
    isScenarioStats((v.poker as TrainingProgress["poker"])?.scenarios) &&
    isModuleStats((v.poker as TrainingProgress["poker"])?.potOdds) &&
    isBlackjackStats(v.blackjack)
  );
}

export function loadTrainingProgress(): TrainingProgress {
  if (typeof window === "undefined") return createDefaultProgress();
  try {
    const raw = localStorage.getItem(TRAINING_PROGRESS_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return createDefaultProgress();
    const v = parsed as { version?: number };
    if (v.version === 1) return migrateV1ToV2(parsed as Record<string, unknown>);
    if (v.version === 2) return migrateV2ToV3(parsed as Record<string, unknown>);
    if (!isTrainingProgress(parsed)) {
      if (isDealerV2((parsed as Record<string, unknown>).dealer)) {
        return migrateV2ToV3(parsed as Record<string, unknown>);
      }
      return createDefaultProgress();
    }
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

function addTrainingMs(dealer: DealerSkillProgress, ms: number): DealerSkillProgress {
  const today = new Date().toISOString().slice(0, 10);
  const last = dealer.lastTrainingDate?.slice(0, 10);
  let streakDays = dealer.streakDays;
  if (last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streakDays = last === yesterday ? streakDays + 1 : 1;
  }
  return { ...dealer, totalTrainingMs: dealer.totalTrainingMs + ms, lastTrainingDate: today, streakDays };
}

export function recordPotCalcResult(progress: TrainingProgress, correct: boolean, ms = 0): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, potCalc: applyModuleResult(progress.dealer.potCalc, correct) },
      ms
    ),
  };
}

export function recordPloCalcResult(progress: TrainingProgress, correct: boolean, ms = 0): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, ploCalc: applyModuleResult(progress.dealer.ploCalc, correct) },
      ms
    ),
  };
}

export function recordSidePotResult(progress: TrainingProgress, questionId: string, correct: boolean, ms = 0): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, sidePot: applyProcedureResult(progress.dealer.sidePot, questionId, correct) },
      ms
    ),
  };
}

export function recordMisdealResult(progress: TrainingProgress, questionId: string, correct: boolean, ms = 0): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, misdeal: applyProcedureResult(progress.dealer.misdeal, questionId, correct) },
      ms
    ),
  };
}

export function recordTournamentQuizResult(progress: TrainingProgress, questionId: string, correct: boolean, ms = 0): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, tournamentQuiz: applyProcedureResult(progress.dealer.tournamentQuiz, questionId, correct) },
      ms
    ),
  };
}

export function recordCashQuizResult(progress: TrainingProgress, questionId: string, correct: boolean, ms = 0): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, cashQuiz: applyProcedureResult(progress.dealer.cashQuiz, questionId, correct) },
      ms
    ),
  };
}

export function recordBoardReadingResult(progress: TrainingProgress, questionId: string, correct: boolean, ms = 0): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, boardReading: applyProcedureResult(progress.dealer.boardReading, questionId, correct) },
      ms
    ),
  };
}

export function recordHiLoResult(progress: TrainingProgress, questionId: string, correct: boolean, ms = 0): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, hiLo: applyProcedureResult(progress.dealer.hiLo, questionId, correct) },
      ms
    ),
  };
}

export function recordSpeedDrillSession(
  progress: TrainingProgress,
  opts: { correct: number; attempted: number; mode: SpeedDrillMode; ms: number }
): TrainingProgress {
  return {
    ...progress,
    dealer: addTrainingMs(
      { ...progress.dealer, speed: recordSpeedSession(progress.dealer.speed, opts) },
      opts.ms
    ),
  };
}

export function toggleTipCompleted(progress: TrainingProgress, tipId: string): TrainingProgress {
  const ids = new Set(progress.dealer.tips.completedIds);
  if (ids.has(tipId)) ids.delete(tipId);
  else ids.add(tipId);
  return {
    ...progress,
    dealer: {
      ...progress.dealer,
      tips: { ...progress.dealer.tips, completedIds: [...ids] },
    },
  };
}

export function toggleTipSaved(progress: TrainingProgress, tipId: string): TrainingProgress {
  const ids = new Set(progress.dealer.tips.savedIds);
  if (ids.has(tipId)) ids.delete(tipId);
  else ids.add(tipId);
  return {
    ...progress,
    dealer: { ...progress.dealer, tips: { ...progress.dealer.tips, savedIds: [...ids] } },
  };
}

export function markTipViewed(progress: TrainingProgress, tipId: string): TrainingProgress {
  const viewed = new Set(progress.dealer.tips.viewedIds);
  viewed.add(tipId);
  return {
    ...progress,
    dealer: { ...progress.dealer, tips: { ...progress.dealer.tips, viewedIds: [...viewed] } },
  };
}

export function setDailyTip(progress: TrainingProgress, tipId: string): TrainingProgress {
  return {
    ...progress,
    dealer: {
      ...progress.dealer,
      tips: { ...progress.dealer.tips, dailyTipId: tipId, dailyTipDate: new Date().toISOString().slice(0, 10) },
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

export function recordBlackjackResult(
  progress: TrainingProgress,
  opts: {
    correct: boolean;
    category: HandCategory | "surrender";
    situationKey: string;
    responseMs?: number;
    isSpeedMode?: boolean;
  }
): TrainingProgress {
  const bj = progress.blackjack;
  const total = applyModuleResult(bj.total, opts.correct);

  let hard = bj.hard;
  let soft = bj.soft;
  let pair = bj.pair;
  let surrender = bj.surrender;

  if (opts.category === "hard") hard = applyModuleResult(hard, opts.correct);
  if (opts.category === "soft") soft = applyModuleResult(soft, opts.correct);
  if (opts.category === "pair") pair = applyModuleResult(pair, opts.correct);
  if (opts.category === "surrender") surrender = applyModuleResult(surrender, opts.correct);

  let mistakeQueue = [...bj.mistakeQueue];
  if (!opts.correct && !mistakeQueue.includes(opts.situationKey)) {
    mistakeQueue.push(opts.situationKey);
  } else if (opts.correct) {
    mistakeQueue = mistakeQueue.filter((k) => k !== opts.situationKey);
  }

  let speedCurrentStreak = bj.speedCurrentStreak;
  let speedBestStreak = bj.speedBestStreak;
  if (opts.isSpeedMode) {
    speedCurrentStreak = opts.correct ? speedCurrentStreak + 1 : 0;
    speedBestStreak = Math.max(speedBestStreak, speedCurrentStreak);
  }

  const totalResponseMs = bj.totalResponseMs + (opts.responseMs ?? 0);
  const responseCount = bj.responseCount + (opts.responseMs != null ? 1 : 0);

  return {
    ...progress,
    blackjack: {
      total,
      hard,
      soft,
      pair,
      surrender,
      mistakeQueue,
      totalResponseMs,
      responseCount,
      speedCurrentStreak,
      speedBestStreak,
    },
  };
}

export function averageBlackjackResponseMs(stats: BlackjackStats): number {
  if (stats.responseCount === 0) return 0;
  return Math.round(stats.totalResponseMs / stats.responseCount);
}

export function isActionAcceptable(
  recommended: { action: PokerAction; frequency: number }[],
  chosen: PokerAction
): boolean {
  const match = recommended.find((r) => r.action === chosen);
  return (match?.frequency ?? 0) >= ACCEPTABLE_ACTION_THRESHOLD;
}

export function isBlackjackActionCorrect(
  recommended: BlackjackAction,
  alternatives: BlackjackAction[],
  chosen: BlackjackAction
): boolean {
  return chosen === recommended || alternatives.includes(chosen);
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

export function dealerOverallAccuracy(dealer: DealerSkillProgress): number {
  const modules = [
    dealer.potCalc, dealer.ploCalc, dealer.sidePot, dealer.misdeal,
    dealer.tournamentQuiz, dealer.cashQuiz, dealer.boardReading, dealer.hiLo,
  ];
  const attempted = modules.reduce((s, m) => s + m.attempted, 0);
  const correct = modules.reduce((s, m) => s + m.correct, 0);
  return attempted ? Math.round((correct / attempted) * 100) : 0;
}
