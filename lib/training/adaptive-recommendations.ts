import {
  AdaptiveAttempt,
  AdaptiveDashboard,
  AdaptiveTopic,
  FocusRecommendation,
  TopicStats,
  TopicTier,
  TrainingArea,
} from "./adaptive-types";
import {
  allTopics,
  AREA_LABELS,
  FOCUS_TRAINABLE,
  TOPIC_LABELS,
  topicArea,
  trainerRouteForTopic,
} from "./adaptive-topics";
import { loadAdaptiveTraining } from "./adaptive-storage";

const MIN_ATTEMPTS_FOR_TIER = 3;
const MASTERED_ACCURACY = 85;
const WEAK_ACCURACY = 60;

function streaks(attempts: AdaptiveAttempt[]): { current: number; best: number } {
  let current = 0;
  let best = 0;
  for (const a of attempts) {
    if (a.correct) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return { current, best };
}

function computeConfidence(accuracy: number, attempted: number, avgResponseMs: number): number {
  const volume = Math.min(1, attempted / 12);
  const speedFactor = avgResponseMs <= 0 ? 1 : Math.max(0.6, 1 - avgResponseMs / 30000);
  return Math.round(accuracy * volume * speedFactor);
}

function classifyTier(accuracy: number, attempted: number): TopicTier {
  if (attempted < MIN_ATTEMPTS_FOR_TIER) return "weak";
  if (accuracy >= MASTERED_ACCURACY) return "mastered";
  if (accuracy >= WEAK_ACCURACY) return "medium";
  return "weak";
}

function recentTrend(attempts: AdaptiveAttempt[]): number {
  if (attempts.length < 4) return 0;
  const recent = attempts.slice(-5);
  const older = attempts.slice(-10, -5);
  if (older.length === 0) return 0;
  const recentAcc = recent.filter((a) => a.correct).length / recent.length;
  const olderAcc = older.filter((a) => a.correct).length / older.length;
  return Math.round((recentAcc - olderAcc) * 100);
}

export function computeTopicStats(topic: AdaptiveTopic, attempts: AdaptiveAttempt[]): TopicStats {
  const topicAttempts = attempts.filter((a) => a.topic === topic);
  const attempted = topicAttempts.length;
  const correct = topicAttempts.filter((a) => a.correct).length;
  const accuracy = attempted === 0 ? 0 : Math.round((correct / attempted) * 100);
  const avgResponseMs =
    attempted === 0
      ? 0
      : Math.round(topicAttempts.reduce((s, a) => s + a.responseMs, 0) / attempted);
  const { current, best } = streaks(topicAttempts);
  const area = topicArea(topic);

  return {
    topic,
    area,
    label: TOPIC_LABELS[topic],
    attempted,
    correct,
    accuracy,
    avgResponseMs,
    currentStreak: current,
    bestStreak: best,
    confidence: computeConfidence(accuracy, attempted, avgResponseMs),
    tier: classifyTier(accuracy, attempted),
    recentTrend: recentTrend(topicAttempts),
  };
}

export function getAllTopicStats(): TopicStats[] {
  const { attempts } = loadAdaptiveTraining();
  return allTopics().map((t) => computeTopicStats(t, attempts));
}

function pickFocusForArea(area: TrainingArea, stats: TopicStats[]): FocusRecommendation {
  const trainable = FOCUS_TRAINABLE[area];
  const candidates = stats.filter((s) => trainable.includes(s.topic));
  const sorted = [...candidates].sort((a, b) => {
    if (a.attempted === 0 && b.attempted === 0) return 0;
    if (a.attempted === 0) return -1;
    if (b.attempted === 0) return 1;
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return a.confidence - b.confidence;
  });
  const pick = sorted[0] ?? {
    topic: trainable[0],
    accuracy: 0,
  };
  const topic = pick.topic as AdaptiveTopic;
  return {
    area,
    areaLabel: AREA_LABELS[area],
    topic,
    topicLabel: TOPIC_LABELS[topic],
    accuracy: pick.accuracy ?? 0,
    trainerRoute: trainerRouteForTopic(topic),
  };
}

export function buildAdaptiveDashboard(): AdaptiveDashboard {
  const stats = getAllTopicStats();
  const todaysFocus: FocusRecommendation[] = (["dealer", "poker", "blackjack"] as TrainingArea[]).map(
    (area) => pickFocusForArea(area, stats)
  );

  const withAttempts = stats.filter((s) => s.attempted >= MIN_ATTEMPTS_FOR_TIER);

  const recentlyImproved = [...withAttempts]
    .filter((s) => s.recentTrend >= 10)
    .sort((a, b) => b.recentTrend - a.recentTrend)
    .slice(0, 5);

  const needsAttention = [...withAttempts]
    .filter((s) => s.tier === "weak" || s.accuracy < WEAK_ACCURACY)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const masteredSkills = [...withAttempts]
    .filter((s) => s.tier === "mastered")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  return { todaysFocus, recentlyImproved, needsAttention, masteredSkills };
}

export function topicsByTier(): Record<TopicTier, AdaptiveTopic[]> {
  const stats = getAllTopicStats();
  return {
    weak: stats.filter((s) => s.tier === "weak").map((s) => s.topic),
    medium: stats.filter((s) => s.tier === "medium").map((s) => s.topic),
    mastered: stats.filter((s) => s.tier === "mastered").map((s) => s.topic),
  };
}

export function difficultyForTopic(topic: AdaptiveTopic): string {
  const stats = computeTopicStats(topic, loadAdaptiveTraining().attempts);
  if (stats.attempted < 2) return "beginner";
  if (stats.accuracy >= 80) return "advanced";
  if (stats.accuracy >= 55) return "intermediate";
  return "beginner";
}
