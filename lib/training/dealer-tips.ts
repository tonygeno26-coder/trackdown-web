import { DealerTip, DealerTipCategory } from "./types";
import { DEALER_TIPS_BASE } from "./dealer-tips-base";

const CATEGORIES: DealerTipCategory[] = [
  "pitching", "pace", "announcing", "deck", "pot", "communication",
  "cash", "tournament", "mistakes", "professionalism",
];

const TITLES: Record<DealerTipCategory, string[]> = {
  pitching: ["Square the deck before pitch", "Use a consistent grip", "Avoid side-arm deliveries", "Protect hole cards during pitch", "Keep pitch height uniform", "Practice one-handed cut control", "Minimize card flutter", "Align cards to player rail", "Use fingertip control on release", "Avoid reaching across players"],
  pace: ["Match room tempo", "Don't rush showdown", "Pause for chip counts", "Keep dead time minimal", "Sync with floor clock", "Allow reasonable think time", "Move promptly after showdown", "Batch chip movements", "Pre-count antes when possible", "Signal when waiting on floor"],
  announcing: ["Announce raises clearly", "Repeat all-in amounts", "State action facing player", "Announce straddles", "Call blind levels", "Announce kills", "State side pot amounts", "Announce color-ups", "Confirm all-in declarations", "Use standard terminology"],
  deck: ["Inspect deck each down", "Replace damaged cards", "Keep stub covered", "Shuffle per house standard", "Verify cut card placement", "Protect burn cards", "Spread deck on suspicion", "Replace boxed cards promptly", "Never expose stub", "Store deck securely between downs"],
  pot: ["Line up pot chips", "Verify pot count before award", "Separate side pots visually", "Count down large pots", "Confirm all-in amounts", "Return uncalled bets", "Announce pot total at showdown", "Use tray for complex pots", "Verify winner before push", "Keep pot in center of table"],
  communication: ["Stay neutral in disputes", "Direct questions to floor", "Use player's name when known", "Confirm verbal declarations", "Repeat disputed action", "Don't offer strategy advice", "Maintain eye contact when listening", "Speak at appropriate volume", "Acknowledge floor rulings", "Document incidents if required"],
  cash: ["Verify buy-in minimums", "Post missed blinds correctly", "Handle straddles per policy", "Manage table changes", "Confirm cash-out procedure", "Track seat openers", "Enforce time charges if applicable", "Handle wait lists per policy", "Verify chip colors", "Follow rake procedures"],
  tournament: ["Announce blind increases", "Track antes accurately", "Handle color-ups", "Verify all-in survival", "Manage clock per floor", "Seat balanced tables", "Announce eliminations", "Handle rebuys per policy", "Track bounties if applicable", "Follow TDA guidelines"],
  mistakes: ["Admit errors promptly", "Never hide misdeals", "Protect exposed cards", "Stop action when unsure", "Preserve hand history", "Don't restart without floor", "Document irregularities", "Stay calm under pressure", "Learn from floor rulings", "Review common errors"],
  professionalism: ["Arrive early", "Maintain uniform standards", "Stay off phone on floor", "Keep workspace clean", "Support fellow dealers", "Accept constructive feedback", "Stay hydrated and focused", "Manage fatigue on long downs", "Represent the room well", "Continuously improve skills"],
};

function generateExtendedTips(): DealerTip[] {
  const tips: DealerTip[] = [];
  let idx = 25;
  for (const cat of CATEGORIES) {
    for (const title of TITLES[cat]) {
      tips.push({
        id: `tip-${String(idx).padStart(3, "0")}`,
        title,
        category: cat,
        explanation: `${title} is an important dealer skill. Following consistent procedure reduces errors and builds player confidence.`,
        practicalTip: `Focus on ${title.toLowerCase()} during your next down. House rules may vary.`,
        commonMistake: `Neglecting ${title.toLowerCase()} under pressure.`,
      });
      idx++;
    }
  }
  return tips;
}

export const DEALER_TIPS: DealerTip[] = [...DEALER_TIPS_BASE, ...generateExtendedTips()];
