import {
  DealerSkillProgress,
  ProcedureProgress,
  SpeedDrillProgress,
  TipLibraryProgress,
} from "./dealer-types";
import { ModuleStats } from "./types";

export const TRAINING_PROGRESS_KEY = "trackdown_training_progress_v1";

function emptyModuleStats(): ModuleStats {
  return { attempted: 0, correct: 0, currentStreak: 0, bestStreak: 0 };
}

function emptyProcedureProgress(): ProcedureProgress {
  return {
    ...emptyModuleStats(),
    byQuestionId: {},
    mistakeQueue: [],
  };
}

function emptySpeedProgress(): SpeedDrillProgress {
  return { totalSessions: 0, totalCorrect: 0, totalAttempted: 0, personalBests: [] };
}

function emptyTipProgress(): TipLibraryProgress {
  return { completedIds: [], viewedIds: [], savedIds: [] };
}

export function createDefaultDealerSkillProgress(): DealerSkillProgress {
  return {
    potCalc: emptyModuleStats(),
    ploCalc: emptyModuleStats(),
    sidePot: emptyProcedureProgress(),
    misdeal: emptyProcedureProgress(),
    tournamentQuiz: emptyProcedureProgress(),
    cashQuiz: emptyProcedureProgress(),
    boardReading: emptyProcedureProgress(),
    hiLo: emptyProcedureProgress(),
    speed: emptySpeedProgress(),
    tips: emptyTipProgress(),
    totalTrainingMs: 0,
    streakDays: 0,
  };
}

export function applyProcedureResult(
  progress: ProcedureProgress,
  questionId: string,
  correct: boolean
): ProcedureProgress {
  const attempted = progress.attempted + 1;
  const correctCount = progress.correct + (correct ? 1 : 0);
  const currentStreak = correct ? progress.currentStreak + 1 : 0;
  const bestStreak = Math.max(progress.bestStreak, currentStreak);
  const byQuestionId = { ...progress.byQuestionId };
  const prev = byQuestionId[questionId] ?? { attempted: 0, correct: 0 };
  byQuestionId[questionId] = {
    attempted: prev.attempted + 1,
    correct: prev.correct + (correct ? 1 : 0),
    lastAt: new Date().toISOString(),
  };
  let mistakeQueue = [...progress.mistakeQueue];
  if (!correct && !mistakeQueue.includes(questionId)) mistakeQueue.push(questionId);
  else if (correct) mistakeQueue = mistakeQueue.filter((id) => id !== questionId);
  return {
    attempted,
    correct: correctCount,
    currentStreak,
    bestStreak,
    byQuestionId,
    mistakeQueue,
    lastPracticedAt: new Date().toISOString(),
  };
}

export function recordSpeedSession(
  progress: SpeedDrillProgress,
  opts: { correct: number; attempted: number; mode: import("./dealer-types").SpeedDrillMode }
): SpeedDrillProgress {
  const personalBests = [...progress.personalBests];
  const existing = personalBests.find((b) => b.mode === opts.mode);
  const score = opts.correct;
  if (!existing || score > existing.score) {
    const filtered = personalBests.filter((b) => b.mode !== opts.mode);
    filtered.push({ mode: opts.mode, score, at: new Date().toISOString() });
    return {
      totalSessions: progress.totalSessions + 1,
      totalCorrect: progress.totalCorrect + opts.correct,
      totalAttempted: progress.totalAttempted + opts.attempted,
      personalBests: filtered,
      lastPracticedAt: new Date().toISOString(),
    };
  }
  return {
    ...progress,
    totalSessions: progress.totalSessions + 1,
    totalCorrect: progress.totalCorrect + opts.correct,
    totalAttempted: progress.totalAttempted + opts.attempted,
    lastPracticedAt: new Date().toISOString(),
  };
}

export function accuracyPct(stats: ModuleStats | ProcedureProgress): number {
  if (stats.attempted === 0) return 0;
  return Math.round((stats.correct / stats.attempted) * 100);
}

export function migrateDealerV2ToV3(dealer: Record<string, unknown>): DealerSkillProgress {
  const base = createDefaultDealerSkillProgress();
  if (Array.isArray(dealer.completedTipIds)) {
    base.tips.completedIds = dealer.completedTipIds as string[];
  }
  const potCalc = dealer.potCalc as ModuleStats | undefined;
  const ploCalc = dealer.ploCalc as ModuleStats | undefined;
  if (potCalc) base.potCalc = potCalc;
  if (ploCalc) base.ploCalc = ploCalc;
  return base;
}

export function isDealerSkillProgress(value: unknown): value is DealerSkillProgress {
  if (!value || typeof value !== "object") return false;
  const v = value as DealerSkillProgress;
  return (
    typeof v.totalTrainingMs === "number" &&
    Array.isArray(v.tips?.completedIds) &&
    typeof v.potCalc?.attempted === "number"
  );
}
