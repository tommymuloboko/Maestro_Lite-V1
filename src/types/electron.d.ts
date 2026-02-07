/**
 * Type declarations for the Electron preload bridge.
 * Accessible in the renderer as window.electronAPI
 */

export type BackendStatus = 'OFFLINE' | 'STARTING' | 'ONLINE' | 'DEGRADED';

export interface BackendStatusDetails {
  status: BackendStatus;
  pid: number | null;
  port: number;
  backendDir: string;
  lastError: string | null;
}

export interface BackendLogEntry {
  type: 'stdout' | 'stderr';
  message: string;
}

export interface ElectronAPI {
  // App info
  getVersion: () => Promise<string>;
  getName: () => Promise<string>;
  getPlatform: () => Promise<NodeJS.Platform>;
  isDev: () => Promise<boolean>;
  getPath: (name: 'userData' | 'documents' | 'desktop' | 'temp' | 'logs') => Promise<string>;

  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;

  // Events
  onMaximizeChange: (callback: (maximized: boolean) => void) => () => void;

  // Backend management
  getBackendStatus: () => Promise<BackendStatus>;
  getBackendStatusDetails: () => Promise<BackendStatusDetails>;
  restartBackend: () => Promise<BackendStatus>;
  onBackendStatusChange: (callback: (status: BackendStatus) => void) => () => void;
  onBackendLog: (callback: (entry: BackendLogEntry) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

