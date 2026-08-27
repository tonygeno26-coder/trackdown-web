export type DealingProcedureGame = "holdem" | "omaha" | "mixed";

export interface DealingProcedureItem {
  id: string;
  title: string;
  detail: string;
}

export const DEALING_PROCEDURE_GAME_META: Record<
  DealingProcedureGame,
  { title: string; description: string }
> = {
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
  holdem: [
    {
      id: "he-shuffle",
      title: "Shuffle & cut",
      detail:
        "Wash, riffle shuffle at least three times, strip, and offer a cut to the player right of the button (or designated cut card position).",
    },
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
      id: "he-burn-flop",
      title: "Burn before flop",
      detail:
        "Burn one card face-down before dealing the flop. Place three community cards face-up in the center.",
    },
    {
      id: "he-flop-action",
      title: "Flop betting order",
      detail:
        "First action is the first active player left of the button. Action proceeds clockwise. Announce bets and raises clearly.",
    },
    {
      id: "he-burn-turn",
      title: "Burn before turn",
      detail:
        "Burn one card before placing the fourth community card beside the flop — never intermix with the flop.",
    },
    {
      id: "he-burn-river",
      title: "Burn before river",
      detail:
        "Burn one card before dealing the fifth and final community card. Keep burn cards protected and stacked.",
    },
    {
      id: "he-all-in",
      title: "All-in announcement",
      detail:
        "When a player is all-in, announce 'all-in' and the amount. Do not accept further action from that player on later streets.",
    },
    {
      id: "he-side-pots",
      title: "Side pot creation",
      detail:
        "When multiple all-ins exist at different stack depths, create main and side pots before continuing. Match each player's eligible amount.",
    },
    {
      id: "he-showdown",
      title: "Showdown order",
      detail:
        "Last aggressor on the final betting round shows first. If checked through, first active player left of the button shows first.",
    },
    {
      id: "he-muck",
      title: "Muck losing hands",
      detail:
        "Players may muck without showing if beaten. Protect the muck — do not expose folded cards. Award pot only after hands are verified.",
    },
    {
      id: "he-exposed",
      title: "Exposed / boxed cards",
      detail:
        "Stop dealing immediately on an exposed card. Call the floor and follow house misdeal procedure before continuing.",
    },
  ],
  omaha: [
    {
      id: "om-shuffle",
      title: "Shuffle & cut",
      detail:
        "Same shuffle standards as Hold'em. Verify deck integrity before dealing four-card hands.",
    },
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
      id: "om-burn-board",
      title: "Burn before each board",
      detail:
        "Burn one card before flop, turn, and river — same burn discipline as Hold'em on each street.",
    },
    {
      id: "om-action",
      title: "Betting rounds",
      detail:
        "Four betting rounds: preflop, flop, turn, river. Preflop action starts left of the big blind; postflop starts left of the button.",
    },
    {
      id: "om-all-in",
      title: "All-in & partial calls",
      detail:
        "Partial all-ins create side pots. Announce each all-in level. Players may only win from pots they contributed to.",
    },
    {
      id: "om-side-pots",
      title: "Side pot breakdown",
      detail:
        "Build pots from smallest to largest commitment. Tag eligible players per layer before awarding any pot.",
    },
    {
      id: "om-showdown",
      title: "Showdown — exactly two from hand",
      detail:
        "Players must use exactly two hole cards and three board cards. Verify hands before pushing pots; call the floor on disputes.",
    },
    {
      id: "om-low-split",
      title: "Hi-Lo split awareness",
      detail:
        "In split formats, verify high and low qualifiers separately. Quartering and odd-chip rules apply per house policy.",
    },
    {
      id: "om-exposed",
      title: "Exposed cards & fouled deck",
      detail:
        "Extra or missing cards require an immediate stop. Do not continue until the floor resolves the deck state.",
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
        "Complete the current hand before switching games. Shuffle and cut when moving between flop and stud formats.",
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
    {
      id: "mx-procedure",
      title: "Floor calls & irregularities",
      detail:
        "Mixed rotations have more edge cases. When unsure, call the floor early — do not invent rulings at the table.",
    },
  ],
};

export function allProcedureIds(): string[] {
  return Object.values(DEALING_PROCEDURES).flatMap((items) => items.map((i) => i.id));
}

export function procedureCount(game: DealingProcedureGame): number {
  return DEALING_PROCEDURES[game].length;
}
