/**
 * Hook to access Electron APIs safely.
 * Returns undefined when running in the browser (non-Electron).
 */
export function useElectron() {
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;

  return {
    /** true when running inside Electron */
    isElectron: !!api,
    /** The electronAPI bridge (undefined in browser) */
    api,
  };
}

/**
 * Check if we're running inside Electron (non-hook version).
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}
