import React from 'react';
import type { Card as CardType } from '@/lib/types';

interface CardProps {
  card: CardType;
  className?: string;
  isDealing?: boolean;
}

export function Card({ card, className = '', isDealing = false }: CardProps) {
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

  // Card back design
  if (!isFaceUp) {
    return (
      <div 
        className={`
          relative w-24 h-36 
          bg-gradient-to-br from-blue-900 to-blue-700 
          rounded-xl shadow-lg 
          border-2 border-white/30
          transform transition-all duration-300 ease-in-out
          ${isDealing ? 'animate-deal' : ''}
          hover:shadow-xl hover:-translate-y-1
          ${className}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
          {/* Card back pattern */}
          <div className="w-20 h-28 border-2 border-white/40 rounded-lg transform rotate-45 bg-blue-800/50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-600/70 flex items-center justify-center border border-white/30">
              <span className="text-white text-2xl font-bold">♠</span>
            </div>
          </div>
          {/* Shine effect */}
          <div className="absolute -top-10 -left-10 w-20 h-60 bg-white/10 rotate-45 transform translate-x-0 translate-y-0 transition-transform duration-1000 animate-shine"></div>
        </div>
      </div>
    );
  }

  // Card front design
  return (
    <div 
      className={`
        relative w-24 h-36 
        bg-white rounded-xl 
        shadow-lg border border-gray-200
        transform transition-all duration-300 ease-in-out
        ${isDealing ? 'animate-deal' : ''}
        hover:shadow-xl hover:-translate-y-1
        ${className}
      `}
    >
      {/* Card corners */}
      <div className="absolute top-2 left-2">
        <div className={`${getSuitColor(suit)} flex flex-col items-center`}>
          <div className="text-xl font-bold">{rank}</div>
          <div className="text-xl">{getSuitSymbol(suit)}</div>
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 transform rotate-180">
        <div className={`${getSuitColor(suit)} flex flex-col items-center`}>
          <div className="text-xl font-bold">{rank}</div>
          <div className="text-xl">{getSuitSymbol(suit)}</div>
        </div>
      </div>
      
      {/* Card center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`${getSuitColor(suit)} text-4xl font-bold`}>
          {getSuitSymbol(suit)}
        </div>
      </div>
      
      {/* Card border glow effect for face cards */}
      {['J', 'Q', 'K', 'A'].includes(rank) && (
        <div className="absolute inset-0 rounded-xl border-2 border-yellow-400/30 pointer-events-none"></div>
      )}
      
      {/* Shine effect */}
      <div className="absolute -top-10 -left-10 w-20 h-60 bg-white/20 rotate-45 transform translate-x-0 translate-y-0 transition-transform duration-1000 animate-shine"></div>
    </div>
  );
} 