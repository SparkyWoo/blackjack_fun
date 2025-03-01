import React, { useEffect } from 'react';
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
    leaveGame,
    placeBet,
    takeAction,
  } = useGameStore();

  // Calculate seat positions in a semi-circle
  const seatPositions = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 5) * (i - 2.5);
    const x = Math.cos(angle) * 300;
    const y = Math.sin(angle) * 150;
    return { x, y };
  });

  // Handle player actions
  const handleAction = async (action: 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance') => {
    await takeAction(action);
  };

  // Get current player's hand
  const currentHand = playerHands.find(h => h.isTurn);

  return (
    <div className="relative w-full h-screen bg-green-800 overflow-hidden">
      {/* Dealer Area */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <Dealer
          cards={dealerHand}
          score={dealerScore}
        />
      </div>

      {/* Player Seats */}
      {seatPositions.map((pos, index) => {
        const player = players.find(p => 
          playerHands.some(h => h.playerId === p.id && h.seatPosition === index)
        );
        const hand = playerHands.find(h => h.seatPosition === index);

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '50%',
              transform: `translate(${pos.x}px, ${pos.y}px)`,
            }}
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

      {/* Action Controls */}
      {currentHand && gamePhase === 'player_turns' && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
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
      )}

      {/* Betting Controls */}
      {selectedSeat !== null && gamePhase === 'betting' && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <BetControls
            onPlaceBet={placeBet}
            playerBalance={players.find(p => 
              playerHands.some(h => h.playerId === p.id && h.seatPosition === selectedSeat)
            )?.balance || 0}
          />
        </div>
      )}

      {/* Game Phase Indicator */}
      <div className="absolute top-4 left-4 text-white font-bold">
        Phase: {gamePhase.replace('_', ' ').toUpperCase()}
      </div>
    </div>
  );
} 