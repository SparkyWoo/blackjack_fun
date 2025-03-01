'use client';

import React, { useState, useEffect } from 'react';
import { Chip } from '@/components/game/chip';

export interface BetControlsProps {
  onPlaceBet: (amount: number) => void;
  playerBalance: number;
  existingBet?: number;
  className?: string;
}

const CHIP_VALUES = [5, 25, 100, 500, 1000];

export function BetControls({ onPlaceBet, playerBalance, existingBet = 0, className = '' }: BetControlsProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [currentBet, setCurrentBet] = useState<number[]>([]);

  // Reset the bet if existingBet changes
  useEffect(() => {
    if (existingBet > 0) {
      setCurrentBet([]);
      setSelectedAmount(0);
    }
  }, [existingBet]);

  const handleAddChip = (value: number) => {
    if (getTotalBet() + value <= playerBalance) {
      setCurrentBet([...currentBet, value]);
      setSelectedAmount(getTotalBet() + value);
    }
  };

  const handleClearBet = () => {
    setCurrentBet([]);
    setSelectedAmount(0);
  };

  const getTotalBet = () => {
    return currentBet.reduce((sum, chip) => sum + chip, 0);
  };

  const handlePlaceBet = () => {
    if (selectedAmount > 0 && selectedAmount <= playerBalance) {
      onPlaceBet(selectedAmount);
      setSelectedAmount(0);
      setCurrentBet([]);
    }
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* Available Balance and Current Bet */}
      <div className="flex items-center justify-between w-full mb-4">
        <div className="text-white text-sm">Balance: <span className="font-bold text-green-400">${playerBalance.toLocaleString()}</span></div>
        {existingBet > 0 && (
          <div className="text-white text-sm">Current Bet: <span className="font-bold text-yellow-400">${existingBet}</span></div>
        )}
      </div>

      {/* Current Bet Display */}
      <div className="relative min-h-[80px] w-full flex items-center justify-center mb-4">
        {currentBet.length > 0 ? (
          <div className="relative h-20 w-40">
            {/* Stack of chips */}
            {currentBet.map((value, index) => (
              <div 
                key={index}
                className="absolute left-1/2 transform -translate-x-1/2"
                style={{ 
                  bottom: `${index * 4}px`,
                  zIndex: index
                }}
              >
                <Chip value={value} disabled />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic">Select chips to place a bet</div>
        )}
        
        {/* Total bet amount */}
        {selectedAmount > 0 && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/60 px-3 py-1 rounded-full text-white font-bold text-sm border border-white/10">
              ${selectedAmount.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Chip Selection */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
        {CHIP_VALUES.map((value) => (
          <div 
            key={value}
            className="transform transition-all duration-200 hover:scale-110 hover:-translate-y-1"
          >
            <Chip
              value={value}
              onClick={() => handleAddChip(value)}
              disabled={value > playerBalance - getTotalBet()}
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 w-full justify-center">
        {/* Clear Bet Button */}
        <button
          onClick={handleClearBet}
          disabled={selectedAmount === 0}
          className={`
            px-5 py-2.5 rounded-lg font-bold
            bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
            text-white shadow-lg shadow-black/20
            transition-all duration-200 ease-in-out
            transform hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            border border-white/10
          `}
        >
          Clear
        </button>

        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          disabled={selectedAmount === 0 || selectedAmount > playerBalance}
          className={`
            px-5 py-2.5 rounded-lg font-bold
            bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400
            text-white shadow-lg shadow-black/20
            transition-all duration-200 ease-in-out
            transform hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            border border-white/10
            ${selectedAmount > 0 ? 'animate-pulse' : ''}
          `}
        >
          Place Bet
        </button>
      </div>
    </div>
  );
} 