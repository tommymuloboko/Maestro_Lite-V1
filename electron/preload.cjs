/**
 * Maestro-Lite — Electron Preload Script
 *
 * Exposes a safe, typed bridge between the Electron main process
 * and the React renderer process via contextBridge.
 *
 * The renderer accesses these via window.electronAPI.*
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── App info ───
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getName: () => ipcRenderer.invoke('app:getName'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  isDev: () => ipcRenderer.invoke('app:isDev'),
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),

  // ─── Window controls (for custom titlebar if needed) ───
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // ─── Event listeners ───
  onMaximizeChange: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('window:maximized-changed', handler);
    return () => ipcRenderer.removeListener('window:maximized-changed', handler);
  },
});
