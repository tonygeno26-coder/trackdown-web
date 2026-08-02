import {
  BlackjackCard,
  BlackjackHand,
  BlackjackRules,
  BlackjackSituation,
  BlackjackTrainingMode,
  CardRank,
  HandCategory,
  cardValue,
} from "./blackjack";
import { situationKey } from "./blackjack-strategy";

const RANKS: CardRank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function randomRank(): CardRank {
  return RANKS[Math.floor(Math.random() * RANKS.length)];
}

function handTotal(cards: BlackjackCard[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === "A") {
      aces++;
      total += 11;
    } else {
      total += cardValue(c.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  const soft = aces > 0;
  return { total, soft };
}

function classifyHand(cards: BlackjackCard[]): BlackjackHand {
  const isPair =
    cards.length === 2 &&
    cardValue(cards[0].rank) === cardValue(cards[1].rank);
  const { total, soft } = handTotal(cards);
  if (isPair) {
    return {
      cards,
      category: "pair",
      total,
      soft,
      pairRank: cards[0].rank,
    };
  }
  if (soft) {
    return { cards, category: "soft", total, soft: true };
  }
  return { cards, category: "hard", total, soft: false };
}

function buildSituation(playerCards: BlackjackCard[], dealerCard: BlackjackCard, rules: BlackjackRules): BlackjackSituation {
  const playerHand = classifyHand(playerCards);
  const isPair =
    playerHand.category === "pair" &&
    playerCards.length === 2 &&
    cardValue(playerCards[0].rank) === cardValue(playerCards[1].rank);
  const canSplit = isPair;
  const canDouble = playerCards.length === 2;
  const canSurrender = rules.surrender && playerCards.length === 2;
  const situation: BlackjackSituation = {
    id: "",
    playerHand,
    dealerUpcard: dealerCard,
    canDouble,
    canSplit,
    canSurrender,
  };
  situation.id = situationKey(situation);
  return situation;
}

function randomHardHand(): { player: BlackjackCard[]; dealer: BlackjackCard } {
  let player: BlackjackCard[];
  let hand: BlackjackHand;
  do {
    player = [{ rank: randomRank() }, { rank: randomRank() }];
    hand = classifyHand(player);
  } while (hand.category !== "hard" || hand.total > 17 || hand.total < 8);
  return { player, dealer: { rank: randomRank() } };
}

function randomSoftHand(): { player: BlackjackCard[]; dealer: BlackjackCard } {
  const ace: BlackjackCard = { rank: "A" };
  const kicker = { rank: RANKS.filter((r) => r !== "A")[Math.floor(Math.random() * 12)] };
  const player = Math.random() > 0.5 ? [ace, kicker] : [kicker, ace];
  return { player, dealer: { rank: randomRank() } };
}

function randomPairHand(): { player: BlackjackCard[]; dealer: BlackjackCard } {
  const rank = randomRank();
  return {
    player: [{ rank }, { rank }],
    dealer: { rank: randomRank() },
  };
}

function randomAnyHand(): { player: BlackjackCard[]; dealer: BlackjackCard } {
  const roll = Math.random();
  if (roll < 0.25) return randomPairHand();
  if (roll < 0.45) return randomSoftHand();
  return randomHardHand();
}

export function generateSituation(
  mode: BlackjackTrainingMode,
  rules: BlackjackRules,
  mistakeKeys?: string[]
): BlackjackSituation {
  if (mode === "mistakes" && mistakeKeys && mistakeKeys.length > 0) {
    const key = mistakeKeys[Math.floor(Math.random() * mistakeKeys.length)];
    return parseSituationKey(key, rules);
  }

  let data: { player: BlackjackCard[]; dealer: BlackjackCard };
  switch (mode) {
    case "hard":
      data = randomHardHand();
      break;
    case "soft":
      data = randomSoftHand();
      break;
    case "pairs":
      data = randomPairHand();
      break;
    default:
      data = randomAnyHand();
  }
  return buildSituation(data.player, data.dealer, rules);
}

/** Reconstruct a situation from a stored key for mistake review */
function parseSituationKey(key: string, rules: BlackjackRules): BlackjackSituation {
  const [playerPart, dealerPart] = key.split("_vs_");
  const ranks = playerPart.split("-") as CardRank[];
  const dealerRank = dealerPart as CardRank;
  return buildSituation(
    ranks.map((rank) => ({ rank })),
    { rank: dealerRank },
    rules
  );
}

export function handCategoryLabel(category: HandCategory): string {
  switch (category) {
    case "hard":
      return "Hard total";
    case "soft":
      return "Soft total";
    case "pair":
      return "Pair";
  }
}

export function formatHandCards(cards: BlackjackCard[]): string {
  return cards.map((c) => c.rank).join(" + ");
}
