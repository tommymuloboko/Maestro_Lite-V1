import type { AuthTokens, User } from '@/types/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'maestro_access_token',
  REFRESH_TOKEN: 'maestro_refresh_token',
  TOKEN_EXPIRES: 'maestro_token_expires',
  USER: 'maestro_user',
  STATION_ID: 'maestro_station_id',
} as const;

// Token storage
export function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES, String(tokens.expiresAt));
}

export function getStoredTokens(): AuthTokens | null {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES);

  if (!accessToken || !refreshToken || !expiresAt) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: Number(expiresAt),
  };
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES);
}

// User storage
export function storeUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// Station config storage
export function storeStationId(stationId: string): void {
  localStorage.setItem(STORAGE_KEYS.STATION_ID, stationId);
}

export function getStoredStationId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.STATION_ID);
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
