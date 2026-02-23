import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { ConnectionStatus } from '@/types/common';
import { pollingIntervals } from '@/config/ui';
import { env } from '@/config/env';
import { useWebSocket } from './WebSocketContext';
import type { WsConnectionStatus } from '@/lib/ws/types';

interface ConnectivityContextValue {
  apiStatus: ConnectionStatus;
  wsStatus: WsConnectionStatus;
  checkConnectivity: () => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [apiStatus, setApiStatus] = useState<ConnectionStatus>('connecting');
  const { wsStatus } = useWebSocket();

  const checkApiConnection = useCallback(async () => {
    try {
      setApiStatus('connecting');
      const response = await fetch(`${env.apiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setApiStatus(response.ok ? 'connected' : 'error');
    } catch {
      setApiStatus('disconnected');
    }
  }, []);

  const checkConnectivity = useCallback(async () => {
    await checkApiConnection();
  }, [checkApiConnection]);

  useEffect(() => {
    const runCheck = () => {
      void checkConnectivity();
    };

    const initial = setTimeout(runCheck, 0);
    const interval = setInterval(runCheck, pollingIntervals.connectivity);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [checkConnectivity]);

  return (
    <ConnectivityContext.Provider value={{ apiStatus, wsStatus, checkConnectivity }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivityContext() {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivityContext must be used within ConnectivityProvider');
  }
  return context;
}
