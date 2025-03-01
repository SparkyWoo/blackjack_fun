import React, { useState } from 'react';
import { Chip } from './chip';

interface BetControlsProps {
  onPlaceBet: (amount: number) => void;
  playerBalance: number;
  className?: string;
}

const CHIP_VALUES = [100, 500, 1000];

export function BetControls({ onPlaceBet, playerBalance, className = '' }: BetControlsProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  const handlePlaceBet = () => {
    if (selectedAmount > 0 && selectedAmount <= playerBalance) {
      onPlaceBet(selectedAmount);
      setSelectedAmount(0);
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Available Balance */}
      <div className="text-white">
        <span className="text-gray-300">Balance:</span>{' '}
        <span className="font-bold">${playerBalance}</span>
      </div>

      {/* Chip Selection */}
      <div className="flex space-x-2">
        {CHIP_VALUES.map((value) => (
          <Chip
            key={value}
            value={value}
            onClick={() => setSelectedAmount(value)}
            selected={selectedAmount === value}
            disabled={value > playerBalance}
          />
        ))}
      </div>

      {/* Selected Amount */}
      {selectedAmount > 0 && (
        <div className="text-white">
          <span className="text-gray-300">Bet Amount:</span>{' '}
          <span className="font-bold">${selectedAmount}</span>
        </div>
      )}

      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={selectedAmount === 0 || selectedAmount > playerBalance}
        className={`
          px-6 py-2 rounded-lg font-bold text-white
          ${selectedAmount > 0 && selectedAmount <= playerBalance
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-600'}
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        Place Bet
      </button>
    </div>
  );
} 