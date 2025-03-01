import { create } from 'zustand';
import { createDeck, dealCard, calculateHandScore, shouldDealerHit, calculatePayout } from './blackjack';
import type { GameState, Player, PlayerAction } from './types';
import { supabase } from './supabase';

interface GameStore extends GameState {
  players: Player[];
  selectedSeat: number | null;
  currentBet: number;
  
  // Game Actions
  joinGame: (name: string, seatPosition: number) => Promise<void>;
  leaveGame: (playerId: string) => Promise<void>;
  placeBet: (amount: number) => Promise<void>;
  takeAction: (action: PlayerAction) => Promise<void>;
  startNewRound: () => Promise<void>;
  moveToNextPlayer: () => Promise<void>;
  dealerPlay: () => Promise<void>;
  handlePayouts: () => Promise<void>;
  
  // Game State Management
  updateGameState: (newState: Partial<GameState>) => void;
  resetGame: () => void;
}

const INITIAL_STATE: Partial<GameState> = {
  deck: [],
  dealerHand: [],
  dealerScore: 0,
  currentPlayerIndex: -1,
  gamePhase: 'waiting',
  playerHands: [],
  timer: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE as GameState,
  id: '',
  players: [],
  selectedSeat: null,
  currentBet: 0,
  updatedAt: new Date().toISOString(),

  joinGame: async (name: string, seatPosition: number) => {
    try {
      // Check if player exists
      const { data: existingPlayer } = await supabase
        .from('players')
        .select()
        .eq('name', name)
        .single();

      let player: Player;

      if (existingPlayer) {
        player = existingPlayer;
      } else {
        // Create new player
        const { data: newPlayer } = await supabase
          .from('players')
          .insert({
            name,
            balance: 10000,
            created_at: new Date().toISOString(),
            last_played_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!newPlayer) throw new Error('Failed to create player');
        player = newPlayer;
      }

      set(currentState => ({
        players: [...currentState.players, player],
        selectedSeat: seatPosition,
      }));

      // If we have 2 or more players, start a new round
      if (get().players.length >= 2 && get().gamePhase === 'waiting') {
        await get().startNewRound();
      }
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  },

  leaveGame: async (playerId: string) => {
    try {
      set(currentState => ({
        players: currentState.players.filter(p => p.id !== playerId),
        playerHands: currentState.playerHands.filter(h => h.playerId !== playerId),
      }));

      // If less than 2 players, reset game
      if (get().players.length < 2) {
        get().resetGame();
      }
    } catch (error) {
      console.error('Error leaving game:', error);
      throw error;
    }
  },

  placeBet: async (amount: number) => {
    const { players, selectedSeat } = get();
    if (!selectedSeat || amount < 100 || amount > 1000) return;

    const player = players.find(p => p.id === get().players[selectedSeat].id);
    if (!player || player.balance < amount) return;

    try {
      // Update player balance
      const { data: updatedPlayer } = await supabase
        .from('players')
        .update({ balance: player.balance - amount })
        .eq('id', player.id)
        .select()
        .single();

      if (!updatedPlayer) throw new Error('Failed to update player balance');

      // Update local state
      set(currentState => ({
        players: currentState.players.map(p => 
          p.id === player.id ? updatedPlayer : p
        ),
        currentBet: amount,
        playerHands: [
          ...currentState.playerHands,
          {
            id: crypto.randomUUID(),
            playerId: player.id,
            seatPosition: selectedSeat,
            cards: [],
            betAmount: amount,
            status: 'betting',
            isTurn: false,
            insuranceBet: null,
            isSplit: false,
          },
        ],
      }));
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  },

  takeAction: async (action: PlayerAction) => {
    const { deck, playerHands } = get();
    const currentHand = playerHands.find(h => h.isTurn);
    if (!currentHand) return;

    try {
      switch (action) {
        case 'hit': {
          const { card, remainingDeck } = dealCard(deck);
          const newCards = [...currentHand.cards, card];
          const isBust = calculateHandScore(newCards) > 21;

          set(currentState => ({
            deck: remainingDeck,
            playerHands: currentState.playerHands.map(h =>
              h.id === currentHand.id
                ? {
                    ...h,
                    cards: newCards,
                    status: isBust ? 'bust' : 'active',
                    isTurn: !isBust,
                  }
                : h
            ),
          }));

          if (isBust) {
            // Move to next player or dealer
            await get().moveToNextPlayer();
          }
          break;
        }

        case 'stand': {
          set(currentState => ({
            playerHands: currentState.playerHands.map(h =>
              h.id === currentHand.id
                ? { ...h, status: 'stand', isTurn: false }
                : h
            ),
          }));

          await get().moveToNextPlayer();
          break;
        }

        // Implement other actions (double, split, surrender, insurance)
        // ... 
      }
    } catch (error) {
      console.error('Error taking action:', error);
      throw error;
    }
  },

  startNewRound: async () => {
    const newDeck = createDeck();
    const { card: dealerCard, remainingDeck } = dealCard(newDeck, true);

    set({
      deck: remainingDeck,
      dealerHand: [dealerCard],
      dealerScore: calculateHandScore([dealerCard]),
      gamePhase: 'betting',
      currentPlayerIndex: 0,
      timer: 10,
    });
  },

  updateGameState: (newState: Partial<GameState>) => {
    set(newState);
  },

  resetGame: () => {
    set({ ...INITIAL_STATE as GameState, id: crypto.randomUUID() });
  },

  moveToNextPlayer: async () => {
    const { currentPlayerIndex, playerHands } = get();
    const nextIndex = currentPlayerIndex + 1;

    if (nextIndex >= playerHands.length) {
      // All players have finished, move to dealer's turn
      set({ gamePhase: 'dealer_turn' });
      await get().dealerPlay();
    } else {
      // Move to next player
      set({
        currentPlayerIndex: nextIndex,
        playerHands: playerHands.map((h, i) => ({
          ...h,
          isTurn: i === nextIndex,
        })),
      });
    }
  },

  dealerPlay: async () => {
    const { dealerHand, deck } = get();
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];

    // Reveal dealer's hole card
    if (currentDealerHand.length > 0) {
      currentDealerHand = currentDealerHand.map(card => ({ ...card, isFaceUp: true }));
    }

    // Dealer hits until 17 or higher
    while (shouldDealerHit(currentDealerHand)) {
      const { card, remainingDeck } = dealCard(currentDeck, true);
      currentDealerHand.push(card);
      currentDeck = remainingDeck;
    }

    set({
      dealerHand: currentDealerHand,
      dealerScore: calculateHandScore(currentDealerHand),
      deck: currentDeck,
      gamePhase: 'payout',
    });

    // Handle payouts
    await get().handlePayouts();
  },

  handlePayouts: async () => {
    const { dealerHand, playerHands, players } = get();

    try {
      // Process each player's hand
      for (const hand of playerHands) {
        const player = players.find(p => p.id === hand.playerId);
        if (!player) continue;

        const payout = calculatePayout(
          hand.betAmount,
          hand.cards,
          dealerHand,
          hand.insuranceBet
        );

        if (payout > 0) {
          // Update player balance in database
          const { data: updatedPlayer } = await supabase
            .from('players')
            .update({
              balance: player.balance + payout,
              last_played_at: new Date().toISOString(),
            })
            .eq('id', player.id)
            .select()
            .single();

          if (!updatedPlayer) throw new Error('Failed to update player balance');

          // Update local state
          set(currentState => ({
            players: currentState.players.map(p =>
              p.id === player.id ? updatedPlayer : p
            ),
            playerHands: currentState.playerHands.map(h =>
              h.id === hand.id
                ? {
                    ...h,
                    status: payout > hand.betAmount ? 'won' : payout === hand.betAmount ? 'push' : 'lost',
                  }
                : h
            ),
          }));
        }
      }

      // Start new round after a delay
      setTimeout(() => {
        if (get().players.length >= 2) {
          get().startNewRound();
        } else {
          get().resetGame();
        }
      }, 3000);
    } catch (error) {
      console.error('Error handling payouts:', error);
      throw error;
    }
  },
})); 