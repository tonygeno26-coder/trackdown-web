import { AdaptiveAttempt, AdaptiveTrainingData } from "./adaptive-types";

export const ADAPTIVE_TRAINING_KEY = "trackdown_adaptive_training_v1";

const MAX_ATTEMPTS = 500;
const MAX_RECENT_QUESTIONS = 120;

export function createDefaultAdaptiveData(): AdaptiveTrainingData {
  return {
    version: 1,
    attempts: [],
    recentQuestionIds: [],
  };
}

function isAdaptiveData(value: unknown): value is AdaptiveTrainingData {
  if (!value || typeof value !== "object") return false;
  const v = value as AdaptiveTrainingData;
  return v.version === 1 && Array.isArray(v.attempts) && Array.isArray(v.recentQuestionIds);
}

export function loadAdaptiveTraining(): AdaptiveTrainingData {
  if (typeof window === "undefined") return createDefaultAdaptiveData();
  try {
    const raw = localStorage.getItem(ADAPTIVE_TRAINING_KEY);
    if (!raw) return createDefaultAdaptiveData();
    const parsed = JSON.parse(raw) as unknown;
    if (!isAdaptiveData(parsed)) return createDefaultAdaptiveData();
    return parsed;
  } catch {
    return createDefaultAdaptiveData();
  }
}

export function saveAdaptiveTraining(data: AdaptiveTrainingData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADAPTIVE_TRAINING_KEY, JSON.stringify(data));
}

export function recordAdaptiveAttempt(attempt: AdaptiveAttempt): AdaptiveTrainingData {
  const data = loadAdaptiveTraining();
  const attempts = [...data.attempts, attempt].slice(-MAX_ATTEMPTS);
  const recentQuestionIds = [...data.recentQuestionIds, attempt.questionId].slice(-MAX_RECENT_QUESTIONS);
  const next = { version: 1 as const, attempts, recentQuestionIds };
  saveAdaptiveTraining(next);
  return next;
}

export function wasQuestionRecentlySeen(questionId: string): boolean {
  return loadAdaptiveTraining().recentQuestionIds.includes(questionId);
}
