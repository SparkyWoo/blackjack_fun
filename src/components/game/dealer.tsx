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
      <div className="mb-2 text-center">
        <div className="font-bold text-white text-xl">Dealer</div>
        {score > 0 && (
          <div className="text-gray-300">Score: {score}</div>
        )}
      </div>

      {/* Dealer Cards */}
      <div className="relative flex -space-x-4">
        {cards.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            card={card}
            className="transform transition-transform hover:translate-y-2"
          />
        ))}
      </div>
    </div>
  );
} 