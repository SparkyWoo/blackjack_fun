import { Card, Rank, Suit } from './types';

// Create a new deck of cards
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        isFaceUp: true,
      });
    }
  }

  return shuffleDeck(deck);
}

// Shuffle the deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal a card from the deck
export function dealCard(deck: Card[], isFaceUp: boolean = true): { card: Card; remainingDeck: Card[] } {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }

  const newDeck = [...deck];
  const card = { ...newDeck.pop()!, isFaceUp };
  
  return { card, remainingDeck: newDeck };
}

// Calculate the score of a hand
export function calculateHandScore(cards: Card[]): number {
  let score = 0;
  let aces = 0;

  // Only count face-up cards
  const visibleCards = cards.filter(card => card.isFaceUp);

  for (const card of visibleCards) {
    if (card.rank === 'A') {
      aces += 1;
      score += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      score += 10;
    } else {
      score += parseInt(card.rank);
    }
  }

  // Adjust for aces if needed
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
}

// Check if a hand is a blackjack
export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateHandScore(cards) === 21;
}

// Check if a hand is busted
export function isBusted(cards: Card[]): boolean {
  return calculateHandScore(cards) > 21;
}

// Check if a hand can be split
export function canSplit(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  
  const rank1 = cards[0].rank;
  const rank2 = cards[1].rank;
  
  // Can split if both cards have the same rank
  // For face cards (J, Q, K), they all count as 10, so they can be split together
  if (['J', 'Q', 'K', '10'].includes(rank1) && ['J', 'Q', 'K', '10'].includes(rank2)) {
    return true;
  }
  
  return rank1 === rank2;
}

// Check if a hand can be doubled down
export function canDoubleDown(cards: Card[]): boolean {
  // Can only double down on first two cards
  return cards.length === 2;
}

// Check if a hand can surrender
export function canSurrender(cards: Card[]): boolean {
  // Can only surrender on first two cards
  return cards.length === 2;
}

// Get the card value for display
export function getCardValue(card: Card): string {
  return card.rank;
}

// Determine if dealer should hit (hits on 16 or less, stands on 17 or more)
export function shouldDealerHit(dealerCards: Card[]): boolean {
  const score = calculateHandScore(dealerCards);
  return score < 17;
}

// Determine the winner between player and dealer
export function determineWinner(playerCards: Card[], dealerCards: Card[]): 'player' | 'dealer' | 'push' {
  const playerScore = calculateHandScore(playerCards);
  const dealerScore = calculateHandScore(dealerCards);
  
  // If player busted, dealer wins
  if (playerScore > 21) return 'dealer';
  
  // If dealer busted, player wins
  if (dealerScore > 21) return 'player';
  
  // If player has blackjack but dealer doesn't, player wins
  if (isBlackjack(playerCards) && !isBlackjack(dealerCards)) return 'player';
  
  // If dealer has blackjack but player doesn't, dealer wins
  if (isBlackjack(dealerCards) && !isBlackjack(playerCards)) return 'dealer';
  
  // If both have blackjack, it's a push
  if (isBlackjack(playerCards) && isBlackjack(dealerCards)) return 'push';
  
  // Compare scores
  if (playerScore > dealerScore) return 'player';
  if (dealerScore > playerScore) return 'dealer';
  
  // Equal scores result in a push
  return 'push';
}

// Calculate payout for a hand
export function calculatePayout(betAmount: number, playerCards: Card[], dealerCards: Card[], insuranceBet: number | null = null): number {
  let payout = 0;
  
  const result = determineWinner(playerCards, dealerCards);
  
  // Handle insurance bet
  if (insuranceBet && isBlackjack(dealerCards)) {
    payout += insuranceBet * 2; // Insurance pays 2:1
  }
  
  // Handle main bet
  if (result === 'player') {
    if (isBlackjack(playerCards)) {
      payout += betAmount * 2.5; // Blackjack pays 3:2
    } else {
      payout += betAmount * 2; // Regular win pays 1:1
    }
  } else if (result === 'push') {
    payout += betAmount; // Push returns the bet
  }
  
  return payout;
} 