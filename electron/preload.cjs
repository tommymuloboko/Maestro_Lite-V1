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

  // ─── Backend management ───
  getBackendStatus: () => ipcRenderer.invoke('backend:getStatus'),
  getBackendStatusDetails: () => ipcRenderer.invoke('backend:getStatusDetails'),
  restartBackend: () => ipcRenderer.invoke('backend:restart'),

  onBackendStatusChange: (callback) => {
    const handler = (_event, status) => callback(status);
    ipcRenderer.on('backend:status-changed', handler);
    return () => ipcRenderer.removeListener('backend:status-changed', handler);
  },

  onBackendLog: (callback) => {
    const handler = (_event, logEntry) => callback(logEntry);
    ipcRenderer.on('backend:log', handler);
    return () => ipcRenderer.removeListener('backend:log', handler);
  },
});

