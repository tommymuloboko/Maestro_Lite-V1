import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { StationConfig } from '@/types/station';
import {
  getStoredStationId,
  getStoredPts2Url,
  getStoredApiBaseUrl,
  getStoredTokens,
  getStoredUser,
  storeStationId,
  storePts2Url,
  storeApiBaseUrl,
} from '@/lib/storage/secureStore';
import { env } from '@/config/env';
import { defaultCurrency } from '@/config/stationDefaults';

// Backend API URL (local backend spawned by Electron)
const API_BASE_URL = 'http://localhost:3000';

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
    pts2Url: getStoredPts2Url() ?? env.pts2Url,
    apiBaseUrl: getStoredApiBaseUrl() ?? env.apiBaseUrl,
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
        const response = await fetch(`${API_BASE_URL}/api/stations/${stationId}`, {
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

  const isConfigured = Boolean(config.stationId && config.pts2Url);

  const updateConfig = (updates: Partial<StationConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };

      if (updates.stationId) storeStationId(updates.stationId);
      if (updates.pts2Url) storePts2Url(updates.pts2Url);
      if (updates.apiBaseUrl) storeApiBaseUrl(updates.apiBaseUrl);

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

