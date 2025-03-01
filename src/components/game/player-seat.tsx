'use client';

import React from 'react';
import { Card } from '@/components/game/card';
import { Chip } from '@/components/game/chip';
import type { PlayerHand, Player } from '@/lib/types';

interface PlayerSeatProps {
  seatNumber: number;
  player?: Player;
  hand?: PlayerHand;
  onJoin?: (seatNumber: number) => void;
  isCurrentPlayer?: boolean;
  isOccupied?: boolean;
  className?: string;
}

export function PlayerSeat({
  seatNumber,
  player,
  hand,
  onJoin,
  isCurrentPlayer = false,
  isOccupied = false,
  className = '',
}: PlayerSeatProps) {
  const isEmpty = !player;
  const hasHand = hand && hand.cards.length > 0;
  
  // Calculate score from cards
  const calculateScore = (cards: PlayerHand['cards']) => {
    let score = 0;
    let aces = 0;
    
    for (const card of cards) {
      if (!card.isFaceUp) continue;
      
      if (card.rank === 'A') {
        aces += 1;
        score += 11;
      } else if (['K', 'Q', 'J'].includes(card.rank)) {
        score += 10;
      } else {
        score += parseInt(card.rank);
      }
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    
    return score;
  };
  
  // Get status color
  const getStatusColor = (status: PlayerHand['status']) => {
    switch (status) {
      case 'won':
        return 'bg-gradient-to-r from-green-600 to-green-500 border-green-400';
      case 'blackjack':
        return 'bg-gradient-to-r from-yellow-500 to-amber-400 border-yellow-300';
      case 'lost':
        return 'bg-gradient-to-r from-red-600 to-red-500 border-red-400';
      case 'bust':
        return 'bg-gradient-to-r from-red-600 to-red-500 border-red-400';
      case 'push':
        return 'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400';
      case 'surrender':
        return 'bg-gradient-to-r from-gray-600 to-gray-500 border-gray-400';
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400';
    }
  };
  
  // Get status text
  const getStatusText = (status: PlayerHand['status']) => {
    switch (status) {
      case 'blackjack':
        return 'BLACKJACK!';
      case 'bust':
        return 'BUST!';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div
      className={`
        relative flex flex-col items-center
        min-w-[200px] p-4 rounded-xl
        ${isEmpty ? 'opacity-90 hover:opacity-100' : ''}
        ${isCurrentPlayer 
          ? 'ring-4 ring-yellow-400/50 bg-black/40 shadow-lg shadow-yellow-400/20' 
          : 'bg-black/30 shadow-lg'
        }
        ${isOccupied && !player ? 'ring-2 ring-green-400/50' : ''}
        backdrop-blur-sm transition-all duration-300 ease-in-out
        border border-white/10
        ${className}
      `}
    >
      {/* Seat Number */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center border border-white/20">
        <span className="text-white font-bold text-sm">{seatNumber + 1}</span>
      </div>
      
      {/* Player Info */}
      <div className="mb-4 text-center w-full">
        {isEmpty && !isOccupied ? (
          <button
            onClick={() => onJoin?.(seatNumber)}
            className="w-full px-6 py-3 
                     bg-gradient-to-r from-blue-600 to-blue-500 
                     text-white rounded-lg 
                     hover:from-blue-500 hover:to-blue-400 
                     transition-all duration-200 font-medium
                     shadow-lg hover:shadow-xl 
                     transform hover:-translate-y-0.5 active:translate-y-0
                     border border-white/10"
          >
            Join Seat {seatNumber + 1}
          </button>
        ) : player ? (
          <div className="space-y-2">
            <div className="font-bold text-white text-lg tracking-wide flex items-center justify-center">
              {player.name}
              <span className="ml-2 bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
            </div>
            <div className="text-sm text-white bg-black/40 px-4 py-1.5 rounded-full inline-block border border-white/10 shadow-inner">
              ${player.balance.toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="font-bold text-white text-lg tracking-wide flex items-center justify-center">
              Reserved
            </div>
          </div>
        )}
      </div>

      {/* Cards - Display above the player with clear positioning */}
      {hasHand && (
        <div className="player-cards-fan">
          <div className="relative flex justify-center">
            {hand.cards.map((card, index) => {
              // Calculate rotation and offset for fan effect
              // For player, we want a vertical fan (cards pointing upward)
              const rotation = (index - (hand.cards.length - 1) / 2) * 10; // Rotation for fan effect
              const translateX = (index - (hand.cards.length - 1) / 2) * 25; // Horizontal spread
              const translateY = -index * 5; // Slight vertical staggering (negative to go upward)
              
              return (
                <div
                  key={`player-${seatNumber}-${card.suit}-${card.rank}-${index}`}
                  className="absolute transition-all duration-500 ease-in-out"
                  style={{
                    transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                    zIndex: 10 + index
                  }}
                >
                  <Card
                    card={card}
                    isDealing={false}
                    className="shadow-xl"
                  />
                </div>
              );
            })}
            
            {/* Score Badge - More prominent */}
            {hand.cards.some(card => card.isFaceUp) && (
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-30">
                <div className="px-4 py-1.5 bg-black/80 rounded-full text-white font-bold text-base border border-white/30 shadow-lg">
                  Score: {calculateScore(hand.cards)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bet Amount - Show above the seat */}
      {hand && hand.betAmount > 0 && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex flex-col items-center">
            <div className="text-sm text-white font-medium mb-1 bg-black/60 px-2 py-0.5 rounded-md shadow-sm">Current Bet</div>
            <div className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg text-white font-bold text-lg border border-yellow-300 shadow-lg">
              ${hand.betAmount}
            </div>
          </div>
        </div>
      )}

      {/* Bet Amount Chips - Show below the cards */}
      {hand && hand.betAmount > 0 && (
        <div className="mt-4 transform hover:scale-105 transition-transform">
          <Chip value={hand.betAmount} disabled />
        </div>
      )}

      {/* Status */}
      {hand && hand.status !== 'betting' && hand.status !== 'active' && (
        <div className={`
          absolute -top-3 left-1/2 transform -translate-x-1/2
          px-4 py-1 rounded-full text-sm font-bold
          ${getStatusColor(hand.status)}
          text-white shadow-lg border
          animate-pulse
        `}>
          {getStatusText(hand.status)}
        </div>
      )}
      
      {/* Current Turn Indicator */}
      {hand && hand.isTurn && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full h-1">
          <div className="h-full bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
} 