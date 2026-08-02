import { PlayingSession } from "./types";
import { netResult } from "./playing";

export type GamingCategory = "poker" | "table_games" | "slots" | "sports_betting" | "other";

export const TABLE_GAME_OPTIONS = [
  "Blackjack",
  "Craps",
  "Baccarat",
  "Roulette",
  "Pai Gow",
  "Ultimate Texas Hold'em",
  "Three Card Poker",
  "Mississippi Stud",
  "Let It Ride",
  "Casino War",
  "Other",
] as const;

export type GamingHistoryFilter =
  | "all"
  | "poker"
  | "table_games"
  | "slots"
  | "sports_betting"
  | "wins"
  | "losses";

const CATEGORY_VALUES: GamingCategory[] = [
  "poker",
  "table_games",
  "slots",
  "sports_betting",
  "other",
];

export function getGamingCategory(session: Pick<PlayingSession, "title">): GamingCategory {
  if (CATEGORY_VALUES.includes(session.title as GamingCategory)) {
    return session.title as GamingCategory;
  }
  return "poker";
}

export function gamingCategoryLabel(category: GamingCategory): string {
  switch (category) {
    case "poker":
      return "Poker";
    case "table_games":
      return "Table Games";
    case "slots":
      return "Slots";
    case "sports_betting":
      return "Sports Betting";
    default:
      return "Other";
  }
}

export function stakesOrMinimumLabel(session: Pick<PlayingSession, "title">): string {
  const category = getGamingCategory(session);
  return category === "table_games" ? "Table Minimum" : "Stakes";
}

export function sessionCategoryLabel(session: PlayingSession): string {
  const category = getGamingCategory(session);
  if (category === "poker") {
    return session.session_type === "tournament" ? "Poker · Tournament" : "Poker · Cash Game";
  }
  return gamingCategoryLabel(category);
}

export function filterGamingSessions(
  sessions: PlayingSession[],
  filter: GamingHistoryFilter
): PlayingSession[] {
  return sessions.filter((s) => {
    const category = getGamingCategory(s);
    if (filter === "poker" && category !== "poker") return false;
    if (filter === "table_games" && category !== "table_games") return false;
    if (filter === "slots" && category !== "slots") return false;
    if (filter === "sports_betting" && category !== "sports_betting") return false;
    if (filter === "wins" || filter === "losses") {
      const net = netResult(s);
      if (filter === "wins" && (net == null || net <= 0)) return false;
      if (filter === "losses" && (net == null || net >= 0)) return false;
    }
    return true;
  });
}
