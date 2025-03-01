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
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-16 h-16 rounded-full
        flex items-center justify-center
        font-bold text-white
        ${selected ? 'ring-4 ring-yellow-400' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 transition-transform'}
        ${value >= 1000 ? 'bg-purple-600' : value >= 500 ? 'bg-red-600' : 'bg-blue-600'}
        ${className}
      `}
    >
      ${value}
    </button>
  );
} 