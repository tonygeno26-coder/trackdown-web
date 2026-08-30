export type DealingProcedureGame = "mechanics" | "holdem" | "omaha" | "mixed";

export interface DealingProcedureItem {
  id: string;
  title: string;
  detail: string;
}

/** Display order: foundational mechanics first, then game-specific sections. */
export const DEALING_PROCEDURE_GAME_ORDER: DealingProcedureGame[] = [
  "mechanics",
  "holdem",
  "omaha",
  "mixed",
];

export const GAME_SPECIFIC_PROCEDURE_GAMES: DealingProcedureGame[] = [
  "holdem",
  "omaha",
  "mixed",
];

export const DEALING_PROCEDURE_GAME_META: Record<
  DealingProcedureGame,
  { title: string; description: string; foundational?: boolean }
> = {
  mechanics: {
    title: "Dealer Mechanics",
    description:
      "Start here — foundational deck handling, pitching, burns, and table procedures shared across every game.",
    foundational: true,
  },
  holdem: {
    title: "Hold'em",
    description: "No-limit Texas Hold'em dealing procedures from shuffle to showdown.",
  },
  omaha: {
    title: "Omaha",
    description: "Pot-limit Omaha dealing — four hole cards, pot-limit betting, side pots.",
  },
  mixed: {
    title: "Mixed Games",
    description: "Cross-game rotation procedures — Stud, Hi-Lo, and dealer transitions.",
  },
};

