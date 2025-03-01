'use client';

import React from 'react';
import { Dealer } from '@/components/game/dealer';
import { PlayerSeat } from '@/components/game/player-seat';
import { Actions } from '@/components/game/actions';
import { BetControls } from '@/components/game/bet-controls';
import { useGameStore } from '@/lib/store';
import { canDoubleDown, canSplit, canSurrender } from '@/lib/blackjack';

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

  // Calculate seat positions horizontally
  const seatPositions = Array.from({ length: 5 }, (_, i) => {
    const spacing = 200; // Space between seats
    const totalWidth = spacing * 4; // Total width for all seats
    const startX = -totalWidth / 2; // Start from the left
    return {
      x: startX + (i * spacing),
      y: 0,
    };
  });

  // Handle player actions
  const handleAction = async (action: 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance') => {
    await takeAction(action);
  };

  // Get current player's hand
  const currentHand = playerHands.find(h => h.isTurn);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-green-900 to-green-800 overflow-hidden flex flex-col items-center justify-center">
      {/* Game Phase Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/30 px-6 py-2 rounded-full">
        <span className="text-white font-bold">
          Phase: {gamePhase.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Dealer Area */}
      <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2">
        <div className="p-8 rounded-full bg-black/20">
          <Dealer
            cards={dealerHand}
            score={dealerScore}
          />
        </div>
      </div>

      {/* Player Seats */}
      <div className="absolute bottom-[25%] left-1/2 transform -translate-x-1/2 flex justify-center items-end space-x-4">
        {seatPositions.map((pos, index) => {
          const player = players.find(p => 
            playerHands.some(h => h.playerId === p.id && h.seatPosition === index)
          );
          const hand = playerHands.find(h => h.seatPosition === index);

          return (
            <div
              key={index}
              style={{
                transform: `translateX(${pos.x}px)`,
              }}
              className="transition-all duration-300 ease-in-out hover:scale-105"
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

      {/* Action Controls */}
      {currentHand && gamePhase === 'player_turns' && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="p-4 bg-black/30 rounded-lg backdrop-blur-sm">
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
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="p-6 bg-black/30 rounded-lg backdrop-blur-sm">
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
  );
} 