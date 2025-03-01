'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BetControlsProps {
  onPlaceBet: (amount: number) => void;
  playerBalance: number;
  existingBet?: number;
  className?: string;
}

export function BetControls({
  onPlaceBet,
  playerBalance,
  existingBet = 0,
  className = '',
}: BetControlsProps) {
  const [currentBet, setCurrentBet] = useState<number>(existingBet);
  
  // Available chip denominations
  const chipValues = [1, 5, 10, 25, 100, 500];
  
  // Add to current bet
  const addToBet = (amount: number) => {
    if (currentBet + amount <= playerBalance) {
      setCurrentBet(prev => prev + amount);
    }
  };
  
  // Reset current bet
  const resetBet = () => {
    setCurrentBet(0);
  };
  
  // Place the bet
  const placeBet = () => {
    if (currentBet > 0) {
      onPlaceBet(currentBet);
    }
  };
  
  // Chip component
  const Chip = ({ value, onClick, disabled }: { value: number; onClick: () => void; disabled: boolean }) => {
    // Determine chip color class based on value
    const getChipClass = () => {
      return `chip chip-${value}`;
    };
    
    return (
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -3 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`relative w-8 h-8 ${getChipClass()} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={onClick}
        disabled={disabled}
      >
        <span className="text-[10px] font-bold">${value}</span>
      </motion.button>
    );
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Current bet display */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-[10px] text-gray-300 mb-0.5">Balance</h3>
          <p className="text-sm font-bold">${playerBalance}</p>
        </div>
        
        <div className="text-center">
          <h3 className="text-[10px] text-gray-300 mb-0.5">Current Bet</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentBet}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-lg font-bold text-yellow-400"
            >
              ${currentBet}
            </motion.p>
          </AnimatePresence>
        </div>
        
        <div>
          <button
            onClick={resetBet}
            className="px-2 py-0.5 bg-red-800/80 hover:bg-red-700 rounded-sm text-[10px] font-medium transition-colors"
            disabled={currentBet === 0}
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Chips */}
      <div className="flex justify-center gap-1.5 mb-3">
        {chipValues.map((value) => (
          <Chip
            key={value}
            value={value}
            onClick={() => addToBet(value)}
            disabled={currentBet + value > playerBalance}
          />
        ))}
      </div>
      
      {/* Place bet button */}
      <motion.button
        whileHover={{ scale: currentBet > 0 ? 1.02 : 1 }}
        whileTap={{ scale: currentBet > 0 ? 0.98 : 1 }}
        className={`py-1.5 rounded-sm font-bold text-white text-xs transition-all duration-200 ${
          currentBet > 0
            ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 shadow-sm'
            : 'bg-gray-700 cursor-not-allowed'
        }`}
        onClick={placeBet}
        disabled={currentBet === 0}
      >
        <div className="flex items-center justify-center">
          <span className="mr-1">🎲</span>
          <span>PLACE BET</span>
        </div>
      </motion.button>
    </div>
  );
} 