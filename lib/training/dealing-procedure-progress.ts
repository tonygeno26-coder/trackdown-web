import {
  allProcedureIds,
  DEALING_PROCEDURES,
  DealingProcedureGame,
} from "./dealing-procedures";

export const DEALING_PROCEDURE_PROGRESS_KEY = "trackdown_dealing_procedures_v1";

/** Map removed game-specific ids to consolidated Dealer Mechanics ids. */
const LEGACY_PROCEDURE_ID_MAP: Record<string, string> = {
  "he-shuffle": "me-shuffle",
  "om-shuffle": "me-shuffle",
  "he-burn-flop": "me-burn",
  "he-burn-turn": "me-burn",
  "he-burn-river": "me-burn",
  "om-burn-board": "me-burn",
  "he-all-in": "me-all-in",
  "om-all-in": "me-all-in",
  "he-side-pots": "me-side-pots",
  "om-side-pots": "me-side-pots",
  "he-muck": "me-muck",
  "he-exposed": "me-exposed",
  "om-exposed": "me-exposed",
  "mx-procedure": "me-floor",
};

function normalizeProcedureId(id: string): string {
  return LEGACY_PROCEDURE_ID_MAP[id] ?? id;
}

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

/** Remap legacy ids, dedupe, and prune unknown ids when procedure content changes */
export function migrateDealingProcedureProgress(): DealingProcedureProgress {
  const valid = new Set(allProcedureIds());
  const current = loadDealingProcedureProgress();
  const reviewedIds = [
    ...new Set(current.reviewedIds.map(normalizeProcedureId).filter((id) => valid.has(id))),
  ];
  const changed =
    reviewedIds.length !== current.reviewedIds.length ||
    reviewedIds.some((id, i) => id !== current.reviewedIds[i]);
  if (!changed) return current;
  const next = { version: 1 as const, reviewedIds };
  saveDealingProcedureProgress(next);
  return next;
}
