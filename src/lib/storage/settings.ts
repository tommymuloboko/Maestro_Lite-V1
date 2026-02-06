import { getStoredStationId } from './secureStore';

const SETTINGS_PREFIX = 'maestro_settings_';

function getSettingsKey(key: string): string {
  const stationId = getStoredStationId() ?? 'default';
  return `${SETTINGS_PREFIX}${stationId}_${key}`;
}

export function getSetting<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(getSettingsKey(key));
    if (stored === null) {
      return defaultValue;
    }
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

export function setSetting<T>(key: string, value: T): void {
  localStorage.setItem(getSettingsKey(key), JSON.stringify(value));
}

export function removeSetting(key: string): void {
  localStorage.removeItem(getSettingsKey(key));
}

export function clearAllSettings(): void {
  const stationId = getStoredStationId() ?? 'default';
  const prefix = `${SETTINGS_PREFIX}${stationId}_`;
  
  Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => localStorage.removeItem(key));
}
