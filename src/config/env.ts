const envSchema = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string | undefined,
  VITE_PTS2_URL: import.meta.env.VITE_PTS2_URL as string | undefined,
  VITE_STATION_ID: import.meta.env.VITE_STATION_ID as string | undefined,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME as string | undefined,
  VITE_USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API as string | undefined,
};

export const env = {
  apiBaseUrl: envSchema.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  pts2Url: envSchema.VITE_PTS2_URL ?? '',
  stationId: envSchema.VITE_STATION_ID ?? 'station-001',
  appName: envSchema.VITE_APP_NAME ?? 'Maestro-Lite',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  /**
   * When true, all API calls use the in-memory mock service layer
   * instead of hitting the real Node.js backend on localhost:3000.
   *
   * Controlled by VITE_USE_MOCK_API env var.
   * Defaults to true in dev, false in production.
   */
  useMockApi:
    envSchema.VITE_USE_MOCK_API !== undefined
      ? envSchema.VITE_USE_MOCK_API === 'true'
      : import.meta.env.DEV,
} as const;
