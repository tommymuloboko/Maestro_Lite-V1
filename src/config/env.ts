const envSchema = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string | undefined,
  VITE_PTS2_URL: import.meta.env.VITE_PTS2_URL as string | undefined,
  VITE_USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API as string | undefined,
  VITE_USE_MONITORING_SIMULATOR: import.meta.env.VITE_USE_MONITORING_SIMULATOR as string | undefined,
  VITE_STATION_ID: import.meta.env.VITE_STATION_ID as string | undefined,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME as string | undefined,
};

function asBool(value: string | undefined): boolean {
  return String(value).toLowerCase() === 'true';
}

export const env = {
  apiBaseUrl: envSchema.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  pts2Url: envSchema.VITE_PTS2_URL ?? '',
  useMonitoringSimulator: asBool(envSchema.VITE_USE_MONITORING_SIMULATOR ?? envSchema.VITE_USE_MOCK_API),
  stationId: envSchema.VITE_STATION_ID ?? 'station-001',
  appName: envSchema.VITE_APP_NAME ?? 'Maestro-Lite',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
