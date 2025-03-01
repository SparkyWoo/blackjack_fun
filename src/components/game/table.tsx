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
      y: 280, // Increased vertical position to move seats lower and make room for cards
    };
  });

  // Handle player actions
  const handleAction = async (action: 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance') => {
    await takeAction(action);
  };

  // Get current player's hand
  const currentHand = playerHands.find(h => h.isTurn);

  // Function to get the game phase display text
  const getGamePhaseDisplay = (phase: GamePhase): { text: string; icon: string } => {
    switch (phase) {
      case 'waiting':
        return { text: 'WAITING FOR PLAYERS', icon: '🕒' };
      case 'betting':
        return { text: 'PLACE YOUR BETS', icon: '💰' };
      case 'player_turns':
        return { text: 'PLAYER TURNS', icon: '👤' };
      case 'dealer_turn':
        return { text: 'DEALER TURN', icon: '🎩' };
      case 'payout':
        return { text: 'SHOWDOWN', icon: '🏆' };
      case 'reshuffling':
        return { text: 'RESHUFFLING DECKS', icon: '🔄' };
      default:
        // Handle any unexpected phase values
        return { 
          text: String(phase).replace('_', ' ').toUpperCase(),
          icon: '♠️'
        };
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-green-900 to-green-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-black/50 p-8 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-2xl font-bold text-white">Loading Game...</h2>
            <p className="text-gray-300 mt-2">Connecting to the blackjack table</p>
          </div>
        </motion.div>
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
        
        {/* Additional ambient lights */}
        <div className="absolute top-3/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-400/5 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-400/5 blur-3xl"></div>
      </div>
      
      {/* Main table surface */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Game Phase Indicator */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={gamePhase}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-black/20 rounded-full blur-md"></div>
              <div className="relative px-6 py-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/10 shadow-lg">
                <span className="text-white font-bold tracking-wider flex items-center gap-2">
                  <span>{getGamePhaseDisplay(gamePhase).icon}</span>
                  <span>{getGamePhaseDisplay(gamePhase).text}</span>
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Table felt with border */}
        <div className="relative w-[900px] h-[500px] rounded-[50%] bg-green-700 border-8 border-brown-800 shadow-2xl overflow-hidden">
          {/* Table felt texture */}
          <div className="absolute inset-0 bg-[url('/felt-texture.svg')] bg-repeat opacity-20"></div>
          
          {/* Table inner border */}
          <div className="absolute inset-4 rounded-[50%] border-2 border-dashed border-yellow-500/20"></div>
          
          {/* Table center logo/emblem */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-green-800/50 flex items-center justify-center">
            <div className="text-4xl opacity-20">♠️</div>
          </div>
          
          {/* Dealer Area - Centered at the top */}
          <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 z-20">
            <Dealer
              cards={dealerHand}
              score={dealerScore}
              className="dealer-area"
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
                    scale: [1, 1.05, 1],
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
          {gamePhase === 'player_turns' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
            >
              <div className="p-4 bg-black/70 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="px-4 py-2 bg-black/70 rounded-lg border border-yellow-500/30 shadow-lg">
                <div className="text-white font-medium text-base">
                  Betting: {timer}s
                </div>
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
                  boxShadow: ['0 0 20px rgba(234, 179, 8, 0.2)', '0 0 40px rgba(234, 179, 8, 0.4)', '0 0 20px rgba(234, 179, 8, 0.2)'],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="px-8 py-6 bg-black/80 rounded-xl border border-yellow-500/50"
              >
                <div className="text-white font-bold text-2xl flex flex-col items-center">
                  <span className="mb-2">RESHUFFLING DECKS</span>
                  <span className="text-xl">{timer}s</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Betting Controls */}
        <AnimatePresence>
          {gamePhase === 'betting' && selectedSeat !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="fixed bottom-0 left-0 right-0 flex justify-center items-center z-50 pb-8"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Connection Status Indicator */}
        <div className="absolute bottom-2 right-2 z-30 flex items-center space-x-2 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full shadow-lg">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-2 h-2 rounded-full bg-green-500"
          ></motion.div>
          <span className="text-xs text-white">Live</span>
        </div>
      </div>
    </div>
  );
} 