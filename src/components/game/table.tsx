'use client';

import React, { useEffect } from 'react';
import { Dealer } from '@/components/game/dealer';
import { PlayerSeat } from '@/components/game/player-seat';
import { Actions } from '@/components/game/actions';
import { BetControls } from '@/components/game/bet-controls';
import { useGameStore } from '@/lib/store';
import { useRealtimeGame } from '@/lib/realtime';
import { canDoubleDown, canSplit, canSurrender } from '@/lib/blackjack';
import type { GamePhase } from '@/lib/types';

export function Table() {
  const {
    players,
    playerHands,
    dealerHand,
    dealerScore,
    currentPlayerIndex,
    gamePhase,
    selectedSeat,
    isLoading,
    timer,
    joinGame,
    placeBet,
    takeAction,
    initializeGameState,
  } = useGameStore();
  
  // Initialize real-time subscriptions
  useRealtimeGame();

  // Initialize game state on component mount
  useEffect(() => {
    const loadGame = async () => {
      try {
        await initializeGameState();
      } catch (error) {
        console.error('Failed to initialize game state:', error);
      }
    };
    
    loadGame();
    // Only depend on initializeGameState to prevent unnecessary re-renders
  }, [initializeGameState]);

  // Calculate seat positions in a horizontal line
  const seatPositions = Array.from({ length: 7 }, (_, i) => {
    // Create a horizontal arrangement
    const totalWidth = 800; // Total width of the arrangement
    const seatWidth = totalWidth / 7; // Width per seat
    const startX = -totalWidth / 2 + seatWidth / 2; // Start from the left
    
    return {
      x: startX + (i * seatWidth), // Position horizontally
      y: 250, // Increased vertical position to move seats lower
    };
  });

  // Handle player actions
  const handleAction = async (action: 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance') => {
    await takeAction(action);
  };

  // Get current player's hand
  const currentHand = playerHands.find(h => h.isTurn);

  // Function to get the game phase display text
  const getGamePhaseDisplay = (phase: GamePhase): string => {
    switch (phase) {
      case 'waiting':
        return '🕒 WAITING FOR PLAYERS';
      case 'betting':
        return '💰 PLACE YOUR BETS';
      case 'player_turns':
        return '👤 PLAYER TURNS';
      case 'dealer_turn':
        return '🎩 DEALER TURN';
      case 'payout':
        return '🏆 SHOWDOWN';
      default:
        // Handle any unexpected phase values
        return `${String(phase).replace('_', ' ').toUpperCase()}`;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-green-900">
        <div className="bg-black/50 p-8 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-2xl font-bold text-white">Loading Game...</h2>
            <p className="text-gray-300 mt-2">Connecting to the blackjack table</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background with gradient and texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-green-700 z-0">
        {/* Table texture overlay */}
        <div className="absolute inset-0 bg-[url('/table-texture.svg')] bg-repeat opacity-10"></div>
        
        {/* Ambient light effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-yellow-400/10 blur-3xl"></div>
      </div>
      
      {/* Main table surface */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Game Phase Indicator */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
          <div className="relative">
            <div className="absolute inset-0 bg-black/20 rounded-full blur-md"></div>
            <div className="relative px-6 py-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
              <span className="text-white font-bold tracking-wider">
                {getGamePhaseDisplay(gamePhase)}
              </span>
            </div>
          </div>
        </div>

        {/* Table felt with border */}
        <div className="relative w-[900px] h-[500px] rounded-[50%] bg-green-700 border-8 border-brown-800 shadow-2xl overflow-hidden">
          {/* Table felt texture */}
          <div className="absolute inset-0 bg-[url('/felt-texture.svg')] bg-repeat opacity-20"></div>
          
          {/* Table inner border */}
          <div className="absolute inset-4 rounded-[50%] border-2 border-dashed border-yellow-500/20"></div>
          
          {/* Dealer Area - Centered at the top */}
          <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2 z-20">
            <Dealer
              cards={dealerHand}
              score={dealerScore}
            />
          </div>

          {/* Player Seats - Positioned below the dealer */}
          <div className="absolute bottom-[15%] left-0 w-full">
            {seatPositions.map((pos, index) => {
              // Only show seats 0-6 (7 seats total)
              if (index > 6) return null;
              
              // Find player at this seat position
              const player = players.find(p => {
                // Check if this player is at this seat position
                if (index === selectedSeat && p.id === players[players.length - 1]?.id) {
                  return true;
                }
                // Or check if they have a hand at this position
                return playerHands.some(h => h.playerId === p.id && h.seatPosition === index);
              });
              
              const hand = playerHands.find(h => h.seatPosition === index);
              
              const isOccupied = index === selectedSeat || !!player;

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: `${pos.y}px`,
                    left: `calc(50% + ${pos.x}px)`,
                    transform: 'translate(-50%, 0)',
                  }}
                  className="transition-all duration-500 ease-in-out hover:scale-105 z-20"
                >
                  <PlayerSeat
                    seatNumber={index}
                    player={player}
                    hand={hand}
                    onJoin={(seatNumber) => {
                      const playerName = prompt('Enter your name:');
                      if (playerName) {
                        joinGame(playerName, seatNumber);
                      }
                    }}
                    isCurrentPlayer={currentPlayerIndex === index}
                    isOccupied={isOccupied}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls - Always at the bottom */}
        {currentHand && gamePhase === 'player_turns' && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
            <div className="p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
              <Actions
                onAction={handleAction}
                canHit={true}
                canStand={true}
                canDouble={canDoubleDown(currentHand.cards)}
                canSplit={canSplit(currentHand.cards)}
                canSurrender={canSurrender(currentHand.cards)}
                canInsurance={dealerHand[0]?.rank === 'A'}
                timer={timer}
              />
            </div>
          </div>
        )}

        {/* Timer Display */}
        {gamePhase === 'betting' && timer !== null && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="px-6 py-3 bg-black/70 rounded-xl border border-yellow-500/30 shadow-lg">
              <div className="text-white font-bold text-xl flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Betting ends in: {timer}s
              </div>
            </div>
          </div>
        )}

        {/* Betting Controls */}
        {gamePhase === 'betting' && selectedSeat !== null && (
          <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center z-50 pb-8">
            <div className="bg-black/80 p-4 rounded-xl border border-yellow-500/30 shadow-lg max-w-md w-full mx-auto">
              <BetControls
                onPlaceBet={(amount) => {
                  if (selectedSeat !== null) {
                    placeBet(selectedSeat, amount);
                  }
                }}
                playerBalance={(() => {
                  // Find the current player based on the selected seat
                  const currentPlayer = players.find(p => {
                    // Check if this player is the one who joined at the selected seat
                    if (p.id === players[players.length - 1]?.id && selectedSeat !== null) {
                      return true;
                    }
                    // Or check if this player has a hand at the selected seat
                    return playerHands.some(h => h.playerId === p.id && h.seatPosition === selectedSeat);
                  });
                  return currentPlayer?.balance || 0;
                })()}
                existingBet={playerHands.find(h => h.seatPosition === selectedSeat)?.betAmount || 0}
                className="w-full"
              />
            </div>
          </div>
        )}
        
        {/* Connection Status Indicator */}
        <div className="absolute bottom-2 right-2 z-30 flex items-center space-x-2 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-white">Live</span>
        </div>
      </div>
    </div>
  );
} 