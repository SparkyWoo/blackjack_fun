import { create } from 'zustand';
import { 
  createDeck, 
  dealCard, 
  calculateHandScore, 
  shouldDealerHit, 
  calculatePayout, 
  needsReshuffle,
  canSplit
} from './blackjack';
import type { GameState, Player, PlayerAction, Card, PlayerHand, HandStatus } from './types';
import { supabase } from './supabase';

// Constants
const INITIAL_PLAYER_BALANCE = 10000; // Ensure players start with 10K as per PRD
const RESHUFFLE_TIMER = 5; // 5 seconds for reshuffling animation

interface GameStore extends GameState {
  players: Player[];
  selectedSeat: number | null;
  currentBet: number;
  isLoading: boolean;
  
  // Game Actions
  joinGame: (name: string, seatPosition: number) => Promise<void>;
  leaveGame: (playerId: string) => Promise<void>;
  placeBet: (seatPosition: number, amount: number) => Promise<void>;
  takeAction: (action: PlayerAction) => Promise<void>;
  startNewRound: () => Promise<void>;
  moveToNextPlayer: () => Promise<void>;
  dealerPlay: () => Promise<void>;
  handlePayouts: () => Promise<void>;
  startBettingTimer: () => Promise<void>;
  
  // Game State Management
  updateGameState: (newState: Partial<GameState>) => void;
  resetGame: () => void;
  syncGameState: () => Promise<void>;
  initializeGameState: () => Promise<void>;
  dealInitialCards: () => Promise<void>;
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
        
