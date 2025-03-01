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
      
      {/* Dealer Cards - Displayed in a fan-like arrangement */}
      <div className="relative h-40 w-40 flex items-center justify-center">
        {cards.length === 0 ? (
          // Empty card placeholder when no cards
          <div className="w-24 h-36 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
            <span className="text-white/30 text-sm">Cards will appear here</span>
          </div>
        ) : (
          // Actual cards with fan-like arrangement
          cards.map((card, index) => {
            // Calculate rotation and offset for fan effect
            const rotation = (index - (cards.length - 1) / 2) * 10; // -10 to 10 degrees
            const translateX = (index - (cards.length - 1) / 2) * 15; // -15px to 15px
            
            return (
              <Card
                key={`${card.suit}-${card.rank}-${index}`}
                card={card}
                isDealing={false}
                className={`
                  absolute
                  transform transition-all duration-300 ease-in-out
                  ${index === 0 ? 'z-10' : `z-${10 + index}`}
                  translate-x-[${translateX}px] rotate-[${rotation}deg]
                  ${index === 0 ? 'shadow-xl' : ''}
                `}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default Dealer; 