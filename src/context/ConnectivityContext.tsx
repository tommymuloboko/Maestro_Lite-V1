import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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

  const checkApiConnection = async () => {
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
  };

  const checkPts2Connection = async () => {
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
  };

  const checkConnectivity = async () => {
    await Promise.all([checkApiConnection(), checkPts2Connection()]);
  };

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, pollingIntervals.connectivity);
    return () => clearInterval(interval);
  }, [pts2Url]);

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
