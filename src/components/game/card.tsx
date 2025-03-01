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

  // Card back design - more realistic
  if (!isFaceUp) {
    return (
      <div 
        className={`
          relative w-24 h-36 
          bg-gradient-to-br from-blue-800 to-blue-600 
          rounded-lg shadow-xl 
          border border-white/20
          transform transition-all duration-300 ease-in-out
          ${isDealing ? 'animate-deal' : ''}
          hover:shadow-2xl hover:-translate-y-1
          ${className}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
          {/* Card back pattern - diamond pattern */}
          <div className="absolute inset-0 grid grid-cols-5 gap-1 p-2 opacity-30">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-sm bg-white/30"></div>
            ))}
          </div>
          
          {/* Center emblem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-blue-500/70 flex items-center justify-center border border-white/40 shadow-inner">
              <span className="text-white text-3xl font-bold drop-shadow-md">♠</span>
            </div>
          </div>
          
          {/* Edge border */}
          <div className="absolute inset-0 rounded-lg border-2 border-blue-400/20 pointer-events-none"></div>
          
          {/* Shine effect */}
          <div className="absolute -top-20 -left-20 w-40 h-80 bg-white/10 rotate-45 transform translate-x-0 translate-y-0 transition-transform duration-1000 animate-shine"></div>
        </div>
      </div>
    );
  }

  // Card front design - more realistic
  return (
    <div 
      className={`
        relative w-24 h-36 
        bg-white rounded-lg 
        shadow-xl border border-gray-200
        transform transition-all duration-300 ease-in-out
        ${isDealing ? 'animate-deal' : ''}
        hover:shadow-2xl hover:-translate-y-1
        ${className}
      `}
    >
      {/* Card texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-lg opacity-80"></div>
      
      {/* Card corners */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`${getSuitColor(suit)} flex flex-col items-center`}>
          <div className="text-xl font-bold">{rank}</div>
          <div className="text-xl leading-none">{getSuitSymbol(suit)}</div>
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 transform rotate-180 z-10">
        <div className={`${getSuitColor(suit)} flex flex-col items-center`}>
          <div className="text-xl font-bold">{rank}</div>
          <div className="text-xl leading-none">{getSuitSymbol(suit)}</div>
        </div>
      </div>
      
      {/* Card center - different designs based on card type */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {['J', 'Q', 'K'].includes(rank) ? (
          // Face card design
          <div className={`w-16 h-20 rounded-md ${getSuitColor(suit)} bg-opacity-10 flex items-center justify-center border border-current`}>
            <span className="text-2xl font-serif">{rank}</span>
          </div>
        ) : rank === 'A' ? (
          // Ace design
          <div className={`${getSuitColor(suit)} text-5xl font-bold drop-shadow-md`}>
            {getSuitSymbol(suit)}
          </div>
        ) : (
          // Number card design - pattern of symbols
          <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
            {Array.from({ length: parseInt(rank) || 1 }).map((_, i) => (
              <div key={i} className={`flex items-center justify-center ${getSuitColor(suit)}`}>
                <span className="text-lg">{getSuitSymbol(suit)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Card border glow effect for face cards and aces */}
      {['J', 'Q', 'K', 'A'].includes(rank) && (
        <div className="absolute inset-0 rounded-lg border-2 border-yellow-400/30 pointer-events-none"></div>
      )}
      
      {/* Edge highlight */}
      <div className="absolute inset-0 rounded-lg border border-white/60 pointer-events-none"></div>
      
      {/* Shine effect */}
      <div className="absolute -top-20 -left-20 w-40 h-80 bg-white/20 rotate-45 transform translate-x-0 translate-y-0 transition-transform duration-1000 animate-shine"></div>
    </div>
  );
} 