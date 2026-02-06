const envSchema = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string | undefined,
  VITE_PTS2_URL: import.meta.env.VITE_PTS2_URL as string | undefined,
  VITE_STATION_ID: import.meta.env.VITE_STATION_ID as string | undefined,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME as string | undefined,
};

export const env = {
  apiBaseUrl: envSchema.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  pts2Url: envSchema.VITE_PTS2_URL ?? '',
  stationId: envSchema.VITE_STATION_ID ?? '',
  appName: envSchema.VITE_APP_NAME ?? 'Maestro-Lite',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
