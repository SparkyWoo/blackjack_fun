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
        ${isEmpty ? 'opacity-50' : ''}
        ${isCurrentPlayer ? 'ring-4 ring-yellow-400 rounded-lg' : ''}
        ${className}
      `}
    >
      {/* Player Info */}
      <div className="mb-2 text-center">
        {isEmpty ? (
          <button
            onClick={() => onJoin?.(seatNumber)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join Seat {seatNumber + 1}
          </button>
        ) : (
          <div className="space-y-1">
            <div className="font-bold text-white">{player.name}</div>
            <div className="text-sm text-gray-300">${player.balance}</div>
          </div>
        )}
      </div>

      {/* Cards */}
      {hasHand && (
        <div className="relative flex -space-x-4">
          {hand.cards.map((card, index) => (
            <Card
              key={`${card.suit}-${card.rank}-${index}`}
              card={card}
              className="transform transition-transform hover:translate-y--2"
            />
          ))}
        </div>
      )}

      {/* Bet Amount */}
      {hand && hand.betAmount > 0 && (
        <div className="mt-4">
          <Chip value={hand.betAmount} disabled />
        </div>
      )}

      {/* Status */}
      {hand && hand.status !== 'betting' && hand.status !== 'active' && (
        <div className={`
          absolute -top-6 left-1/2 transform -translate-x-1/2
          px-3 py-1 rounded-full text-sm font-bold
          ${hand.status === 'won' ? 'bg-green-500' : ''}
          ${hand.status === 'lost' ? 'bg-red-500' : ''}
          ${hand.status === 'push' ? 'bg-yellow-500' : ''}
          text-white
        `}>
          {hand.status.toUpperCase()}
        </div>
      )}
    </div>
  );
} 