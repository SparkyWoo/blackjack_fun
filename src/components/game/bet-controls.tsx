'use client';

import React, { useState, useEffect } from 'react';
import { Chip } from '@/components/game/chip';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

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
      
      // Show feedback
      setFeedbackMessage(`+$${value}`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 800);
    } else {
      // Show insufficient funds feedback
      setFeedbackMessage('Insufficient funds');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1200);
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
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full">
          Balance: <span className="font-bold text-green-400">${playerBalance.toLocaleString()}</span>
        </div>
        {existingBet > 0 && (
          <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full">
            Current Bet: <span className="font-bold text-yellow-400">${existingBet}</span>
          </div>
        )}
      </div>

      {/* Current Bet Display */}
      <div className="relative min-h-[100px] w-full flex items-center justify-center mb-6">
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -20 }}
              exit={{ opacity: 0 }}
              className={`absolute z-50 font-bold text-lg ${
                feedbackMessage.includes('+') ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {feedbackMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {currentBet.length > 0 ? (
          <div className="relative h-24 w-40">
            {/* Stack of chips */}
            {currentBet.map((value, index) => (
              <motion.div 
                key={index}
                className="absolute left-1/2 transform -translate-x-1/2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  bottom: `${index * 4}px`,
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  delay: index * 0.05
                }}
                style={{ 
                  zIndex: index
                }}
              >
                <Chip value={value} disabled />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic bg-black/30 px-4 py-2 rounded-lg">
            Select chips to place a bet
          </div>
        )}
        
        {/* Total bet amount */}
        {selectedAmount > 0 && (
          <motion.div 
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="bg-black/70 px-4 py-1.5 rounded-full text-white font-bold text-sm border border-white/20 shadow-lg shadow-black/30">
              ${selectedAmount.toLocaleString()}
            </div>
          </motion.div>
        )}
      </div>

      {/* Chip Selection */}
      <div className="flex flex-wrap justify-center gap-3 mb-5 w-full">
        {CHIP_VALUES.map((value) => (
          <motion.div 
            key={value}
            className="transform transition-all duration-200 hover:scale-110 hover:-translate-y-1"
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Chip
              value={value}
              onClick={() => handleAddChip(value)}
              disabled={value > playerBalance - getTotalBet()}
            />
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-5 w-full justify-center">
        {/* Clear Bet Button */}
        <motion.button
          onClick={handleClearBet}
          disabled={selectedAmount === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-6 py-2.5 rounded-lg font-bold
            bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
            text-white shadow-lg shadow-black/30
            transition-all duration-200 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            border border-white/20
          `}
        >
          Clear
        </motion.button>

        {/* Place Bet Button */}
        <motion.button
          onClick={handlePlaceBet}
          disabled={selectedAmount === 0 || selectedAmount > playerBalance}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-6 py-2.5 rounded-lg font-bold
            bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400
            text-white shadow-lg shadow-black/30
            transition-all duration-200 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            border border-white/20
            ${selectedAmount > 0 ? 'animate-pulse' : ''}
          `}
        >
          Place Bet
        </motion.button>
      </div>
    </div>
  );
} 