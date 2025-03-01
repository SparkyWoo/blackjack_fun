import { supabase } from './supabase';

interface TestResult {
  success: boolean;
  error?: string;
  details?: unknown;
  data?: unknown;
}

/**
 * Test function to check if Supabase is properly configured
 */
export async function testSupabaseConnection(): Promise<TestResult> {
  try {
    // Try to fetch a single row from the game_state table
    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('Supabase connection test successful:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
} 