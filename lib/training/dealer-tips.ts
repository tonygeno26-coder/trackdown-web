import { DealerTip } from "./types";

export const DEALER_TIPS: DealerTip[] = [
  {
    id: "tip-01",
    title: "Pitch with a consistent arc",
    category: "pitching",
    explanation:
      "A smooth, repeatable pitch helps players track cards and reduces exposed-card incidents. The arc should land cards in front of each player without excessive height or speed.",
    practicalTip: "Practice the same release point for every pitch. Aim for a low arc that clears the rail but stays readable.",
    commonMistake: "Pitching too hard on the button side and too soft on the other — inconsistency invites disputes.",
  },
  {
    id: "tip-02",
    title: "Keep cards below the rail line",
    category: "pitching",
    explanation:
      "Cards delivered above the rail can be seen by neighboring players. Keeping deliveries low protects game integrity.",
    practicalTip: "Release cards at rail height or slightly below, never above shoulder level of seated players.",
  },
  {
    id: "tip-03",
    title: "Control the deck with your non-dealing hand",
    category: "pitching",
    explanation:
      "Your off hand protects the stub, prevents premature cuts, and signals professionalism. Loose deck handling creates security concerns.",
    practicalTip: "Rest the stub on the pad with your index finger guiding the top card during the pitch.",
  },
  {
    id: "tip-04",
    title: "Maintain a steady dealing rhythm",
    category: "pace",
    explanation:
      "Consistent pace keeps players engaged and reduces idle time. Rushing after delays or slowing during action creates an uneven feel.",
    practicalTip: "Deal at the same tempo whether the pot is small or large. Adjust only when waiting on a player.",
  },
  {
    id: "tip-05",
    title: "Pause briefly before burning",
    category: "pace",
    explanation:
      "A short pause before each burn card gives players time to act mentally and reduces misdeals caused by rushing.",
    practicalTip: "Burn, brief pause, then deliver the board card. House rules may vary on exact timing.",
  },
  {
    id: "tip-06",
    title: "Announce the current bet clearly",
    category: "announcing",
    explanation:
      "Players rely on the dealer for the correct bet amount, especially in multi-way pots with raises.",
    practicalTip: "State the total amount to call, not just the increment: 'Bet is sixty, twenty to call.'",
    commonMistake: "Announcing only the raise size without the total facing amount.",
  },
  {
    id: "tip-07",
    title: "Confirm all-in amounts aloud",
    category: "announcing",
    explanation:
      "All-in situations require clarity. Misheard amounts cause major disputes and floor calls.",
    practicalTip: "Repeat the all-in total and ask for confirmation before pushing chips into the pot.",
  },
  {
    id: "tip-08",
    title: "Protect the stub between streets",
    category: "deck",
    explanation:
      "The undealt portion of the deck must remain secure. Exposed stub cards compromise the hand.",
    practicalTip: "Keep the stub on the cut card with your hand covering the top at all times between pitches.",
  },
  {
    id: "tip-09",
    title: "Use a cut card on every deal",
    category: "deck",
    explanation:
      "The cut card prevents bottom-dealing and marks where dealing ends. Skipping it is a serious procedural error.",
    practicalTip: "Place the cut card under the stub immediately after the shuffle and cut are complete.",
  },
  {
    id: "tip-10",
    title: "Line up chips closest to the pot first",
    category: "pot",
    explanation:
      "When building a pot, organizing chips by stack and position helps verify amounts and speeds up pot awards.",
    practicalTip: "Move called chips toward the pot in order of action, keeping raises visually separated.",
  },
  {
    id: "tip-11",
    title: "Count the pot before awarding",
    category: "pot",
    explanation:
      "Verifying the total before pushing prevents over- or under-pays. This is especially important in split pots.",
    practicalTip: "Count silently, announce the total if requested, then break down into equal stacks for winners.",
  },
  {
    id: "tip-12",
    title: "State house rules when asked, not unsolicited",
    category: "communication",
    explanation:
      "Players may assume rules from other rooms. Answer clearly without debating strategy.",
    practicalTip: "If unsure, call the floor. Say: 'House rules may vary — I'll confirm with the floor.'",
  },
  {
    id: "tip-13",
    title: "Redirect strategy questions politely",
    category: "communication",
    explanation:
      "Dealers facilitate the game, not player strategy. Engaging in strategy creates bias perceptions.",
    practicalTip: "Smile and say: 'I can't advise on play, but I'll make sure the action is clear.'",
  },
  {
    id: "tip-14",
    title: "Kill buttons and blinds in order",
    category: "cash",
    explanation:
      "Missed blind posts and out-of-turn buttons disrupt fairness. Track who owes what before dealing.",
    practicalTip: "Verify blind posts and missed blind penalties before the first pitch. House rules may vary.",
  },
  {
    id: "tip-15",
    title: "Handle straddles before first action",
    category: "cash",
    explanation:
      "Straddles change action order and pot size. Confirm straddle amount and eligibility before dealing.",
    practicalTip: "Announce the straddle amount and which seat is straddling before the first preflop pitch.",
  },
  {
    id: "tip-16",
    title: "Keep tournament antes organized",
    category: "tournament",
    explanation:
      "Antes in tournaments are often pulled before dealing. Disorganized antes slow the game and cause errors.",
    practicalTip: "Collect antes into a single stack or use a dedicated ante chip if the room provides one.",
  },
  {
    id: "tip-17",
    title: "Announce level changes before dealing",
    category: "tournament",
    explanation:
      "Blind level increases must be clear before the next hand begins. Dealing into a new level without announcement causes confusion.",
    practicalTip: "Pause the deck, announce blinds and antes for the new level, then resume. House rules may vary.",
  },
  {
    id: "tip-18",
    title: "Never expose the turn early",
    category: "mistakes",
    explanation:
      "Dealing the turn before action completes on the flop is a common error with serious consequences.",
    practicalTip: "Do not touch the stub for the next street until all action is closed and chips are gathered.",
    commonMistake: "Burning and turning while a player is still considering a raise.",
  },
  {
    id: "tip-19",
    title: "Call the floor on any irregularity",
    category: "mistakes",
    explanation:
      "Exposed cards, fouled decks, and action out of turn require floor judgment. Dealers should not unilaterally rule.",
    practicalTip: "Stop dealing, protect the deck and board, and call the floor immediately.",
  },
  {
    id: "tip-20",
    title: "Stay neutral regardless of pot size",
    category: "professionalism",
    explanation:
      "Large pots create tension. Neutral body language and consistent procedure protect your credibility.",
    practicalTip: "Use the same tone and pace for a $5 pot and a $5,000 pot.",
  },
  {
    id: "tip-21",
    title: "Wear consistent uniform standards",
    category: "professionalism",
    explanation:
      "Appearance affects player confidence in the game. Follow room standards for attire and grooming.",
    practicalTip: "Arrive early enough to be on the floor, uniform-ready, before your down begins.",
  },
  {
    id: "tip-22",
    title: "Verify side-pot eligibility before awarding",
    category: "pot",
    explanation:
      "Side pots require knowing which players are all-in for which amounts. Award main pot first, then side pots in order.",
    practicalTip: "Build side pots from smallest to largest, announcing each pot's eligible players.",
    commonMistake: "Awarding the entire pot to one winner when a side pot exists.",
  },
  {
    id: "tip-23",
    title: "Use clear hand signals with verbal calls",
    category: "announcing",
    explanation:
      "Cameras and players both rely on signals. Pairing gestures with words reduces ambiguity.",
    practicalTip: "When a player bets, repeat the amount verbally while tapping the bet area.",
  },
  {
    id: "tip-24",
    title: "Manage misdeals by house procedure",
    category: "mistakes",
    explanation:
      "Misdeal rules differ by room and game type. Follow posted procedures rather than improvising.",
    practicalTip: "If too many cards were dealt or the stub was exposed, stop and call the floor. House rules may vary.",
  },
];
