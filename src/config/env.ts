const envSchema = {
  VITE_API_URL: import.meta.env.VITE_API_URL as string | undefined,
  VITE_WS_URL: import.meta.env.VITE_WS_URL as string | undefined,
  VITE_USE_MONITORING_SIMULATOR: import.meta.env.VITE_USE_MONITORING_SIMULATOR as string | undefined,
  VITE_STATION_ID: import.meta.env.VITE_STATION_ID as string | undefined,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME as string | undefined,
};

function asBool(value: string | undefined): boolean {
  return String(value).toLowerCase() === 'true';
}

export const env = {
  apiUrl: envSchema.VITE_API_URL ?? 'https://maestro-lite.onrender.com/api',
  wsUrl: envSchema.VITE_WS_URL ?? 'wss://maestro-lite.onrender.com/ws',
  useMonitoringSimulator: asBool(envSchema.VITE_USE_MONITORING_SIMULATOR),
  stationId: envSchema.VITE_STATION_ID ?? 'station-001',
  appName: envSchema.VITE_APP_NAME ?? 'Maestro-Lite',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
