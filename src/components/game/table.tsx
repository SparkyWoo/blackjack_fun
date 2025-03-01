'use client';

import React, { useEffect } from 'react';
import { Dealer } from '@/components/game/dealer';
import { PlayerSeat } from '@/components/game/player-seat';
import { Actions } from '@/components/game/actions';
import { BetControls } from '@/components/game/bet-controls';
import { useGameStore } from '@/lib/store';
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
    timer,
    joinGame,
    placeBet,
    takeAction,
  } = useGameStore();

  // Calculate seat positions in a semi-circle
  const seatPositions = Array.from({ length: 7 }, (_, i) => {
    // Create a semi-circle arrangement
    const radius = 350; // Radius of the semi-circle
    const totalAngle = 180; // Degrees in a semi-circle
    const angleStep = totalAngle / (7 - 1); // Angle between each seat
    const angle = (i * angleStep) * (Math.PI / 180); // Convert to radians
    
    return {
      x: radius * Math.sin(angle) - (radius / 2), // Adjust to center
      y: radius * Math.cos(angle) - 50, // Offset from bottom
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

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background with gradient and texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-green-700 z-0">
        {/* Table texture overlay */}
        <div className="absolute inset-0 bg-[url('/table-texture.png')] bg-repeat opacity-10"></div>
        
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
          <div className="absolute inset-0 bg-[url('/felt-texture.png')] bg-repeat opacity-20"></div>
          
          {/* Table inner border */}
          <div className="absolute inset-4 rounded-[50%] border-2 border-dashed border-yellow-500/20"></div>
          
          {/* Dealer Area */}
          <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 z-20">
            <Dealer
              cards={dealerHand}
              score={dealerScore}
            />
          </div>

          {/* Player Seats */}
          <div className="absolute bottom-0 left-0 w-full h-full">
            {seatPositions.map((pos, index) => {
              // Only show seats 0-6 (7 seats total)
              if (index > 6) return null;
              
              const player = players.find(p => 
                playerHands.some(h => h.playerId === p.id && h.seatPosition === index)
              );
              const hand = playerHands.find(h => h.seatPosition === index);

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    bottom: `${pos.y}px`,
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
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
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

        {/* Betting Controls */}
        {selectedSeat !== null && gamePhase === 'betting' && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
            <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
              <BetControls
                onPlaceBet={placeBet}
                playerBalance={players.find(p => 
                  playerHands.some(h => h.playerId === p.id && h.seatPosition === selectedSeat)
                )?.balance || 0}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 