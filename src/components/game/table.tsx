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
import { motion, AnimatePresence } from 'framer-motion';

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
    resetGame,
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

  // Handle game reset
  const handleResetGame = async () => {
    if (window.confirm('Are you sure you want to reset the game? This will clear all current game data.')) {
      try {
        await resetGame();
        await initializeGameState();
      } catch (error) {
        console.error('Failed to reset game:', error);
      }
    }
  };

  // Calculate seat positions in a horizontal line
  const seatPositions = Array.from({ length: 7 }, (_, i) => {
    // Create a horizontal arrangement
    const totalWidth = 700; // Total width of the arrangement
    const seatWidth = totalWidth / 7; // Width per seat
    const startX = -totalWidth / 2 + seatWidth / 2; // Start from the left
    
    return {
      x: startX + (i * seatWidth), // Position horizontally
      y: 220, // Vertical position to move seats lower and make room for cards
    };
  });

  // Handle player actions
  const handleAction = async (action: 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance') => {
    try {
      console.log(`Taking action: ${action}`);
      await takeAction(action);
    } catch (error) {
      console.error(`Error taking action ${action}:`, error);
    }
  };

  // Get current player's hand
  const currentHand = playerHands.find(h => h.isTurn);

  // Function to get the game phase display text
  const getGamePhaseDisplay = (phase: GamePhase): string => {
    switch (phase) {
      case 'waiting':
        return 'WAITING FOR PLAYERS';
      case 'betting':
        return 'PLACE YOUR BETS';
      case 'player_turns':
        return 'PLAYER TURN';
      case 'dealer_turn':
        return 'DEALER TURN';
      case 'payout':
        return 'SHOWDOWN';
      case 'reshuffling':
        return 'RESHUFFLING';
      default:
        return String(phase).replace('_', ' ').toUpperCase();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-green-900 to-green-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass p-6 rounded-lg border border-white/10 shadow-lg"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
            <h2 className="text-xl font-bold text-white">Loading Game</h2>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background with gradient and texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#073a21] via-[#0a5c36] to-[#084a2b] z-0">
        {/* Table texture overlay */}
        <div className="absolute inset-0 bg-[url('/table-texture.svg')] bg-repeat opacity-10"></div>
        
        {/* Ambient light effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-yellow-400/5 blur-3xl"></div>
      </div>
      
      {/* Main table surface */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Game Phase Indicator */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={gamePhase}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30"
          >
            <div className="px-3 py-1 glass rounded-md text-white text-xs font-medium tracking-wider">
              {getGamePhaseDisplay(gamePhase)}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Reset Game Button */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleResetGame}
            className="px-3 py-1.5 glass rounded-md text-white text-xs font-medium hover:bg-red-800/30 transition-colors duration-200 flex items-center"
          >
            <span className="mr-1">🔄</span>
            Reset Game
          </button>
        </div>

        {/* Table felt with border */}
        <div className="relative w-[750px] h-[420px] rounded-[50%] vlackjack-table overflow-hidden">
          {/* Table felt texture */}
          <div className="absolute inset-0 bg-[url('/felt-texture.svg')] bg-repeat opacity-20"></div>
          
          {/* Dealer Area - Centered at the top */}
          <div className="absolute top-[12%] left-1/2 transform -translate-x-1/2 z-20">
            <Dealer
              cards={dealerHand}
              score={dealerScore}
            />
          </div>

          {/* Player Seats - Positioned below the dealer with enough space for cards */}
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
              const isCurrentTurn = hand?.isTurn;

              return (
                <motion.div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: `${pos.y}px`,
                    left: `calc(50% + ${pos.x}px)`,
                    transform: 'translate(-50%, 0)',
                  }}
                  animate={isCurrentTurn ? { 
                    scale: [1, 1.02, 1],
                    transition: { 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut" 
                    }
                  } : {}}
                  className="z-20"
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
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Controls - Always at the bottom for the current player */}
        <AnimatePresence>
          {gamePhase === 'player_turns' && currentHand && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30"
            >
              <div className="p-2 glass rounded-md border border-white/10 shadow-md">
                <Actions
                  onAction={handleAction}
                  canHit={!!currentHand && currentHand.status === 'active'}
                  canStand={!!currentHand && currentHand.status === 'active'}
                  canDouble={!!currentHand && currentHand.status === 'active' && canDoubleDown(currentHand.cards)}
                  canSplit={!!currentHand && currentHand.status === 'active' && canSplit(currentHand.cards)}
                  canSurrender={!!currentHand && currentHand.status === 'active' && canSurrender(currentHand.cards)}
                  canInsurance={!!dealerHand[0] && dealerHand[0].rank === 'A' && currentHand?.status === 'active'}
                  timer={timer}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer Display */}
        <AnimatePresence>
          {gamePhase === 'betting' && timer !== null && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="px-3 py-1 glass rounded-md text-white text-xs">
                <span className="text-yellow-400 mr-1">⏱</span>
                <span>{timer}s</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reshuffling Timer Display */}
        <AnimatePresence>
          {gamePhase === 'reshuffling' && timer !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <motion.div 
                animate={{ 
                  boxShadow: ['0 0 10px rgba(234, 179, 8, 0.2)', '0 0 20px rgba(234, 179, 8, 0.3)', '0 0 10px rgba(234, 179, 8, 0.2)'],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="px-4 py-2 glass rounded-md border border-yellow-500/20"
              >
                <div className="text-white font-bold text-base flex flex-col items-center">
                  <span className="mb-1">RESHUFFLING</span>
                  <span className="text-sm">{timer}s</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Betting Controls */}
        <AnimatePresence>
          {gamePhase === 'betting' && selectedSeat !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="fixed bottom-0 left-0 right-0 flex justify-center items-center z-50 pb-4"
            >
              <div className="glass p-2 rounded-md border border-yellow-500/20 shadow-md max-w-sm w-full mx-auto">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 