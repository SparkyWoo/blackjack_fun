export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export type HandStatus = 
  | 'betting'
  | 'active'
  | 'stand'
  | 'bust'
  | 'blackjack'
  | 'surrender'
  | 'double'
  | 'split'
  | 'won'
  | 'lost'
  | 'push';

export interface PlayerHand {
  id: string;
  playerId: string;
  seatPosition: number;
  cards: Card[];
  betAmount: number;
  status: HandStatus;
  isTurn: boolean;
  insuranceBet: number | null;
  isSplit: boolean;
}

export interface Player {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  lastPlayedAt: string;
}

export type GamePhase = 'waiting' | 'betting' | 'player_turns' | 'dealer_turn' | 'payout' | 'reshuffling';

export interface GameState {
  id: string;
  deck: Card[];
  dealerHand: Card[];
  dealerScore: number;
  currentPlayerIndex: number;
  gamePhase: GamePhase;
  updatedAt: string;
  playerHands: PlayerHand[];
  timer: number | null;
}

export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance';

export interface ChipValue {
  value: number;
  color: string;
} 