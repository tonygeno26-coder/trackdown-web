import { PokerAction } from "@/lib/training/types";
import { HandStreet, SavedHand, StreetSegment } from "./types";

export interface ReplayDecisionPoint {
  street: HandStreet;
  board: string;
  actionIndex: number;
  prompt: string;
  availableActions: PokerAction[];
  recommended: PokerAction;
  explanation: string;
  factors: string[];
}

export interface ReplayStepResult {
  userAction: PokerAction;
  recommended: PokerAction;
  isPreferred: boolean;
  explanation: string;
  factors: string[];
}

function boardAtStreet(hand: SavedHand, street: HandStreet): string {
  const cards = hand.board_cards.trim();
  if (!cards || cards === "—") return "—";
  const parts = cards.split(/[\s,]+/).filter(Boolean);
  switch (street) {
    case "preflop":
      return "—";
    case "flop":
      return parts.slice(0, 3).join(" ") || "—";
    case "turn":
      return parts.slice(0, 4).join(" ") || "—";
    case "river":
      return parts.join(" ") || "—";
  }
}

function heuristicRecommendation(
  street: HandStreet,
  action: PokerAction,
  hand: SavedHand
): { recommended: PokerAction; explanation: string; factors: string[] } {
  const pos = hand.hero_position;
  const stack = hand.effective_stack || "100bb";
  const factors: string[] = [];

  if (pos === "BTN" || pos === "CO") factors.push("In position — wider continuing and betting ranges");
  if (pos === "SB" || pos === "BB") factors.push("Out of position — tighter defense and more check-calls");

  if (stack.includes("25") || stack.includes("30") || stack.includes("40")) {
    factors.push("Shorter stack depth — favor commit-or-fold lines over small floats");
  } else {
    factors.push("Deep stack depth — implied odds and multi-street bluffs more viable");
  }

  if (street === "preflop") {
    factors.push("Preflop: prioritize position and hand strength vs open/3-bet ranges");
    const rec: PokerAction = action === "fold" ? "fold" : action === "raise" ? "raise" : "call";
    return {
      recommended: rec,
      explanation: `At ${hand.stakes} from ${pos}, training heuristic favors ${rec} given stack ${stack} and typical opening ranges.`,
      factors,
    };
  }

  factors.push(`${street}: consider range advantage on this texture`);
  factors.push("Blockers and nut advantage influence bet sizing and bluff frequency");

  const rec: PokerAction =
    street === "river" ? (action === "bet" ? "bet" : "check") : action === "fold" ? "fold" : "bet";

  return {
    recommended: rec,
    explanation: `On the ${street}, demo analysis suggests ${rec} — balance value with fold equity while respecting ${pos} range caps.`,
    factors,
  };
}

export function buildDecisionPoints(hand: SavedHand): ReplayDecisionPoint[] {
  const points: ReplayDecisionPoint[] = [];
  const streets: HandStreet[] = ["preflop", "flop", "turn", "river"];

  for (const street of streets) {
    const segment = hand.action_history.find((s) => s.street === street);
    if (!segment) continue;

    segment.actions.forEach((action, actionIndex) => {
      if (action.player !== "hero") return;
      const { recommended, explanation, factors } = heuristicRecommendation(
        street,
        action.action,
        hand
      );
      points.push({
        street,
        board: boardAtStreet(hand, street),
        actionIndex,
        prompt: `What would you do? (${street}${action.description ? ` — ${action.description}` : ""})`,
        availableActions: ["fold", "check", "call", "bet", "raise"],
        recommended,
        explanation,
        factors,
      });
    });
  }

  if (points.length === 0) {
    const { recommended, explanation, factors } = heuristicRecommendation("preflop", "raise", hand);
    points.push({
      street: "preflop",
      board: "—",
      actionIndex: 0,
      prompt: "What would you do on this hand?",
      availableActions: ["fold", "check", "call", "bet", "raise"],
      recommended,
      explanation,
      factors,
    });
  }

  return points;
}

export function evaluateReplayChoice(
  hand: SavedHand,
  point: ReplayDecisionPoint,
  userAction: PokerAction
): ReplayStepResult {
  const isPreferred = userAction === point.recommended;
  return {
    userAction,
    recommended: point.recommended,
    isPreferred,
    explanation: point.explanation,
    factors: point.factors,
  };
}

export function parseActionHistoryText(text: string): StreetSegment[] {
  if (!text.trim()) return [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const segments: StreetSegment[] = [];
  let current: StreetSegment | null = null;

  for (const line of lines) {
    const streetMatch = line.match(/^(preflop|flop|turn|river):?\s*$/i);
    if (streetMatch) {
      if (current) segments.push(current);
      current = {
        street: streetMatch[1].toLowerCase() as HandStreet,
        board: "—",
        actions: [],
      };
      continue;
    }
    if (!current) {
      current = { street: "preflop", board: "—", actions: [] };
    }
    const actionMatch = line.match(/^(hero|villain):\s*(fold|check|call|bet|raise)(?:\s+\$?([\d.]+))?(?:\s+—\s+(.+))?/i);
    if (actionMatch) {
      current.actions.push({
        player: actionMatch[1].toLowerCase() as "hero" | "villain",
        action: actionMatch[2].toLowerCase() as PokerAction,
        amount: actionMatch[3] ? parseFloat(actionMatch[3]) : undefined,
        description: actionMatch[4],
      });
    }
  }
  if (current) segments.push(current);
  return segments;
}
