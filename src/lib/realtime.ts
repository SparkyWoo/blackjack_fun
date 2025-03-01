import { useEffect } from 'react';
import { supabase } from './supabase';
import { useGameStore } from './store';
import type { GameState, PlayerHand } from './types';

// Type for game state updates from Supabase
interface GameStateUpdate {
  id: string;
  deck: string; // JSON string of deck
  dealer_hand: string; // JSON string of dealer hand
  dealer_score: number;
  current_player_index: number;
  game_phase: string;
  updated_at: string;
}

// Type for player hand updates from Supabase
interface PlayerHandUpdate {
  id: string;
  game_id: string;
  player_id: string;
  seat_position: number;
  cards: string; // JSON string of cards
  bet_amount: number;
  status: string;
  is_turn: boolean;
  insurance_bet: number | null;
  is_split: boolean;
}

// Type for player updates from Supabase
interface PlayerUpdate {
  id: string;
  name: string;
  balance: number;
  last_played_at: string;
}

/**
 * Hook to subscribe to real-time game updates
 */
export function useRealtimeGame() {
  const { 
    id: gameId, 
    updateGameState, 
    players
  } = useGameStore();

  useEffect(() => {
    if (!gameId) return;

    // Subscribe to game state changes
    const gameSubscription = supabase
      .channel('game_state_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_state',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const update = payload.new as GameStateUpdate;
          
          // Parse JSON strings back to objects
          const parsedUpdate: Partial<GameState> = {
            id: update.id,
            deck: (() => {
              try {
                return typeof update.deck === 'string' ? JSON.parse(update.deck) : update.deck;
              } catch (error) {
                console.error('Error parsing deck:', error);
                return [];
              }
            })(),
            dealerHand: (() => {
              try {
                return typeof update.dealer_hand === 'string' ? JSON.parse(update.dealer_hand) : update.dealer_hand;
              } catch (error) {
                console.error('Error parsing dealer hand:', error);
                return [];
              }
            })(),
            dealerScore: update.dealer_score,
            currentPlayerIndex: update.current_player_index,
            gamePhase: update.game_phase as GameState['gamePhase'],
            updatedAt: update.updated_at,
          };
          
          updateGameState(parsedUpdate);
        }
      )
      .subscribe();

    // Subscribe to player hand changes
    const handSubscription = supabase
      .channel('player_hand_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'player_hands',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            // Handle hand removal
            const handId = payload.old.id;
            useGameStore.setState((state) => ({
              playerHands: state.playerHands.filter(h => h.id !== handId)
            }));
            return;
          }
          
          const update = payload.new as PlayerHandUpdate;
          
          // Parse JSON string back to object
          const parsedHand: PlayerHand = {
            id: update.id,
            playerId: update.player_id,
            seatPosition: update.seat_position,
            cards: (() => {
              try {
                return typeof update.cards === 'string' ? JSON.parse(update.cards) : update.cards;
              } catch (error) {
                console.error('Error parsing cards:', error);
                return [];
              }
            })(),
            betAmount: update.bet_amount,
            status: update.status as PlayerHand['status'],
            isTurn: update.is_turn,
            insuranceBet: update.insurance_bet,
            isSplit: update.is_split,
          };
          
          // Update or add the hand
          useGameStore.setState((state) => {
            const existingHandIndex = state.playerHands.findIndex(h => h.id === parsedHand.id);
            
            if (existingHandIndex >= 0) {
              // Update existing hand
              const updatedHands = [...state.playerHands];
              updatedHands[existingHandIndex] = parsedHand;
              return { playerHands: updatedHands };
            } else {
              // Add new hand
              return { playerHands: [...state.playerHands, parsedHand] };
            }
          });
        }
      )
      .subscribe();

    // Subscribe to player changes
    const playerSubscription = supabase
      .channel('player_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `id=in.(${players.map(p => p.id).join(',')})`,
        },
        (payload) => {
          const update = payload.new as PlayerUpdate;
          
          // Update player
          useGameStore.setState((state) => {
            const updatedPlayers = state.players.map(p => 
              p.id === update.id 
                ? { ...p, balance: update.balance, lastPlayedAt: update.last_played_at }
                : p
            );
            
            return { players: updatedPlayers };
          });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      gameSubscription.unsubscribe();
      handSubscription.unsubscribe();
      playerSubscription.unsubscribe();
    };
  }, [gameId, updateGameState, players]);

  // We don't need this function anymore as it's handled in store.ts
  // This prevents duplicate initialization and potential infinite loops
  return { 
    // Empty object to maintain the same return type
  };
} 