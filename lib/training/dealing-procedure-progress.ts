import {
  allProcedureIds,
  DEALING_PROCEDURES,
  DealingProcedureGame,
} from "./dealing-procedures";

export const DEALING_PROCEDURE_PROGRESS_KEY = "trackdown_dealing_procedures_v1";

export interface DealingProcedureProgress {
  version: 1;
  reviewedIds: string[];
}

function createDefault(): DealingProcedureProgress {
  return { version: 1, reviewedIds: [] };
}

export function loadDealingProcedureProgress(): DealingProcedureProgress {
  if (typeof window === "undefined") return createDefault();
  try {
    const raw = localStorage.getItem(DEALING_PROCEDURE_PROGRESS_KEY);
    if (!raw) return createDefault();
    const parsed = JSON.parse(raw) as DealingProcedureProgress;
    if (parsed.version !== 1 || !Array.isArray(parsed.reviewedIds)) return createDefault();
    return parsed;
  } catch {
    return createDefault();
  }
}

export function saveDealingProcedureProgress(progress: DealingProcedureProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEALING_PROCEDURE_PROGRESS_KEY, JSON.stringify(progress));
}

export function toggleProcedureReviewed(id: string): DealingProcedureProgress {
  const current = loadDealingProcedureProgress();
  const reviewed = new Set(current.reviewedIds);
  if (reviewed.has(id)) reviewed.delete(id);
  else reviewed.add(id);
  const next = { version: 1 as const, reviewedIds: [...reviewed] };
  saveDealingProcedureProgress(next);
  return next;
}

export function isProcedureReviewed(id: string, progress?: DealingProcedureProgress): boolean {
  const p = progress ?? loadDealingProcedureProgress();
  return p.reviewedIds.includes(id);
}

export function reviewedCountForGame(
  game: DealingProcedureGame,
  progress?: DealingProcedureProgress
): number {
  const p = progress ?? loadDealingProcedureProgress();
  const ids = new Set(DEALING_PROCEDURES[game].map((i) => i.id));
  return p.reviewedIds.filter((id) => ids.has(id)).length;
}

/** Prune unknown ids when procedure content changes */
export function migrateDealingProcedureProgress(): DealingProcedureProgress {
  const valid = new Set(allProcedureIds());
  const current = loadDealingProcedureProgress();
  const reviewedIds = current.reviewedIds.filter((id) => valid.has(id));
  if (reviewedIds.length === current.reviewedIds.length) return current;
  const next = { version: 1 as const, reviewedIds };
  saveDealingProcedureProgress(next);
  return next;
}
