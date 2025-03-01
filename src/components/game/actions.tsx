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
  const ActionButton = ({ action, label, enabled }: { action: PlayerAction; label: string; enabled: boolean }) => (
    <button
      onClick={() => enabled && onAction(action)}
      disabled={!enabled}
      className={`
        px-4 py-2 rounded-lg font-bold
        ${enabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600'}
        text-white transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Timer */}
      {timer !== null && (
        <div className="text-2xl font-bold text-white">
          {timer}s
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
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