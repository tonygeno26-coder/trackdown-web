import {
  DealerModuleKey,
  DealerSkillGroup,
  DealerSkillProgress,
  TodaysFocusItem,
} from "./dealer-types";
import { DEALER_MODULE_SKILL } from "./dealer-types";
import { accuracyPct } from "./dealer-progress";

const MODULE_LABELS: Record<DealerModuleKey, string> = {
  tips: "Dealing Tips",
  pot: "Pot Calculation",
  plo: "PLO Pot Calculation",
  "side-pot": "Side Pot Simulator",
  misdeal: "Misdeal Scenarios",
  "tournament-quiz": "Tournament Procedures",
  "cash-quiz": "Cash Game Procedures",
  "board-reading": "Board Reading",
  "hi-lo": "Split Pot / Hi-Lo",
  speed: "Speed Challenges",
};

const MODULE_EST_MINUTES: Record<DealerModuleKey, number> = {
  tips: 5,
  pot: 8,
  plo: 8,
  "side-pot": 10,
  misdeal: 7,
  "tournament-quiz": 12,
  "cash-quiz": 12,
  "board-reading": 10,
  "hi-lo": 10,
  speed: 5,
};

const STALE_DAYS = 7;

interface ModuleScore {
  module: DealerModuleKey;
  accuracy: number;
  attempted: number;
  lastPracticedAt?: string;
  tier: "weak" | "medium" | "mastered" | "unseen";
}

function getModuleProgress(dealer: DealerSkillProgress, module: DealerModuleKey): { attempted: number; correct: number; lastPracticedAt?: string } {
  switch (module) {
    case "pot": return { ...dealer.potCalc, lastPracticedAt: undefined };
    case "plo": return { ...dealer.ploCalc, lastPracticedAt: undefined };
    case "side-pot": return dealer.sidePot;
    case "misdeal": return dealer.misdeal;
    case "tournament-quiz": return dealer.tournamentQuiz;
    case "cash-quiz": return dealer.cashQuiz;
    case "board-reading": return dealer.boardReading;
    case "hi-lo": return dealer.hiLo;
    case "speed": return { attempted: dealer.speed.totalAttempted, correct: dealer.speed.totalCorrect, lastPracticedAt: dealer.speed.lastPracticedAt };
    case "tips": return { attempted: dealer.tips.viewedIds.length, correct: dealer.tips.completedIds.length, lastPracticedAt: undefined };
  }
}

function classifyTier(accuracy: number, attempted: number): ModuleScore["tier"] {
  if (attempted === 0) return "unseen";
  if (attempted < 3) return "weak";
  if (accuracy >= 85) return "mastered";
  if (accuracy >= 60) return "medium";
  return "weak";
}

function daysSince(iso?: string): number {
  if (!iso) return 999;
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

export function scoreDealerModules(dealer: DealerSkillProgress): ModuleScore[] {
  const modules: DealerModuleKey[] = [
    "side-pot", "misdeal", "tournament-quiz", "cash-quiz", "board-reading", "hi-lo", "speed", "pot", "plo", "tips",
  ];
  return modules.map((module) => {
    const p = getModuleProgress(dealer, module);
    const accuracy = accuracyPct({ attempted: p.attempted, correct: p.correct, currentStreak: 0, bestStreak: 0 });
    return { module, accuracy, attempted: p.attempted, lastPracticedAt: p.lastPracticedAt, tier: classifyTier(accuracy, p.attempted) };
  });
}

/** Weighted pick: 50% weak, 25% stale, 15% medium, 10% mastered */
export function pickAdaptiveDealerModule(dealer: DealerSkillProgress): DealerModuleKey {
  const scores = scoreDealerModules(dealer);
  const weak = scores.filter((s) => s.tier === "weak" || s.tier === "unseen");
  const stale = scores.filter((s) => daysSince(s.lastPracticedAt) >= STALE_DAYS && s.attempted > 0);
  const medium = scores.filter((s) => s.tier === "medium");
  const mastered = scores.filter((s) => s.tier === "mastered");

  const roll = Math.random();
  let pool: ModuleScore[];
  if (roll < 0.5 && weak.length) pool = weak;
  else if (roll < 0.75 && stale.length) pool = stale;
  else if (roll < 0.9 && medium.length) pool = medium;
  else if (mastered.length) pool = mastered;
  else pool = scores;

  pool.sort((a, b) => a.accuracy - b.accuracy || a.attempted - b.attempted);
  return pool[0]?.module ?? "side-pot";
}

export function buildTodaysFocus(dealer: DealerSkillProgress): TodaysFocusItem[] {
  const primary = pickAdaptiveDealerModule(dealer);
  const scores = scoreDealerModules(dealer);
  const secondary = scores
    .filter((s) => s.module !== primary && (s.tier === "weak" || daysSince(s.lastPracticedAt) >= STALE_DAYS))
    .sort((a, b) => a.accuracy - b.accuracy)[0];

  const primaryScore = scores.find((s) => s.module === primary)!;
  const items: TodaysFocusItem[] = [{
    module: primary,
    moduleLabel: MODULE_LABELS[primary],
    reason: primaryScore.tier === "unseen" ? "New module to explore" : primaryScore.tier === "weak" ? "Needs improvement" : "Keep sharp",
    estimatedMinutes: MODULE_EST_MINUTES[primary],
    accuracy: primaryScore.accuracy,
    route: primary,
  }];

  if (secondary) {
    items.push({
      module: secondary.module,
      moduleLabel: MODULE_LABELS[secondary.module],
      reason: "Secondary focus",
      estimatedMinutes: MODULE_EST_MINUTES[secondary.module],
      accuracy: secondary.accuracy,
      route: secondary.module,
      secondary: true,
    });
  }
  return items;
}

export function skillGroupStats(dealer: DealerSkillProgress, range: "7d" | "30d" | "all"): Record<DealerSkillGroup, { attempted: number; correct: number; accuracy: number }> {
  const groups: DealerSkillGroup[] = ["math", "procedures", "board_reading", "side_pots", "high_low", "speed", "professional"];
  const result = {} as Record<DealerSkillGroup, { attempted: number; correct: number; accuracy: number }>;
  for (const g of groups) {
    result[g] = { attempted: 0, correct: 0, accuracy: 0 };
  }
  const modules: DealerModuleKey[] = ["pot", "plo", "side-pot", "misdeal", "tournament-quiz", "cash-quiz", "board-reading", "hi-lo", "speed", "tips"];
  for (const m of modules) {
    const g = DEALER_MODULE_SKILL[m];
    const p = getModuleProgress(dealer, m);
    result[g].attempted += p.attempted;
    result[g].correct += p.correct;
  }
  for (const g of groups) {
    result[g].accuracy = result[g].attempted ? Math.round((result[g].correct / result[g].attempted) * 100) : 0;
  }
  return result;
}

export { MODULE_LABELS, MODULE_EST_MINUTES };
