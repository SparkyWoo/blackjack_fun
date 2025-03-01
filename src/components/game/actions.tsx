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
    if (!enabled) return 'bg-gray-700 text-gray-300 border-gray-600';
    
    switch (action) {
      case 'hit':
        return 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-green-400';
      case 'stand':
        return 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-red-400';
      case 'double':
        return 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white border-purple-400';
      case 'split':
        return 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-blue-400';
      case 'surrender':
        return 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white border-gray-400';
      case 'insurance':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white border-yellow-400';
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-blue-400';
    }
  };

  // Get icon for each action
  const getActionIcon = (action: PlayerAction) => {
    switch (action) {
      case 'hit':
        return '+';
      case 'stand':
        return '✋';
      case 'double':
        return '2x';
      case 'split':
        return '⊥';
      case 'surrender':
        return '🏳️';
      case 'insurance':
        return '🛡️';
      default:
        return '';
    }
  };

  const ActionButton = ({ action, label, enabled }: { action: PlayerAction; label: string; enabled: boolean }) => (
    <button
      onClick={() => enabled && onAction(action)}
      disabled={!enabled}
      className={`
        px-5 py-3 rounded-lg font-bold
        ${getButtonStyle(action, enabled)}
        shadow-lg shadow-black/20
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
        border
        backdrop-filter backdrop-blur-sm
        flex flex-col items-center justify-center
        min-w-[80px]
      `}
    >
      <span className="text-lg mb-1">{getActionIcon(action)}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Title */}
      <div className="text-white font-bold text-xl mb-2 bg-black/50 px-4 py-1 rounded-lg">Your Turn</div>
      
      {/* Timer */}
      {timer !== null && (
        <div className="relative mb-2">
          <div className="px-4 py-1 bg-black/60 rounded-full border border-white/20 shadow-lg">
            <span className="text-xl font-bold text-white">{timer}s</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 max-w-md">
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