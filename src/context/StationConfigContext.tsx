import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { StationConfig } from '@/types/station';
import {
  getStoredStationId,
  getStoredTokens,
  getStoredUser,
  storeStationId,
} from '@/lib/storage/secureStore';
import { env } from '@/config/env';
import { defaultCurrency } from '@/config/stationDefaults';

interface StationConfigContextValue extends StationConfig {
  isConfigured: boolean;
  updateConfig: (config: Partial<StationConfig>) => void;
  isLoading: boolean;
}

const StationConfigContext = createContext<StationConfigContextValue | null>(null);

export function StationConfigProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<StationConfig>({
    stationId: getStoredStationId() ?? env.stationId,
    stationName: '',
    currency: defaultCurrency.code,
  });

  // Fetch station name from backend when user is logged in
  useEffect(() => {
    const fetchStationName = async () => {
      const user = getStoredUser();
      const tokens = getStoredTokens();
      const stationId = user?.stationId || config.stationId;

      if (!stationId || !tokens?.accessToken) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${env.apiUrl}/stations/${stationId}`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.station?.name) {
            setConfig(prev => ({
              ...prev,
              stationId,
              stationName: data.station.name
            }));
          }
        }
      } catch (error) {
        console.warn('Failed to fetch station name:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStationName();
  }, [config.stationId]);

  const isConfigured = Boolean(config.stationId);

  const updateConfig = (updates: Partial<StationConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };

      if (updates.stationId) storeStationId(updates.stationId);

      return newConfig;
    });
  };

  return (
    <StationConfigContext.Provider value={{ ...config, isConfigured, updateConfig, isLoading }}>
      {children}
    </StationConfigContext.Provider>
  );
}

export function useStationConfigContext() {
  const context = useContext(StationConfigContext);
  if (!context) {
    throw new Error('useStationConfigContext must be used within StationConfigProvider');
  }
  return context;
}
