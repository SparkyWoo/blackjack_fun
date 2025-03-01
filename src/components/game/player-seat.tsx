'use client';

import React from 'react';
import { Card } from '@/components/game/card';
import type { PlayerHand, Player } from '@/lib/types';
import { motion } from 'framer-motion';

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
        return 'bg-green-600';
      case 'blackjack':
        return 'bg-yellow-500';
      case 'lost':
        return 'bg-red-600';
      case 'bust':
        return 'bg-red-600';
      case 'push':
        return 'bg-blue-600';
      case 'surrender':
        return 'bg-gray-600';
      default:
        return 'bg-blue-600';
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
        min-w-[140px] p-2 rounded-md
        ${isEmpty ? 'opacity-90 hover:opacity-100' : ''}
        ${isCurrentPlayer 
          ? 'ring-1 ring-yellow-400/70 bg-black/60 shadow-md shadow-yellow-400/10' 
          : 'bg-black/40 shadow-sm'
        }
        ${isOccupied && !player ? 'ring-1 ring-green-400/50' : ''}
        backdrop-blur-sm transition-all duration-200 ease-in-out
        border border-white/10
        ${className}
      `}
    >
      {/* Current Turn Indicator */}
      {hand?.isTurn && (
        <div className="player-turn-indicator"></div>
      )}
      
      {/* Seat Number */}
      <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center border border-white/10 text-[10px] font-medium text-white">
        {seatNumber + 1}
      </div>
      
      {/* Player Info */}
      <div className="mb-2 text-center w-full">
        {isEmpty && !isOccupied ? (
          <button
            onClick={() => onJoin?.(seatNumber)}
            className="w-full px-2 py-1 
                     vlackjack-button
                     text-xs"
          >
            Join
          </button>
        ) : player ? (
          <div className="space-y-0.5">
            <div className="font-medium text-white text-sm tracking-wide flex items-center justify-center">
              {player.name}
              {isCurrentPlayer && (
                <span className="ml-1.5 bg-green-500 w-1 h-1 rounded-full animate-pulse"></span>
              )}
            </div>
            <div className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full inline-block">
              ${player.balance.toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-xs text-white/70 font-medium">
            Reserved
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
              const rotation = (index - (hand.cards.length - 1) / 2) * 4; // Reduced rotation angle
              const translateX = (index - (hand.cards.length - 1) / 2) * 10; // Reduced horizontal spread
              const translateY = -index * 1; // Reduced vertical staggering
              
              return (
                <div
                  key={`player-${seatNumber}-${card.suit}-${card.rank}-${index}`}
                  className="absolute transition-all duration-300 ease-in-out"
                  style={{
                    transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                    zIndex: 10 + index
                  }}
                >
                  <Card
                    card={card}
                    isDealing={false}
                    className="shadow-md"
                  />
                </div>
              );
            })}
            
            {/* Score Badge - More prominent */}
            {hand.cards.some(card => card.isFaceUp) && (
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-30">
                <div className="px-1.5 py-0.5 bg-black/70 rounded-md text-white font-bold text-xs shadow-sm">
                  {calculateScore(hand.cards)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bet Amount - Show above the seat */}
      {hand && hand.betAmount > 0 && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-30">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-1.5 py-0.5 bg-yellow-600/90 rounded-sm text-white font-bold text-xs shadow-sm"
          >
            ${hand.betAmount}
          </motion.div>
        </div>
      )}

      {/* Status */}
      {hand && hand.status !== 'betting' && hand.status !== 'active' && (
        <div className={`
          absolute -top-1 left-1/2 transform -translate-x-1/2
          px-2 py-0.5 rounded-sm text-[10px] font-bold
          ${getStatusColor(hand.status)}
          text-white shadow-sm
          animate-pulse
        `}>
          {getStatusText(hand.status)}
        </div>
      )}
    </div>
  );
} 