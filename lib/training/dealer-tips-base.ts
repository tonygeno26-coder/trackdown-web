import { DealerTip } from "./types";

export const DEALER_TIPS_BASE: DealerTip[] = [
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
    practicalTip: "State the total amount to call, not just the increment. Example: 'Raise to $60, $40 to you.'",
  },
  {
    id: "tip-07",
    title: "Protect the stub at all times",
    category: "deck",
    explanation:
      "The stub must never be exposed or left unattended. Players watch for any hint of impropriety.",
    practicalTip: "Keep the stub on the cut card with your hand covering the top when not actively dealing.",
  },
  {
    id: "tip-08",
    title: "Verify pot size before awarding",
    category: "pot",
    explanation:
      "Incorrect pot awards are among the most serious dealer errors. Always count or verify before pushing.",
    practicalTip: "Line up chips in stacks, count aloud for large pots, and confirm with the floor if uncertain.",
  },
  {
    id: "tip-09",
    title: "Stay neutral in player disputes",
    category: "communication",
    explanation:
      "Dealers facilitate the game but do not adjudicate. Taking sides erodes trust.",
    practicalTip: "Repeat what you saw, then call the floor. Avoid phrases that imply blame.",
  },
  {
    id: "tip-10",
    title: "Post blinds before dealing",
    category: "cash",
    explanation:
      "Blinds must be posted and verified before cards are pitched. Skipping this step causes action-order errors.",
    practicalTip: "Confirm SB and BB amounts, announce 'Blinds posted,' then begin the pitch.",
  },
  {
    id: "tip-11",
    title: "Track antes during tournaments",
    category: "tournament",
    explanation:
      "Antes increase pot size and affect strategy. Missing antes creates fairness issues.",
    practicalTip: "Collect antes before dealing, or verify automated ante collection is active.",
  },
  {
    id: "tip-12",
    title: "Don't muck hands prematurely",
    category: "mistakes",
    explanation:
      "Mucking before showdown is complete can cause irrecoverable errors. Protect all live hands.",
    practicalTip: "Wait for clear winner or floor direction before touching mucked cards.",
  },
  {
    id: "tip-13",
    title: "Confirm all-in declarations",
    category: "announcing",
    explanation:
      "All-in amounts must be clear to all players. Ambiguity leads to disputes.",
    practicalTip: "Repeat: 'Player A is all-in for $X.' Count down chips if needed.",
  },
  {
    id: "tip-14",
    title: "Use the cut card consistently",
    category: "deck",
    explanation:
      "The cut card prevents bottom-dealing and marks where dealing stops.",
    practicalTip: "Never deal past the cut card. Replace it after each shuffle.",
  },
  {
    id: "tip-15",
    title: "Manage side pots methodically",
    category: "pot",
    explanation:
      "Multiple all-ins require layered pots. Award from smallest eligible pot to largest.",
    practicalTip: "Build side pots on the table or in trays before any award.",
  },
  {
    id: "tip-16",
    title: "Handle color-ups efficiently",
    category: "tournament",
    explanation:
      "Color-ups keep stacks manageable. Delays frustrate players.",
    practicalTip: "Pre-sort chips during breaks. Announce color-up procedure before starting.",
  },
  {
    id: "tip-17",
    title: "Watch for string bets",
    category: "cash",
    explanation:
      "Multiple chip motions without a clear declaration may not be a valid raise.",
    practicalTip: "Announce 'One motion' or 'Full amount' per house policy when needed.",
    commonMistake: "Allowing players to add chips after initial forward motion.",
  },
  {
    id: "tip-18",
    title: "Keep your station organized",
    category: "professionalism",
    explanation:
      "Cluttered stations slow dealing and look unprofessional.",
    practicalTip: "Return unused lammers, cut cards, and button to designated spots each hand.",
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
