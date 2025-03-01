import { create } from 'zustand';
import { createDeck, dealCard, calculateHandScore, shouldDealerHit, calculatePayout } from './blackjack';
import type { GameState, Player, PlayerAction, Card } from './types';
import { supabase } from './supabase';

// Constants
const INITIAL_PLAYER_BALANCE = 10000; // Ensure players start with 10K as per PRD

interface GameStore extends GameState {
  players: Player[];
  selectedSeat: number | null;
  currentBet: number;
  isLoading: boolean;
  
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
  syncGameState: () => Promise<void>;
  initializeGameState: () => Promise<void>;
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
  isLoading: true,
  updatedAt: new Date().toISOString(),

  // Initialize game state from database
  initializeGameState: async () => {
    set({ isLoading: true });
    
    try {
      // Check if there's an active game
      const { data: gameData } = await supabase
        .from('game_state')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      // If we have game data and it's valid
      if (gameData && gameData.length > 0) {
        const latestGame = gameData[0];
        
        try {
          // Parse JSON strings back to objects
          const parsedGameState: Partial<GameState> = {
            id: latestGame.id,
            deck: (() => {
              try {
                return typeof latestGame.deck === 'string' ? JSON.parse(latestGame.deck || '[]') : (latestGame.deck || []);
              } catch (error) {
                console.error('Error parsing deck:', error);
                return [];
              }
            })(),
            dealerHand: (() => {
              try {
                return typeof latestGame.dealer_hand === 'string' ? JSON.parse(latestGame.dealer_hand || '[]') : (latestGame.dealer_hand || []);
              } catch (error) {
                console.error('Error parsing dealer hand:', error);
                return [];
              }
            })(),
            dealerScore: latestGame.dealer_score,
            currentPlayerIndex: latestGame.current_player_index,
            gamePhase: latestGame.game_phase,
            updatedAt: latestGame.updated_at,
            timer: latestGame.timer,
          };

          // Fetch player hands for this game
          const { data: handData } = await supabase
            .from('player_hands')
            .select('*')
            .eq('game_id', latestGame.id);

          if (handData && handData.length > 0) {
            const parsedHands = handData.map(hand => ({
              id: hand.id,
              playerId: hand.player_id,
              seatPosition: hand.seat_position,
              cards: (() => {
                try {
                  return typeof hand.cards === 'string' ? JSON.parse(hand.cards || '[]') : (hand.cards || []);
                } catch (error) {
                  console.error('Error parsing cards for hand:', error);
                  return [];
                }
              })(),
              betAmount: hand.bet_amount,
              status: hand.status,
              isTurn: hand.is_turn,
              insuranceBet: hand.insurance_bet,
              isSplit: hand.is_split,
            }));

            // Fetch players
            const playerIds = Array.from(new Set(parsedHands.map(h => h.playerId)));
            if (playerIds.length > 0) {
              const { data: playerData } = await supabase
                .from('players')
                .select('*')
                .in('id', playerIds);

              if (playerData && playerData.length > 0) {
                // Update game state with all fetched data
                set({
                  ...parsedGameState,
                  playerHands: parsedHands,
                  players: playerData,
                  isLoading: false,
                });
                return;
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing game data:', parseError);
          // If we can't parse the existing game, create a new one
        }
      }
      
      // If no valid game found or error parsing, create a new game
      const newGameId = crypto.randomUUID();
      const newGameState = {
        id: newGameId,
        deck: JSON.stringify([]),
        dealer_hand: JSON.stringify([]),
        dealer_score: 0,
        current_player_index: -1,
        game_phase: 'waiting',
        updated_at: new Date().toISOString(),
        timer: null,
      };
      
      const { error: insertError } = await supabase
        .from('game_state')
        .insert(newGameState);
      
      if (insertError) {
        console.error('Error creating new game:', insertError);
        // If we can't create a new game, just use local state
        set({ 
          ...INITIAL_STATE as GameState, 
          id: newGameId,
          isLoading: false 
        });
      } else {
        // Successfully created new game
        set({ 
          ...INITIAL_STATE as GameState, 
          id: newGameId,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Error initializing game state:', error);
      // Fallback to local state if all else fails
      set({ 
        ...INITIAL_STATE as GameState, 
        id: crypto.randomUUID(),
        isLoading: false 
      });
    }
  },

  // Sync current game state to database
  syncGameState: async () => {
    const { id, deck, dealerHand, dealerScore, currentPlayerIndex, gamePhase, timer, playerHands } = get();
    
    if (!id) {
      console.error('Cannot sync game state: No game ID');
      return;
    }
    
    try {
      // Update game state
      const { error: updateError } = await supabase
        .from('game_state')
        .upsert({
          id,
          deck: JSON.stringify(deck || []),
          dealer_hand: JSON.stringify(dealerHand || []),
          dealer_score: dealerScore || 0,
          current_player_index: currentPlayerIndex || -1,
          game_phase: gamePhase || 'waiting',
          updated_at: new Date().toISOString(),
          timer,
        });
      
      if (updateError) {
        console.error('Error updating game state:', updateError);
        return;
      }
      
      // Update player hands
      if (playerHands && playerHands.length > 0) {
        for (const hand of playerHands) {
          const { error: handError } = await supabase
            .from('player_hands')
            .upsert({
              id: hand.id,
              game_id: id,
              player_id: hand.playerId,
              seat_position: hand.seatPosition,
              cards: JSON.stringify(hand.cards || []),
              bet_amount: hand.betAmount || 0,
              status: hand.status || 'waiting',
              is_turn: hand.isTurn || false,
              insurance_bet: hand.insuranceBet || null,
              is_split: hand.isSplit || false,
            });
            
          if (handError) {
            console.error('Error updating player hand:', handError);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing game state:', error);
    }
  },

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
        // Create new player with 10K balance as per PRD
        const { data: newPlayer } = await supabase
          .from('players')
          .insert({
            name,
            balance: INITIAL_PLAYER_BALANCE, // Use constant for initial balance
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

      // Start a new round immediately when a player joins
      await get().startNewRound();
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

      // Sync state after player leaves
      await get().syncGameState();

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
    const { players, selectedSeat, id: gameId } = get();
    if (!selectedSeat || amount < 5 || amount > 1000) return;

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

      const handId = crypto.randomUUID();
      
      // Create hand in database
      await supabase.from('player_hands').insert({
        id: handId,
        game_id: gameId,
        player_id: player.id,
        seat_position: selectedSeat,
        cards: JSON.stringify([]),
        bet_amount: amount,
        status: 'betting',
        is_turn: false,
        insurance_bet: null,
        is_split: false,
      });

      // Update local state
      set(currentState => ({
        players: currentState.players.map(p => 
          p.id === player.id ? updatedPlayer : p
        ),
        currentBet: amount,
        playerHands: [
          ...currentState.playerHands,
          {
            id: handId,
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
      
      // Sync game state
      await get().syncGameState();
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
          
          // Sync game state after action
          await get().syncGameState();

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
          
          // Sync game state after action
          await get().syncGameState();

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
    try {
      const { players, id } = get();
      
      if (!id) {
        console.error('Cannot start new round: No game ID');
        return;
      }
      
      if (players.length === 0) {
        console.error('Cannot start new round: No players');
        return;
      }
      
      // Create a new shuffled deck
      const newDeck = createDeck();
      
      // Reset dealer hand with proper typing
      const dealerHand: Card[] = [];
      
      // Set game phase to betting
      set({
        deck: newDeck,
        dealerHand,
        dealerScore: 0,
        currentPlayerIndex: -1,
        gamePhase: 'betting',
        playerHands: [],
      });
      
      // Sync the updated game state to the database
      await get().syncGameState();
    } catch (error) {
      console.error('Error starting new round:', error);
    }
  },

  updateGameState: (newState: Partial<GameState>) => {
    set(newState);
    // Don't sync here as this is used by the realtime subscription
  },

  resetGame: () => {
    const newGameId = crypto.randomUUID();
    set({ ...INITIAL_STATE as GameState, id: newGameId });
    get().syncGameState();
  },

  moveToNextPlayer: async () => {
    const { currentPlayerIndex, playerHands } = get();
    const nextIndex = currentPlayerIndex + 1;

    if (nextIndex >= playerHands.length) {
      // All players have finished, move to dealer's turn
      set({ gamePhase: 'dealer_turn' });
      
      // Sync state before dealer plays
      await get().syncGameState();
      
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
      
      // Sync state after moving to next player
      await get().syncGameState();
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
    
    // Sync state after dealer plays
    await get().syncGameState();

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
      
      // Sync state after payouts
      await get().syncGameState();

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