/**
 * Type declarations for the Electron preload bridge.
 * Accessible in the renderer as window.electronAPI
 */

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
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
