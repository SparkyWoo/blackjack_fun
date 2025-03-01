import React from 'react';
import type { ChipValue } from '@/lib/types';

interface ChipProps {
  value: number;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

const CHIP_COLORS: Record<number, string> = {
  100: 'bg-red-600',
  500: 'bg-blue-600',
  1000: 'bg-green-600',
};

export function Chip({ value, onClick, disabled = false, selected = false }: ChipProps) {
  const baseColor = CHIP_COLORS[value] || 'bg-gray-600';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-16 h-16 rounded-full
        ${baseColor}
        ${selected ? 'ring-4 ring-yellow-400' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 transition-transform'}
        shadow-lg border-2 border-white
        flex items-center justify-center
        font-bold text-white
      `}
    >
      <div className="absolute inset-0 rounded-full border-4 border-white opacity-20"></div>
      <span className="text-sm">$</span>
      <span>{value}</span>
    </button>
  );
} 