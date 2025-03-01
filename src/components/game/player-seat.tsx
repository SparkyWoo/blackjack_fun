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
  className?: string;
}

export function PlayerSeat({
  seatNumber,
  player,
  hand,
  onJoin,
  isCurrentPlayer = false,
  className = '',
}: PlayerSeatProps) {
  const isEmpty = !player;
  const hasHand = hand && hand.cards.length > 0;

  return (
    <div
      className={`
        relative flex flex-col items-center
        min-w-[200px] p-4 rounded-lg
        ${isEmpty ? 'opacity-90 hover:opacity-100' : ''}
        ${isCurrentPlayer ? 'ring-4 ring-yellow-400/50 bg-black/30' : 'bg-black/20'}
        backdrop-blur-sm transition-all duration-300
        ${className}
      `}
    >
      {/* Player Info */}
      <div className="mb-4 text-center w-full">
        {isEmpty ? (
          <button
            onClick={() => onJoin?.(seatNumber)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition-colors font-medium
                     shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Join Seat {seatNumber + 1}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="font-bold text-white text-lg">{player.name}</div>
            <div className="text-sm text-gray-300 bg-black/30 px-3 py-1 rounded-full inline-block">
              ${player.balance.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Cards */}
      {hasHand && (
        <div className="relative flex -space-x-16 mb-4">
          {hand.cards.map((card, index) => (
            <Card
              key={`${card.suit}-${card.rank}-${index}`}
              card={card}
              className="transform transition-transform hover:-translate-y-2"
            />
          ))}
        </div>
      )}

      {/* Bet Amount */}
      {hand && hand.betAmount > 0 && (
        <div className="mt-2">
          <Chip value={hand.betAmount} disabled />
        </div>
      )}

      {/* Status */}
      {hand && hand.status !== 'betting' && hand.status !== 'active' && (
        <div className={`
          absolute -top-3 left-1/2 transform -translate-x-1/2
          px-4 py-1 rounded-full text-sm font-bold
          ${hand.status === 'won' ? 'bg-green-500' : ''}
          ${hand.status === 'lost' ? 'bg-red-500' : ''}
          ${hand.status === 'push' ? 'bg-yellow-500' : ''}
          text-white shadow-lg
        `}>
          {hand.status.toUpperCase()}
        </div>
      )}
    </div>
  );
} 