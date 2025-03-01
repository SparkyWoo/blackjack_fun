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
      {/* Dealer Score - Only show when there are cards */}
      {cards.length > 0 && score > 0 && (
        <div className="mb-2 px-2 py-0.5 bg-black/50 rounded-md shadow-sm">
          <span className="text-sm font-bold text-white">{score}</span>
        </div>
      )}
      
      {/* Dealer Cards - Displayed in a fan-like arrangement */}
      <div className="dealer-cards-fan">
        {cards.length === 0 ? (
          // Empty card placeholder when no cards
          <div className="w-10 h-[3.75rem] rounded-sm border border-dashed border-white/10 flex items-center justify-center">
            <span className="text-white/30 text-[10px]">Dealer</span>
          </div>
        ) : (
          // Actual cards with fan-like arrangement
          cards.map((card, index) => {
            // Calculate rotation and offset for fan effect
            // For dealer, we want a horizontal fan
            const rotation = (index - (cards.length - 1) / 2) * 3; // Reduced rotation
            const translateX = (index - (cards.length - 1) / 2) * 12; // Reduced horizontal spread
            
            return (
              <div
                key={`dealer-${card.suit}-${card.rank}-${index}`}
                className="absolute transition-all duration-300 ease-in-out"
                style={{
                  transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
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
          })
        )}
      </div>
    </div>
  );
}

export default Dealer; 