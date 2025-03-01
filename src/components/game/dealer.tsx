import React from 'react';
import { Card } from '@/components/game/card';
import type { Card as CardType } from '@/lib/types';

interface DealerProps {
  cards: CardType[];
  score: number;
  className?: string;
}

export function Dealer({ cards, score, className = '' }: DealerProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Dealer Title */}
      <div className="mb-2 px-4 py-1 bg-black/40 backdrop-blur-sm rounded-full">
        <h2 className="text-xl font-bold text-white tracking-wider">DEALER</h2>
      </div>
      
      {/* Dealer Score */}
      {score > 0 && (
        <div className="mb-4 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      )}
      
      {/* Dealer Cards */}
      <div className="relative flex justify-center">
        {cards.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            card={card}
            isDealing={false}
            className={`
              absolute
              transform transition-all duration-300 ease-in-out
              ${index === 0 ? 'z-10' : `z-${10 + index}`}
              ${getCardOffset(index, cards.length)}
            `}
          />
        ))}
      </div>
    </div>
  );
}

// Helper function to calculate card offset based on position
function getCardOffset(index: number, totalCards: number): string {
  if (totalCards <= 1) return '';
  
  const maxOffset = Math.min(totalCards * 15, 60); // Maximum offset in pixels
  const centerIndex = (totalCards - 1) / 2;
  const relativeIndex = index - centerIndex;
  const offset = relativeIndex * (maxOffset / totalCards);
  
  return `translate-x-[${offset}px]`;
} 