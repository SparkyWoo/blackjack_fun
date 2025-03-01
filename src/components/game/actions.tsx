import React from 'react';
import type { PlayerAction } from '@/lib/types';

interface ActionsProps {
  onAction: (action: PlayerAction) => void;
  canHit?: boolean;
  canStand?: boolean;
  canDouble?: boolean;
  canSplit?: boolean;
  canSurrender?: boolean;
  canInsurance?: boolean;
  timer?: number | null;
  className?: string;
}

export function Actions({
  onAction,
  canHit = false,
  canStand = false,
  canDouble = false,
  canSplit = false,
  canSurrender = false,
  canInsurance = false,
  timer = null,
  className = '',
}: ActionsProps) {
  // Get button style based on action type
  const getButtonStyle = (action: PlayerAction, enabled: boolean) => {
    if (!enabled) return 'bg-gray-700/50 text-gray-400';
    
    switch (action) {
      case 'hit':
        return 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white';
      case 'stand':
        return 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white';
      case 'double':
        return 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white';
      case 'split':
        return 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white';
      case 'surrender':
        return 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white';
      case 'insurance':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white';
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white';
    }
  };

  const ActionButton = ({ action, label, enabled }: { action: PlayerAction; label: string; enabled: boolean }) => (
    <button
      onClick={() => enabled && onAction(action)}
      disabled={!enabled}
      className={`
        px-5 py-2.5 rounded-lg font-bold
        ${getButtonStyle(action, enabled)}
        shadow-lg shadow-black/20
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        border border-white/10
        backdrop-filter backdrop-blur-sm
      `}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Timer */}
      {timer !== null && (
        <div className="relative mb-2">
          <div className="absolute inset-0 bg-black/20 rounded-full blur-md"></div>
          <div className="relative px-4 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
            <span className="text-2xl font-bold text-white">{timer}s</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        <ActionButton action="hit" label="Hit" enabled={canHit} />
        <ActionButton action="stand" label="Stand" enabled={canStand} />
        <ActionButton action="double" label="Double" enabled={canDouble} />
        <ActionButton action="split" label="Split" enabled={canSplit} />
        <ActionButton action="surrender" label="Surrender" enabled={canSurrender} />
        {canInsurance && (
          <ActionButton action="insurance" label="Insurance" enabled={true} />
        )}
      </div>
    </div>
  );
} 