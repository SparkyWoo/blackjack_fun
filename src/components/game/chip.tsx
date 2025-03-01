'use client';

import React from 'react';

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
    if (value >= 1000) return 'from-purple-600 to-purple-800 border-purple-400';
    if (value >= 500) return 'from-red-600 to-red-800 border-red-400';
    return 'from-blue-600 to-blue-800 border-blue-400';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-16 h-16 rounded-full
        bg-gradient-to-b ${getChipStyle()}
        border-2 border-opacity-50
        flex items-center justify-center
        font-bold text-white text-sm
        shadow-lg hover:shadow-xl
        ${selected ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
        transform transition-all duration-200
        ${className}
      `}
    >
      {/* Inner ring */}
      <div className="absolute inset-2 border-2 border-white border-opacity-20 rounded-full" />
      
      {/* Value */}
      <div className="relative">
        <span className="opacity-90">$</span>
        <span>{value.toLocaleString()}</span>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-transparent opacity-10" />
    </button>
  );
} 