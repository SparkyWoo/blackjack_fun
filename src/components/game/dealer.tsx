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
      <div className="mb-2 px-4 py-1 bg-black/60 backdrop-blur-sm rounded-full shadow-md">
        <h2 className="text-xl font-bold text-white tracking-wider">DEALER</h2>
      </div>
      
      {/* Dealer Score */}
      {score > 0 && (
        <div className="mb-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full shadow-md">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      )}
      
      {/* Dealer Cards - Displayed in a fan-like arrangement */}
      <div className="dealer-cards-fan">
        {cards.length === 0 ? (
          // Empty card placeholder when no cards
          <div className="w-24 h-36 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
            <span className="text-white/40 text-sm">Cards will appear here</span>
          </div>
        ) : (
          // Actual cards with fan-like arrangement
          cards.map((card, index) => {
            // Calculate rotation and offset for fan effect
            // For dealer, we want a horizontal fan
            const rotation = (index - (cards.length - 1) / 2) * 8; // Subtle rotation
            const translateX = (index - (cards.length - 1) / 2) * 30; // Wider horizontal spread
            
            return (
              <div
                key={`dealer-${card.suit}-${card.rank}-${index}`}
                className="absolute transition-all duration-500 ease-in-out"
                style={{
                  transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
                  zIndex: 10 + index
                }}
              >
                <Card
                  card={card}
                  isDealing={false}
                  className="shadow-xl"
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