import { createContext, useContext, useState, type ReactNode } from 'react';
import type { StationConfig } from '@/types/station';
import {
  getStoredStationId,
  getStoredPts2Url,
  getStoredApiBaseUrl,
  storeStationId,
  storePts2Url,
  storeApiBaseUrl,
} from '@/lib/storage/secureStore';
import { env } from '@/config/env';
import { defaultCurrency } from '@/config/stationDefaults';

interface StationConfigContextValue extends StationConfig {
  isConfigured: boolean;
  updateConfig: (config: Partial<StationConfig>) => void;
}

const StationConfigContext = createContext<StationConfigContextValue | null>(null);

export function StationConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StationConfig>({
    stationId: getStoredStationId() ?? env.stationId,
    stationName: '',
    pts2Url: getStoredPts2Url() ?? env.pts2Url,
    apiBaseUrl: getStoredApiBaseUrl() ?? env.apiBaseUrl,
    currency: defaultCurrency.code,
  });

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
    <StationConfigContext.Provider value={{ ...config, isConfigured, updateConfig }}>
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
