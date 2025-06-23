'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams } from 'next/navigation';

// Only show in development
const isDev = process.env.NODE_ENV === 'development';

export default function AuthDebug() {
  const [authState, setAuthState] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (!isDev) return;

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (code) {
      addLog(`🔗 Auth code detected: ${code.substring(0, 10)}...`);
    }
    
    if (error) {
      addLog(`❌ Auth error detected: ${error}`);
    }

    const getAuthState = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          addLog(`❌ Session error: ${error.message}`);
        } else if (session) {
          addLog(`✅ Session active: ${session.user.id}`);
          setAuthState({
            user: session.user.id,
            email: session.user.email,
            expires: session.expires_at
          });
        } else {
          addLog(`⚠️ No session found`);
          setAuthState(null);
        }
      } catch (err) {
        addLog(`💥 Auth check failed: ${err}`);
      }
    };

    getAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`🔄 Auth state changed: ${event}`);
      if (session) {
        setAuthState({
          user: session.user.id,
          email: session.user.email,
          expires: session.expires_at
        });
      } else {
        setAuthState(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams, supabase]);

  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <h3 className="text-yellow-400 mb-2">🔍 Auth Debug</h3>
      
      <div className="mb-2">
        <span className="text-blue-400">Status:</span> {authState ? '✅ Authenticated' : '❌ Not authenticated'}
      </div>
      
      {authState && (
        <div className="mb-2 text-green-400">
          <div>User: {authState.user}</div>
          <div>Email: {authState.email}</div>
        </div>
      )}
      
      <div className="border-t border-gray-600 pt-2">
        <div className="text-gray-400 mb-1">Recent logs:</div>
        <div className="max-h-32 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-xs">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
} 