        // Update last played timestamp
        await supabase
          .from('players')
          .update({ last_played_at: new Date().toISOString() })
          .eq('id', player.id);
      } else {
        // Create new player with 10K balance as per PRD
        const { data: newPlayer, error } = await supabase
          .from('players')
          .insert({
            name,
            balance: INITIAL_PLAYER_BALANCE, // Use constant for initial balance
            created_at: new Date().toISOString(),
            last_played_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error || !newPlayer) {
          console.error('Failed to create player:', error);
          throw new Error('Failed to create player');
        }
        
        player = newPlayer;
      }

      // Check if player is already in the game
      const isPlayerInGame = get().players.some(p => p.id === player.id);
      
      // Update state with the player and selected seat
      set(currentState => ({
        players: isPlayerInGame 
          ? currentState.players 
          : [...currentState.players, player],
        selectedSeat: seatPosition,
      }));

      console.log('Player joined:', player, 'at seat', seatPosition);

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

  placeBet: async (seatPosition: number, amount: number) => {
    const { players, id: gameId } = get();
    if (seatPosition === null || amount < 5 || amount > 1000) return;

    const player = players.find(p => {
      // Check if this player is at the selected seat
      const isLastPlayer = p.id === players[players.length - 1]?.id;
      const hasHandAtSeat = get().playerHands.some(h => h.playerId === p.id && h.seatPosition === seatPosition);
      return isLastPlayer || hasHandAtSeat;
    });
    
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
        seat_position: seatPosition,
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
        playerHands: [
          ...currentState.playerHands,
          {
            id: handId,
            playerId: player.id,
            seatPosition: seatPosition,
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
    const { deck, playerHands, players } = get();
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

        case 'double': {
          // Find the player who owns this hand
          const player = players.find(p => p.id === currentHand.playerId);
          if (!player) return;
          
          // Check if player has enough balance to double
          if (player.balance < currentHand.betAmount) return;
          
          // Update player balance in database
          const { data: updatedPlayer } = await supabase
            .from('players')
            .update({ balance: player.balance - currentHand.betAmount })
            .eq('id', player.id)
            .select()
            .single();
            
          if (!updatedPlayer) throw new Error('Failed to update player balance');
          
          // Deal one more card
          const { card, remainingDeck } = dealCard(deck);
          const newCards = [...currentHand.cards, card];
          const isBust = calculateHandScore(newCards) > 21;
          
          // Update hand in state
          set(currentState => ({
            deck: remainingDeck,
            players: currentState.players.map(p => 
              p.id === player.id ? updatedPlayer : p
            ),
            playerHands: currentState.playerHands.map(h =>
              h.id === currentHand.id
                ? {
                    ...h,
                    cards: newCards,
                    betAmount: h.betAmount * 2, // Double the bet
                    status: isBust ? 'bust' : 'double',
                    isTurn: false,
                  }
                : h
            ),
          }));
          
          // Sync game state after action
          await get().syncGameState();
          
          // Move to next player or dealer
          await get().moveToNextPlayer();
          break;
        }

        case 'split': {
          // Find the player who owns this hand
          const player = players.find(p => p.id === currentHand.playerId);
          if (!player) return;
          
          // Check if player has enough balance to split
          if (player.balance < currentHand.betAmount) return;
          
          // Check if hand can be split (should have exactly 2 cards of same rank)
          if (!canSplit(currentHand.cards)) return;
          
          // Update player balance in database
          const { data: updatedPlayer } = await supabase
            .from('players')
            .update({ balance: player.balance - currentHand.betAmount })
            .eq('id', player.id)
            .select()
            .single();
            
          if (!updatedPlayer) throw new Error('Failed to update player balance');
          
          // Create a new hand ID for the split hand
          const newHandId = crypto.randomUUID();
          
          // Deal one card to each hand
          const { card: card1, remainingDeck: deck1 } = dealCard(deck);
          const { card: card2, remainingDeck: deck2 } = dealCard(deck1);
          
          // Create the two new hands
          const firstHand = {
            ...currentHand,
            cards: [currentHand.cards[0], card1],
            isSplit: true,
            isTurn: true,
          };
          
          const secondHand: PlayerHand = {
            id: newHandId,
            playerId: currentHand.playerId,
            seatPosition: currentHand.seatPosition,
            cards: [currentHand.cards[1], card2],
            betAmount: currentHand.betAmount,
            status: 'active' as HandStatus,
            isTurn: false,
            insuranceBet: null,
            isSplit: true,
          };
          
          // Create the second hand in database
          await supabase.from('player_hands').insert({
            id: newHandId,
            game_id: get().id,
            player_id: player.id,
            seat_position: currentHand.seatPosition,
            cards: JSON.stringify([currentHand.cards[1], card2]),
            bet_amount: currentHand.betAmount,
            status: 'active' as HandStatus,
            is_turn: false,
            insurance_bet: null,
            is_split: true,
          });
          
          // Update state
          set(currentState => ({
            deck: deck2,
            players: currentState.players.map(p => 
              p.id === player.id ? updatedPlayer : p
            ),
            playerHands: [
              ...currentState.playerHands.filter(h => h.id !== currentHand.id),
              firstHand,
              secondHand,
            ],
          }));
          
          // Sync game state after action
          await get().syncGameState();
          break;
        }

        case 'surrender': {
          // Find the player who owns this hand
          const player = players.find(p => p.id === currentHand.playerId);
          if (!player) return;
          
          // Can only surrender on first two cards
          if (currentHand.cards.length !== 2) return;
          
          // Return half the bet to the player
          const refundAmount = Math.floor(currentHand.betAmount / 2);
          
          // Update player balance in database
          const { data: updatedPlayer } = await supabase
            .from('players')
            .update({ balance: player.balance + refundAmount })
            .eq('id', player.id)
            .select()
            .single();
            
          if (!updatedPlayer) throw new Error('Failed to update player balance');
          
          // Update hand status
          set(currentState => ({
            players: currentState.players.map(p => 
              p.id === player.id ? updatedPlayer : p
            ),
            playerHands: currentState.playerHands.map(h =>
              h.id === currentHand.id
                ? { ...h, status: 'surrender', isTurn: false }
                : h
            ),
          }));
          
          // Sync game state after action
          await get().syncGameState();
          
          // Move to next player or dealer
          await get().moveToNextPlayer();
          break;
        }

        case 'insurance': {
          // Find the player who owns this hand
          const player = players.find(p => p.id === currentHand.playerId);
          if (!player) return;
          
          // Can only take insurance when dealer's up card is an Ace
          const dealerUpCard = get().dealerHand[0];
          if (!dealerUpCard || dealerUpCard.rank !== 'A') return;
          
          // Insurance costs half the original bet
          const insuranceAmount = Math.floor(currentHand.betAmount / 2);
          
          // Check if player has enough balance
          if (player.balance < insuranceAmount) return;
          
          // Update player balance in database
          const { data: updatedPlayer } = await supabase
            .from('players')
            .update({ balance: player.balance - insuranceAmount })
            .eq('id', player.id)
            .select()
            .single();
            
          if (!updatedPlayer) throw new Error('Failed to update player balance');
          
          // Update hand with insurance bet
          set(currentState => ({
            players: currentState.players.map(p => 
              p.id === player.id ? updatedPlayer : p
            ),
            playerHands: currentState.playerHands.map(h =>
              h.id === currentHand.id
                ? { ...h, insuranceBet: insuranceAmount }
                : h
            ),
          }));
          
          // Sync game state after action
          await get().syncGameState();
          break;
        }
      }
    } catch (error) {
      console.error('Error taking action:', error);
      throw error;
    }
  },

  startNewRound: async () => {
    try {
      const { players, id, deck } = get();
      
      if (!id) {
        console.error('Cannot start new round: No game ID');
        return;
      }
      
      if (players.length === 0) {
        console.error('Cannot start new round: No players');
        return;
      }
      
      // Check if we need to reshuffle
      if (needsReshuffle(deck)) {
        // Set game phase to reshuffling with timer
        set({
          gamePhase: 'reshuffling',
          timer: RESHUFFLE_TIMER,
        });
        
        // Sync the updated game state to the database
        await get().syncGameState();
        
        // Start reshuffling countdown
        const reshuffleInterval = setInterval(async () => {
          const { timer, gamePhase } = get();
          
          // If game phase changed or timer reached 0, clear interval
          if (gamePhase !== 'reshuffling' || timer === null || timer <= 0) {
            clearInterval(reshuffleInterval);
            
            // When timer reaches 0, create a new deck and move to betting phase
            if (gamePhase === 'reshuffling' && (timer === null || timer <= 0)) {
              // Create a new shuffled deck
              const newDeck = createDeck();
              
              // Reset dealer hand
              const dealerHand: Card[] = [];
              
              // Set initial timer value for betting phase
              const initialTimer = 15;
              
              // Set game phase to betting with timer
              set({
                deck: newDeck,
                dealerHand,
                dealerScore: 0,
                currentPlayerIndex: -1,
                gamePhase: 'betting',
                playerHands: [],
                timer: initialTimer,
              });
              
              // Sync the updated game state to the database
              await get().syncGameState();
              
              // Start betting phase timer
              get().startBettingTimer();
            }
            return;
          }
          
          // Decrement timer
          set({ timer: timer - 1 });
          
          // Sync updated timer to database
          await get().syncGameState();
        }, 1000);
        
        return;
      }
      
      // Create a new shuffled deck if not reshuffling and no existing deck
      const newDeck = deck.length > 0 ? deck : createDeck();
      
      // Reset dealer hand with proper typing
      const dealerHand: Card[] = [];
      
      // Set initial timer value (15 seconds for betting phase)
      const initialTimer = 15;
      
      // Set game phase to betting with timer
      set({
        deck: newDeck,
        dealerHand,
        dealerScore: 0,
        currentPlayerIndex: -1,
        gamePhase: 'betting',
        playerHands: [],
        timer: initialTimer,
      });
      
      // Sync the updated game state to the database
      await get().syncGameState();
      
      // Start betting phase timer
      get().startBettingTimer();
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

  // Add a new function to deal initial cards
  dealInitialCards: async () => {
    try {
      const { deck, playerHands } = get();
      let currentDeck = [...deck];
      let updatedHands = [...playerHands];
      const dealerCards: Card[] = [];
      
      // Deal first card to each player
      for (let i = 0; i < updatedHands.length; i++) {
        const { card, remainingDeck } = dealCard(currentDeck, true);
        updatedHands[i] = {
          ...updatedHands[i],
          cards: [card],
          status: 'active',
        };
        currentDeck = remainingDeck;
      }
      
      // Deal first card to dealer (face up)
      const { card: dealerCard1, remainingDeck: deckAfterDealerCard1 } = dealCard(currentDeck, true);
      dealerCards.push(dealerCard1);
      currentDeck = deckAfterDealerCard1;
      
      // Deal second card to each player
      for (let i = 0; i < updatedHands.length; i++) {
        const { card, remainingDeck } = dealCard(currentDeck, true);
        updatedHands[i] = {
          ...updatedHands[i],
          cards: [...updatedHands[i].cards, card],
        };
        currentDeck = remainingDeck;
      }
      
      // Deal second card to dealer (face down)
      const { card: dealerCard2, remainingDeck: deckAfterDealerCard2 } = dealCard(currentDeck, false);
      dealerCards.push(dealerCard2);
      currentDeck = deckAfterDealerCard2;
      
      // Check for player blackjacks
      updatedHands = updatedHands.map(hand => {
        const score = calculateHandScore(hand.cards);
        if (score === 21 && hand.cards.length === 2) {
          return { ...hand, status: 'blackjack' };
        }
        return hand;
      });
      
      // Set the first player's turn
      if (updatedHands.length > 0) {
        updatedHands[0] = { ...updatedHands[0], isTurn: true };
      }
      
      // Update state with dealt cards
      set({
        deck: currentDeck,
        dealerHand: dealerCards,
        dealerScore: calculateHandScore(dealerCards.filter(c => c.isFaceUp)),
        playerHands: updatedHands,
        gamePhase: 'player_turns',
        currentPlayerIndex: 0,
        timer: null,
      });
      
      // Sync the updated game state to the database
      await get().syncGameState();
    } catch (error) {
      console.error('Error dealing initial cards:', error);
    }
  },

  // Helper function to start the betting timer
  startBettingTimer: async () => {
    const timerInterval = setInterval(async () => {
      const { timer, gamePhase } = get();
      
      // If game phase changed or timer reached 0, clear interval
      if (gamePhase !== 'betting' || timer === null || timer <= 0) {
        clearInterval(timerInterval);
        return;
      }
      
      // Decrement timer
      set({ timer: timer - 1 });
      
      // Sync updated timer to database
      await get().syncGameState();
      
      // When timer reaches 0, move to next phase
      if (timer <= 1) {
        clearInterval(timerInterval);
        
        // Deal cards to players and dealer
        await get().dealInitialCards();
      }
    }, 1000);
  },
})); 