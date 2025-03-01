'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ActionsProps {
  onAction: (action: 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance') => void;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  canInsurance: boolean;
  timer: number | null;
}

export function Actions({
  onAction,
  canHit,
  canStand,
  canDouble,
  canSplit,
  canSurrender,
  canInsurance,
  timer,
}: ActionsProps) {
  // Action button component for consistent styling
  const ActionButton = ({ 
    action, 
    label, 
    icon, 
    enabled, 
    color = 'bg-gray-800'
  }: { 
    action: 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance'; 
    label: string; 
    icon: string;
    enabled: boolean;
    color?: string;
  }) => (
    <motion.button
      whileHover={{ scale: enabled ? 1.05 : 1 }}
      whileTap={{ scale: enabled ? 0.95 : 1 }}
      className={`relative px-2 py-1.5 rounded-sm ${enabled ? `${color} hover:brightness-110 active:brightness-90` : 'bg-gray-800/50 cursor-not-allowed'} transition-all duration-200`}
      onClick={() => enabled && onAction(action)}
      disabled={!enabled}
    >
      <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-sm mb-0.5">{icon}</span>
        <span className="text-[10px] font-medium tracking-wide">{label}</span>
      </div>
    </motion.button>
  );

  return (
    <div className="flex flex-col items-center">
      {/* Player turn indicator */}
      <div className="mb-2 text-center">
        <div className="inline-block px-2 py-0.5 bg-yellow-500/90 rounded-sm text-[10px] font-bold text-white shadow-sm">
          YOUR TURN
        </div>
      </div>
      
      {/* Timer display */}
      {timer !== null && (
        <div className="mb-2 text-center">
          <div className="inline-block px-2 py-0.5 bg-black/40 rounded-sm text-[10px] font-medium">
            <span className="text-yellow-400 mr-1">⏱</span>
            <span>{timer}s</span>
          </div>
        </div>
      )}
      
      {/* Primary actions */}
      <div className="grid grid-cols-5 gap-1.5">
        <ActionButton
          action="hit"
          label="HIT"
          icon="👆"
          enabled={canHit}
          color="bg-emerald-800"
        />
        
        <ActionButton
          action="stand"
          label="STAND"
          icon="✋"
          enabled={canStand}
          color="bg-red-800"
        />
        
        <ActionButton
          action="double"
          label="DOUBLE"
          icon="💰"
          enabled={canDouble}
          color="bg-blue-800"
        />
        
        <ActionButton
          action="split"
          label="SPLIT"
          icon="✂️"
          enabled={canSplit}
          color="bg-purple-800"
        />
        
        <ActionButton
          action="surrender"
          label="SURR"
          icon="🏳️"
          enabled={canSurrender}
          color="bg-gray-700"
        />
      </div>
      
      {/* Insurance action (only shown when available) */}
      {canInsurance && (
        <div className="mt-1.5">
          <ActionButton
            action="insurance"
            label="INSURANCE"
            icon="🛡️"
            enabled={canInsurance}
            color="bg-amber-700"
          />
        </div>
      )}
    </div>
  );
} 