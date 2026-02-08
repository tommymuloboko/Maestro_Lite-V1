import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { ConnectionStatus } from '@/types/common';
import { pollingIntervals } from '@/config/ui';
import { env } from '@/config/env';
import { useStationConfigContext } from './StationConfigContext';

interface ConnectivityContextValue {
  apiStatus: ConnectionStatus;
  pts2Status: ConnectionStatus;
  checkConnectivity: () => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const { pts2Url } = useStationConfigContext();
  const [apiStatus, setApiStatus] = useState<ConnectionStatus>('connecting');
  const [pts2Status, setPts2Status] = useState<ConnectionStatus>('connecting');

  const checkApiConnection = useCallback(async () => {
    try {
      setApiStatus('connecting');
      const response = await fetch(`${env.apiBaseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setApiStatus(response.ok ? 'connected' : 'error');
    } catch {
      setApiStatus('disconnected');
    }
  }, []);

  const checkPts2Connection = useCallback(async () => {
    if (!pts2Url) {
      setPts2Status('disconnected');
      return;
    }

    try {
      setPts2Status('connecting');
      const response = await fetch(`${pts2Url}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setPts2Status(response.ok ? 'connected' : 'error');
    } catch {
      setPts2Status('disconnected');
    }
  }, [pts2Url]);

  const checkConnectivity = useCallback(async () => {
    await Promise.all([checkApiConnection(), checkPts2Connection()]);
  }, [checkApiConnection, checkPts2Connection]);

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
    <ConnectivityContext.Provider value={{ apiStatus, pts2Status, checkConnectivity }}>
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
