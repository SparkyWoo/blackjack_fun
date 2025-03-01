import React from 'react';
import type { Card as CardType } from '@/lib/types';

interface CardProps {
  card: CardType;
  className?: string;
  isDealing?: boolean;
}

export function Card({ card, className = '', isDealing = false }: CardProps) {
  const { suit, rank, isFaceUp } = card;

  // Function to get the correct SVG file name
  const getCardImagePath = () => {
    if (!isFaceUp) {
      return '/cards/back.svg';
    }
    
    // Convert rank to the format used in the SVG filenames
    let fileRank: string;
    switch (rank) {
      case 'A':
        fileRank = 'ace';
        break;
      case 'K':
        fileRank = 'king';
        break;
      case 'Q':
        fileRank = 'queen';
        break;
      case 'J':
        fileRank = 'jack';
        break;
      default:
        fileRank = rank;
    }
    
    return `/cards/${fileRank}_of_${suit}.svg`;
  };

  return (
    <div 
      className={`
        relative w-10 h-[3.75rem] 
        transform transition-all duration-300 ease-in-out
        ${isDealing ? 'animate-deal' : ''}
        hover:shadow-md hover:-translate-y-1 hover:scale-105
        rounded-sm overflow-hidden
        ${className}
      `}
    >
      <img 
        src={getCardImagePath()} 
        alt={isFaceUp ? `${rank} of ${suit}` : 'Card back'} 
        className="card-svg"
        loading="lazy"
      />
    </div>
  );
} 