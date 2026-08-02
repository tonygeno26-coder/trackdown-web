import { BlackjackRules, BlackjackSituation } from "./blackjack";
import { generateSituation } from "./blackjack-hands";
import { getStrategyRecommendation } from "./blackjack-strategy";
import { getPotCalcQuestionById, getPotCalcQuestions, getRandomPotCalcQuestion } from "./dealer-questions";
import { getRandomPloQuestion, getPloCalcQuestions } from "./plo-questions";
import { getRandomPotOddsQuestion, getPotOddsQuestions } from "./pot-odds-questions";
import { getRandomScenario, getScenarioById, getScenariosByDifficulty } from "./poker-scenarios";
import { AdaptiveTopic, PokerTopic } from "./adaptive-types";
import { loadAdaptiveTraining } from "./adaptive-storage";
import { difficultyForTopic, topicsByTier } from "./adaptive-recommendations";
import { mapBlackjackToTopic, mapScenarioToTopic } from "./adaptive-topics";
import {
  CalculationQuestion,
  PloCalculationQuestion,
  PokerScenario,
  PotOddsQuestion,
  Difficulty,
} from "./types";

const SESSION_SIZE = 10;

function pickWeightedTopic(exclude?: AdaptiveTopic): AdaptiveTopic {
  const tiers = topicsByTier();
  const roll = Math.random();
  let pool: AdaptiveTopic[];
  if (roll < 0.6) pool = tiers.weak.length ? tiers.weak : tiers.medium;
  else if (roll < 0.9) pool = tiers.medium.length ? tiers.medium : tiers.weak;
  else pool = tiers.mastered.length ? tiers.mastered : tiers.medium;

  if (pool.length === 0) pool = ["pot_calculations", "preflop", "hard_totals"];
  const filtered = exclude ? pool.filter((t) => t !== exclude) : pool;
  const pick = filtered.length ? filtered : pool;
  return pick[Math.floor(Math.random() * pick.length)];
}

export function buildTopicSessionQueue(focusTopic?: AdaptiveTopic): AdaptiveTopic[] {
  const queue: AdaptiveTopic[] = [];
  if (focusTopic) {
    for (let i = 0; i < 6; i++) queue.push(focusTopic);
    for (let i = 0; i < 3; i++) queue.push(pickWeightedTopic(focusTopic));
    queue.push(pickWeightedTopic(focusTopic));
  } else {
    for (let i = 0; i < SESSION_SIZE; i++) queue.push(pickWeightedTopic());
  }
  return queue.sort(() => Math.random() - 0.5);
}

function unseenIds(): Set<string> {
  return new Set(loadAdaptiveTraining().recentQuestionIds);
}

function pickFromPool<T extends { id: string }>(pool: T[], excludeId?: string): T {
  const seen = unseenIds();
  const unseen = pool.filter((q) => q.id !== excludeId && !seen.has(q.id));
  const candidates = unseen.length ? unseen : pool.filter((q) => q.id !== excludeId);
  const pick = candidates.length ? candidates : pool;
  return pick[Math.floor(Math.random() * pick.length)];
}

export function pickAdaptivePotCalcQuestion(
  topic: AdaptiveTopic = "pot_calculations",
  excludeId?: string
): CalculationQuestion {
  const difficulty = difficultyForTopic(topic);
  const pool = getPotCalcQuestions(difficulty);
  return pickFromPool(pool, excludeId);
}

export function pickAdaptivePloQuestion(
  topic: AdaptiveTopic = "plo_pot_calculations",
  excludeId?: string
): PloCalculationQuestion {
  const difficulty = difficultyForTopic(topic);
  const pool = getPloCalcQuestions(difficulty);
  return pickFromPool(pool, excludeId);
}

export function pickAdaptivePotOddsQuestion(
  topic: AdaptiveTopic = "bet_sizing",
  excludeId?: string
): PotOddsQuestion {
  const difficulty = difficultyForTopic(topic);
  const pool = getPotOddsQuestions(difficulty);
  return pickFromPool(pool, excludeId);
}

export function pickAdaptiveScenario(
  focusTopic?: PokerTopic,
  excludeId?: string
): PokerScenario {
  const difficulty = (focusTopic ? difficultyForTopic(focusTopic) : "intermediate") as Difficulty;
  let pool = getScenariosByDifficulty(difficulty);
  if (focusTopic) {
    const filtered = pool.filter((s) => mapScenarioToTopic(s) === focusTopic);
    if (filtered.length) pool = filtered;
  }
  return pickFromPool(pool, excludeId);
}

export function pickAdaptiveBlackjackSituation(
  rules: BlackjackRules,
  focusTopic?: AdaptiveTopic,
  mistakeQueue: string[] = []
): BlackjackSituation {
  for (let i = 0; i < 40; i++) {
    const sit = generateSituation("random", rules, mistakeQueue);
    const rec = getStrategyRecommendation(sit, rules);
    const topic = mapBlackjackToTopic(rec.category, rec.recommended);
    if (!focusTopic || topic === focusTopic) return sit;
  }
  return generateSituation("random", rules, mistakeQueue);
}

export function scenarioMatchesTopic(scenario: PokerScenario, topic: PokerTopic): boolean {
  return mapScenarioToTopic(scenario) === topic;
}

export function resolvePotCalcById(id: string): CalculationQuestion {
  return getPotCalcQuestionById(id) ?? getRandomPotCalcQuestion("beginner");
}

export function resolveScenarioById(id: string): PokerScenario {
  return getScenarioById(id) ?? getRandomScenario();
}
