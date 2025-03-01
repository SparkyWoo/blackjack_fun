'use client';

import { useState, useEffect } from 'react';
import { testSupabaseConnection } from '@/lib/test-supabase';

interface TestResult {
  success: boolean;
  error?: string;
  details?: unknown;
  data?: unknown;
}

export default function TestPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runTest() {
      try {
        setLoading(true);
        const testResult = await testSupabaseConnection();
        setResult(testResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Testing connection...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && result && (
          <div>
            <div className={`p-4 mb-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-bold">{result.success ? 'Connection Successful' : 'Connection Failed'}</p>
            </div>
            
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Result Details:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
            <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '******' : 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 