export const DEALING_PROCEDURES: Record<DealingProcedureGame, DealingProcedureItem[]> = {
  mechanics: [
    {
      id: "me-shuffle",
      title: "Shuffle & cut",
      detail:
        "Wash, riffle shuffle at least three times, strip, and offer a cut to the player right of the button (or designated cut card position).",
    },
    {
      id: "me-spread",
      title: "Spreading & deck check",
      detail:
        "Spread the deck face-up to verify 52 cards, check for marks or damage, and confirm no duplicates before shuffling.",
    },
    {
      id: "me-pitch",
      title: "Pitching technique",
      detail:
        "Deal one card at a time with consistent speed and placement. Protect hole cards — never flash or expose during the pitch.",
    },
    {
      id: "me-cut-card",
      title: "Cut card placement",
      detail:
        "Insert the cut card at least one full deck length from either end. The cut must leave enough cards for the deal and burns.",
    },
    {
      id: "me-burn",
      title: "Burn card discipline",
      detail:
        "Burn one card face-down before each community street (flop, turn, river). Keep burn cards protected in a separate stack.",
    },
    {
      id: "me-all-in",
      title: "All-in announcement",
      detail:
        "When a player is all-in, announce 'all-in' and the amount. Do not accept further action from that player on later streets.",
    },
    {
      id: "me-side-pots",
      title: "Side pot creation",
      detail:
        "When multiple all-ins exist at different stack depths, create main and side pots before continuing. Match each player's eligible amount and tag eligible players per layer.",
    },
    {
      id: "me-muck",
      title: "Muck protection",
      detail:
        "Players may muck without showing if beaten. Protect the muck — do not expose folded cards. Award pots only after hands are verified.",
    },
    {
      id: "me-exposed",
      title: "Exposed & boxed cards",
      detail:
        "Stop dealing immediately on an exposed or boxed card. Call the floor and follow house misdeal procedure before continuing.",
    },
    {
      id: "me-floor",
      title: "Floor calls & irregularities",
      detail:
        "When unsure about a ruling or deck state, call the floor early. Do not invent rulings or continue with an unresolved irregularity.",
    },
  ],
  holdem: [
    {
      id: "he-button",
      title: "Move button & blinds",
      detail:
        "Advance the button one seat clockwise. Post small blind and big blind before dealing. Announce blind amounts when posting.",
    },
    {
      id: "he-deal-order",
      title: "Hole card dealing order",
      detail:
        "Deal one card at a time clockwise, starting left of the button. Each active player receives exactly two face-down cards.",
    },
    {
      id: "he-preflop-action",
      title: "Preflop betting order",
      detail:
        "First action is the player left of the big blind (under the gun). Action proceeds clockwise through the big blind option.",
    },
    {
      id: "he-flop-action",
      title: "Postflop betting order",
      detail:
        "On flop, turn, and river, first action is the first active player left of the button. Action proceeds clockwise.",
    },
    {
      id: "he-showdown",
      title: "Showdown order",
      detail:
        "Last aggressor on the final betting round shows first. If checked through, first active player left of the button shows first.",
    },
  ],
  omaha: [
    {
      id: "om-button",
      title: "Button & blinds",
      detail:
        "Post blinds and advance the button. In bomb-pot or double-board formats, follow posted room rules before dealing.",
    },
    {
      id: "om-deal-order",
      title: "Four-card dealing order",
      detail:
        "Deal one card at a time clockwise until each active player has exactly four hole cards. Pitch consistently — no card grouping.",
    },
    {
      id: "om-pot-limit",
      title: "Pot-limit betting",
      detail:
        "Track the pot for max raises. Announce 'pot' or the raise amount. Verify pot size before accepting a pot-sized raise.",
    },
    {
      id: "om-action",
      title: "Betting rounds",
      detail:
        "Four betting rounds: preflop, flop, turn, river. Preflop action starts left of the big blind; postflop starts left of the button.",
    },
    {
      id: "om-partial-call",
      title: "Partial all-in calls",
      detail:
        "When a short stack calls less than a full raise, reopening rules apply per house policy. Announce the partial call clearly.",
    },
    {
      id: "om-showdown",
      title: "Showdown — exactly two from hand",
      detail:
        "Players must use exactly two hole cards and three board cards. Verify hands before pushing pots; call the floor on disputes.",
    },
    {
      id: "om-showdown-order",
      title: "Showdown order",
      detail:
        "Last aggressor on the final betting round shows first. If checked through, first active player left of the button shows first.",
    },
    {
      id: "om-low-split",
      title: "Hi-Lo split awareness",
      detail:
        "In split formats, verify high and low qualifiers separately. Quartering and odd-chip rules apply per house policy.",
    },
  ],
  mixed: [
    {
      id: "mx-rotation",
      title: "Game rotation",
      detail:
        "Confirm the current game on the rotation sheet before dealing. Announce the game change and blind/ante structure clearly.",
    },
    {
      id: "mx-button-stud",
      title: "Bring-in & stud order",
      detail:
        "In stud games, deal one down and two up to each player. Lowest door card (or high card per variant) posts the bring-in.",
    },
    {
      id: "mx-stud-streets",
      title: "Stud street dealing",
      detail:
        "Third through sixth streets: one card per player. Seventh street is dealt face-down. Maintain consistent pitch order.",
    },
    {
      id: "mx-antes",
      title: "Antes & forced bets",
      detail:
        "Collect antes before dealing when required. Post bring-ins and completion bets per the active game variant.",
    },
    {
      id: "mx-hilo",
      title: "Hi-Lo showdown",
      detail:
        "Award high and low halves separately. Verify low qualifiers (8-or-better where applicable). Apply odd-chip rules to each half.",
    },
    {
      id: "mx-kill",
      title: "Kill pots & half-kills",
      detail:
        "When a kill is triggered, post the kill blind and deal accordingly. Announce kill status before the next hand.",
    },
    {
      id: "mx-transition",
      title: "Game change transition",
      detail:
        "Complete the current hand before switching games. Re-shuffle and cut when moving between flop and stud formats.",
    },
    {
      id: "mx-board-read",
      title: "Board reading across variants",
      detail:
        "Confirm hand rankings for the active game — Hold'em, Omaha, Stud, Razz, and Hi-Lo each use different evaluation rules.",
    },
    {
      id: "mx-all-in",
      title: "All-ins in mixed formats",
      detail:
        "Side pot rules apply in all flop games. In stud, track bets per street and verify eligibility at showdown.",
    },
    {
      id: "mx-showdown",
      title: "Showdown order by game",
      detail:
        "Follow last-aggressor rules in flop games. In stud, high hand on board shows first unless house rules specify otherwise.",
    },
  ],
};

export function allProcedureIds(): string[] {
  return Object.values(DEALING_PROCEDURES).flatMap((items) => items.map((i) => i.id));
}

export function procedureCount(game: DealingProcedureGame): number {
  return DEALING_PROCEDURES[game].length;
}
