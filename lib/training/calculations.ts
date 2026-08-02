/** Required equity % = call / (pot + call) × 100 */
export function requiredEquityPct(callAmount: number, potBefore: number): number {
  const finalPot = potBefore + callAmount;
  if (finalPot <= 0) return 0;
  return (callAmount / finalPot) * 100;
}

/** Compare numeric answers with tolerance for rounding */
export function numericAnswerMatches(user: number, correct: number, tolerance = 0.51): boolean {
  return Math.abs(user - correct) <= tolerance;
}

/** NLHE minimum raise TO amount facing a bet */
export function minRaiseTo(currentBet: number, previousRaiseSize: number): number {
  return currentBet + previousRaiseSize;
}

/** PLO pot-limit: call, pot-after-call, max raise BY, total put in */
export function ploPotLimitBreakdown(pot: number, betToCall: number) {
  const callAmount = betToCall;
  const potAfterCall = pot + callAmount;
  const maxRaiseBy = potAfterCall;
  const totalPutIn = callAmount + maxRaiseBy;
  return { callAmount, potAfterCall, maxRaiseBy, totalPutIn };
}

/** PLO with straddle already in pot */
export function ploPotLimitWithStraddle(pot: number, betToCall: number, straddle: number) {
  const effectivePot = pot + straddle;
  return ploPotLimitBreakdown(effectivePot, betToCall);
}
