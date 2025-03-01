'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ChipProps {
  value: number;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Chip({
  value,
  onClick,
  selected = false,
  disabled = false,
  className = '',
}: ChipProps) {
  // Get chip color based on value
  const getChipStyle = () => {
    switch (true) {
      case value >= 1000:
        return {
          gradient: 'from-purple-600 to-purple-800',
          border: 'border-purple-300',
          innerRing: 'border-purple-300/30',
          textColor: 'text-purple-100',
          shadow: 'shadow-purple-900/50'
        };
      case value >= 500:
        return {
          gradient: 'from-red-600 to-red-800',
          border: 'border-red-300',
          innerRing: 'border-red-300/30',
          textColor: 'text-red-100',
          shadow: 'shadow-red-900/50'
        };
      case value >= 100:
        return {
          gradient: 'from-green-600 to-green-800',
          border: 'border-green-300',
          innerRing: 'border-green-300/30',
          textColor: 'text-green-100',
          shadow: 'shadow-green-900/50'
        };
      case value >= 25:
        return {
          gradient: 'from-blue-600 to-blue-800',
          border: 'border-blue-300',
          innerRing: 'border-blue-300/30',
          textColor: 'text-blue-100',
          shadow: 'shadow-blue-900/50'
        };
      default:
        return {
          gradient: 'from-gray-600 to-gray-800',
          border: 'border-gray-300',
          innerRing: 'border-gray-300/30',
          textColor: 'text-gray-100',
          shadow: 'shadow-gray-900/50'
        };
    }
  };

  const chipStyle = getChipStyle();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.1, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`
        relative w-16 h-16 rounded-full
        bg-gradient-to-b ${chipStyle.gradient}
        border-2 ${chipStyle.border} border-opacity-70
        flex items-center justify-center
        font-bold ${chipStyle.textColor} text-sm
        shadow-lg ${chipStyle.shadow}
        ${selected ? 'ring-4 ring-yellow-400 ring-opacity-70' : ''}
        ${disabled ? 'opacity-80 cursor-not-allowed' : ''}
        transition-all duration-200
        ${className}
      `}
    >
      {/* Edge detail */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-2 h-full bg-white/5"
            style={{ 
              transform: `rotate(${i * 45}deg)`,
              left: 'calc(50% - 4px)'
            }}
          />
        ))}
      </div>
      
      {/* Inner ring */}
      <div className={`absolute inset-2 border-2 ${chipStyle.innerRing} rounded-full`} />
      
      {/* Second inner ring */}
      <div className={`absolute inset-4 border ${chipStyle.innerRing} rounded-full`} />
      
      {/* Value */}
      <div className="relative z-10 flex items-center justify-center">
        <span className="opacity-90 text-xs mr-0.5">$</span>
        <span className="font-bold">{value.toLocaleString()}</span>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-transparent opacity-20" />
      
      {/* Bottom shadow for 3D effect */}
      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-black/30 rounded-full blur-sm" />
    </motion.button>
  );
} 