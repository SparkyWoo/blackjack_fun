import React from 'react';
import type { Card as CardType } from '@/lib/types';

interface CardProps {
  card: CardType;
  className?: string;
}

export function Card({ card, className = '' }: CardProps) {
  const { suit, rank, isFaceUp } = card;

  const getSuitColor = (suit: string) => {
    return ['hearts', 'diamonds'].includes(suit) ? 'text-red-600' : 'text-gray-900';
  };

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  if (!isFaceUp) {
    return (
      <div className={`relative w-24 h-36 bg-blue-800 rounded-lg shadow-lg border-2 border-white ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-24 border-2 border-white rounded-lg transform rotate-45"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-24 h-36 bg-white rounded-lg shadow-lg border border-gray-300 ${className}`}>
      <div className="absolute top-2 left-2">
        <div className={getSuitColor(suit)}>
          <div className="text-xl font-bold">{rank}</div>
          <div className="text-xl">{getSuitSymbol(suit)}</div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 transform rotate-180">
        <div className={getSuitColor(suit)}>
          <div className="text-xl font-bold">{rank}</div>
          <div className="text-xl">{getSuitSymbol(suit)}</div>
        </div>
      </div>
    </div>
  );
} 