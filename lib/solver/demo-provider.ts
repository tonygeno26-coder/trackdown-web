import { SolverProvider, SolverScenario } from "./types";

const DEMO_SCENARIOS: SolverScenario[] = [
  {
    id: "demo-01",
    title: "BTN vs BB — Flop C-Bet",
    gameType: "NLHE",
    stakes: "$1/$2",
    effectiveStack: "100bb",
    heroPosition: "BTN",
    villainPosition: "BB",
    heroCards: "Ah Kh",
    board: "Kc 7d 2s",
    potSize: 12,
    actionHistory: "Hero opens BTN, BB calls. BB checks flop.",
    recommended: [
      { action: "bet", frequency: 72, ev: 4.2, sizing: "33% pot" },
      { action: "check", frequency: 28, ev: 2.1 },
    ],
    preferredAction: "bet",
    explanation:
      "Range advantage and nut advantage favor a small c-bet. Top pair top kicker benefits from building the pot while denying equity to overcards and backdoor draws.",
    rangeBreakdown: [
      { label: "Value", combos: 18, percentage: 35, examples: ["AK", "KQ", "77"] },
      { label: "Bluffs", combos: 14, percentage: 27, examples: ["QJ", "A5s", "98s"] },
      { label: "Checks", combos: 20, percentage: 38, examples: ["medium pairs", "weak Kx"] },
    ],
    evComparison: [
      { action: "bet", ev: 4.2 },
      { action: "check", ev: 2.1 },
    ],
    gtoVsExploit: {
      gto: "Mix 33% pot bets with top pair+ and selected bluffs.",
      exploit: "Vs over-folders, increase c-bet frequency and size with merged range.",
    },
  },
  {
    id: "demo-02",
    title: "CO vs BTN — Turn Barrel",
    gameType: "NLHE",
    stakes: "$2/$5",
    effectiveStack: "85bb",
    heroPosition: "CO",
    villainPosition: "BTN",
    heroCards: "Qd Qc",
    board: "Qs 8h 4c 2d",
    potSize: 45,
    actionHistory: "Hero 3-bets pre, BTN calls. Hero bets flop, BTN calls. Turn goes check-check.",
    recommended: [
      { action: "bet", frequency: 58, ev: 8.5, sizing: "66% pot" },
      { action: "check", frequency: 42, ev: 6.2 },
    ],
    preferredAction: "bet",
    explanation:
      "Set on a dry board retains range advantage. Turn barrel targets underpairs and missed draws while charging flush draws.",
    rangeBreakdown: [
      { label: "Value", combos: 12, percentage: 40, examples: ["QQ+", "AQs"] },
      { label: "Bluffs", combos: 8, percentage: 27, examples: ["AK", "JJ"] },
      { label: "Pot control", combos: 10, percentage: 33, examples: ["TT", "99"] },
    ],
    evComparison: [
      { action: "bet", ev: 8.5 },
      { action: "check", ev: 6.2 },
    ],
    gtoVsExploit: {
      gto: "Polarize turn bets — large size with sets and bluffs.",
      exploit: "Vs calling stations, bet thinner for value with medium pairs.",
    },
  },
];

export const demoSolverProvider: SolverProvider = {
  listScenarios() {
    return DEMO_SCENARIOS;
  },
  async analyze(scenarioId: string) {
    return DEMO_SCENARIOS.find((s) => s.id === scenarioId) ?? null;
  },
};

export const SOLVER_PRO_FEATURES = [
  "Range Explorer",
  "Street Analysis",
  "Bet Size Comparison",
  "EV Comparison",
  "GTO vs Exploit",
  "Saved Reports",
  "Import HH",
  "NLHE",
  "PLO",
] as const;
