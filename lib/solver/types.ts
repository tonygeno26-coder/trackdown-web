import { PokerAction } from "@/lib/training/types";

export interface SolverRecommendedAction {
  action: PokerAction;
  frequency: number;
  ev?: number;
  sizing?: string;
}

export interface RangeBreakdown {
  label: string;
  combos: number;
  percentage: number;
  examples: string[];
}

export interface SolverNode {
  id: string;
  street: "preflop" | "flop" | "turn" | "river";
  board: string;
  pot: number;
  actionLabel: string;
  children?: SolverNode[];
}

export interface SolverScenario {
  id: string;
  title: string;
  gameType: "NLHE" | "PLO";
  stakes: string;
  effectiveStack: string;
  heroPosition: string;
  villainPosition: string;
  heroCards: string;
  board: string;
  potSize: number;
  actionHistory: string;
  recommended: SolverRecommendedAction[];
  preferredAction: PokerAction;
  explanation: string;
  rangeBreakdown: RangeBreakdown[];
  evComparison?: { action: PokerAction; ev: number }[];
  gtoVsExploit?: { gto: string; exploit: string };
}

export interface SolverProvider {
  analyze(scenarioId: string): Promise<SolverScenario | null>;
  listScenarios(): SolverScenario[];
}
