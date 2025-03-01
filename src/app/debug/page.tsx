'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Define interfaces for the database responses
interface GameStateRecord {
  id: string;
  deck: string;
  dealer_hand: string;
  dealer_score: number;
  current_player_index: number;
  game_phase: string;
  updated_at: string;
  timer: number | null;
}

interface PlayerHandRecord {
  id: string;
  game_id: string;
  player_id: string;
  seat_position: number;
  cards: string;
  bet_amount: number;
  status: string;
  is_turn: boolean;
  insurance_bet: number | null;
  is_split: boolean;
}

interface PlayerRecord {
  id: string;
  name: string;
  balance: number;
  created_at: string;
  last_played_at: string;
}

export default function DebugPage() {
  const [gameState, setGameState] = useState<GameStateRecord | null>(null);
  const [playerHands, setPlayerHands] = useState<PlayerHandRecord[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        addLog('Fetching game state...');
        
        // Fetch game state
        const { data: gameData, error: gameError } = await supabase
          .from('game_state')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);
        
        if (gameError) {
          addLog(`Error fetching game state: ${gameError.message}`);
          setError(gameError.message);
          return;
        }
        
        if (!gameData || gameData.length === 0) {
          addLog('No game state found');
          setError('No game state found');
          return;
        }
        
        const latestGame = gameData[0] as GameStateRecord;
        setGameState(latestGame);
        addLog(`Found game state with ID: ${latestGame.id}`);
        
        // Fetch player hands
        const { data: handData, error: handError } = await supabase
          .from('player_hands')
          .select('*')
          .eq('game_id', latestGame.id);
        
        if (handError) {
          addLog(`Error fetching player hands: ${handError.message}`);
          setError(handError.message);
          return;
        }
        
        setPlayerHands(handData as PlayerHandRecord[] || []);
        addLog(`Found ${handData?.length || 0} player hands`);
        
        // Fetch players
        if (handData && handData.length > 0) {
          const playerIds = Array.from(new Set(handData.map((h: PlayerHandRecord) => h.player_id)));
          
          if (playerIds.length > 0) {
            const { data: playerData, error: playerError } = await supabase
              .from('players')
              .select('*')
              .in('id', playerIds);
            
            if (playerError) {
              addLog(`Error fetching players: ${playerError.message}`);
              setError(playerError.message);
              return;
            }
            
            setPlayers(playerData as PlayerRecord[] || []);
            addLog(`Found ${playerData?.length || 0} players`);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        addLog(`Unexpected error: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const resetGame = async () => {
    try {
      addLog('Resetting game state...');
      
      // Delete existing game state
      if (gameState) {
        const { error: deleteGameError } = await supabase
          .from('game_state')
          .delete()
          .eq('id', gameState.id);
        
        if (deleteGameError) {
          addLog(`Error deleting game state: ${deleteGameError.message}`);
          return;
        }
        
        addLog('Game state deleted');
      }
      
      // Delete player hands
      const { error: deleteHandsError } = await supabase
        .from('player_hands')
        .delete()
        .eq('game_id', gameState?.id || '');
      
      if (deleteHandsError) {
        addLog(`Error deleting player hands: ${deleteHandsError.message}`);
        return;
      }
      
      addLog('Player hands deleted');
      
      // Create new game state
      const newGameId = crypto.randomUUID();
      const { error: createGameError } = await supabase
        .from('game_state')
        .insert({
          id: newGameId,
          deck: JSON.stringify([]),
          dealer_hand: JSON.stringify([]),
          dealer_score: 0,
          current_player_index: -1,
          game_phase: 'waiting',
          updated_at: new Date().toISOString(),
          timer: null,
        });
      
      if (createGameError) {
        addLog(`Error creating new game state: ${createGameError.message}`);
        return;
      }
      
      addLog(`New game state created with ID: ${newGameId}`);
      
      // Refresh the page
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog(`Unexpected error during reset: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Blackjack Game Debug</h1>
            <div className="space-x-4">
              <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Back to Game
              </Link>
              <button 
                onClick={resetGame}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reset Game
              </button>
            </div>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Loading data...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game State */}
            <div className="bg-gray-50 p-4 rounded border">
              <h2 className="text-lg font-semibold mb-2">Game State</h2>
              {gameState ? (
                <div>
                  <p><strong>ID:</strong> {gameState.id}</p>
                  <p><strong>Phase:</strong> {gameState.game_phase}</p>
                  <p><strong>Current Player:</strong> {gameState.current_player_index}</p>
                  <p><strong>Updated:</strong> {new Date(gameState.updated_at).toLocaleString()}</p>
                  <p><strong>Dealer Score:</strong> {gameState.dealer_score}</p>
                  <p><strong>Timer:</strong> {gameState.timer}</p>
                  <div className="mt-2">
                    <p><strong>Dealer Hand:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                      {gameState.dealer_hand}
                    </pre>
                  </div>
                  <div className="mt-2">
                    <p><strong>Deck:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                      {gameState.deck}
                    </pre>
                  </div>
                </div>
              ) : (
                <p>No game state found</p>
              )}
            </div>
            
            {/* Player Hands */}
            <div className="bg-gray-50 p-4 rounded border">
              <h2 className="text-lg font-semibold mb-2">Player Hands ({playerHands.length})</h2>
              {playerHands.length > 0 ? (
                <div className="space-y-4">
                  {playerHands.map((hand) => (
                    <div key={hand.id} className="border-b pb-2">
                      <p><strong>Seat:</strong> {hand.seat_position}</p>
                      <p><strong>Player ID:</strong> {hand.player_id}</p>
                      <p><strong>Bet:</strong> ${hand.bet_amount}</p>
                      <p><strong>Status:</strong> {hand.status}</p>
                      <p><strong>Is Turn:</strong> {hand.is_turn ? 'Yes' : 'No'}</p>
                      <div className="mt-1">
                        <p><strong>Cards:</strong></p>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                          {hand.cards}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No player hands found</p>
              )}
            </div>
            
            {/* Players */}
            <div className="bg-gray-50 p-4 rounded border">
              <h2 className="text-lg font-semibold mb-2">Players ({players.length})</h2>
              {players.length > 0 ? (
                <div className="space-y-4">
                  {players.map((player) => (
                    <div key={player.id} className="border-b pb-2">
                      <p><strong>ID:</strong> {player.id}</p>
                      <p><strong>Name:</strong> {player.name}</p>
                      <p><strong>Balance:</strong> ${player.balance}</p>
                      <p><strong>Last Played:</strong> {new Date(player.last_played_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No players found</p>
              )}
            </div>
            
            {/* Logs */}
            <div className="bg-gray-50 p-4 rounded border">
              <h2 className="text-lg font-semibold mb-2">Debug Logs</h2>
              <div className="bg-black text-green-400 p-2 rounded font-mono text-xs h-80 overflow-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 