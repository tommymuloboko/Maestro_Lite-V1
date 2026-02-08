/**
 * Maestro-Lite — Electron Main Process (ESM)
 *
 * This is the entry point for the Electron desktop app.
 * In development it loads from the Vite dev server (localhost:5173).
 * In production it loads the built files from the dist/ folder.
 *
 * The backend is spawned as a child process and managed by backendManager.
 */

import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-load backend manager (after app is ready)
let backendManager = null;
async function getBackendManager() {
    if (!backendManager) {
        const mod = await import('./backendManager.mjs');
        backendManager = mod.default;
    }
    return backendManager;
}

// ─── Environment ──────────────────────────────────────────────
const isDev = () => !app.isPackaged;
const DEV_URL = 'http://localhost:5173';

/** @type {BrowserWindow | null} */
let mainWindow = null;

// ─── Single instance lock ─────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to open a second instance — focus existing window
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// ─── Create the main window ──────────────────────────────────
function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: Math.min(1440, width),
        height: Math.min(900, height),
        minWidth: 1024,
        minHeight: 680,
        title: 'Maestro-Lite',
        icon: path.join(__dirname, '..', 'build', 'icon.ico'),
        backgroundColor: '#1a1b1e', // dark theme bg — avoids white flash
        show: false, // show when ready to prevent flicker
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            spellcheck: false,
        },
    });

    // Show when content is painted (avoids blank window flash)
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev()) {
            mainWindow.webContents.openDevTools({ mode: 'bottom' });
        }
    });

    // Load the app
    if (isDev()) {
        mainWindow.loadURL(DEV_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    // Open external links in the OS browser, not in Electron
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ─── IPC Handlers ─────────────────────────────────────────────
// Expose safe APIs to the renderer via preload

ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:getName', () => app.getName());
ipcMain.handle('app:getPlatform', () => process.platform);
ipcMain.handle('app:isDev', () => isDev());

ipcMain.handle('app:getPath', (_event, name) => {
    const allowed = ['userData', 'documents', 'desktop', 'temp', 'logs'];
    if (!allowed.includes(name)) {
        throw new Error(`Access to path "${name}" is not allowed`);
    }
    return app.getPath(name);
});

ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});
ipcMain.handle('window:close', () => mainWindow?.close());
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);

// ─── Backend IPC Handlers ────────────────────────────────────

ipcMain.handle('backend:getStatus', async () => {
    const bm = await getBackendManager();
    return bm.getStatus();
});
ipcMain.handle('backend:getStatusDetails', async () => {
    const bm = await getBackendManager();
    return bm.getStatusDetails();
});
ipcMain.handle('backend:restart', async () => {
    const bm = await getBackendManager();
    await bm.restart(app);
    return bm.getStatus();
});

// ─── App lifecycle ────────────────────────────────────────────

// Startup sequence: spawn backend, then create window
app.whenReady().then(async () => {
    console.log('[Main] App ready, starting backend...');

    try {
        const bm = await getBackendManager();

        // Forward backend status changes to renderer
        bm.on('status-changed', ({ newStatus }) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('backend:status-changed', newStatus);
            }
        });

        // Forward backend logs to renderer (optional, for debugging)
        bm.on('log', (logEntry) => {
            if (mainWindow && !mainWindow.isDestroyed() && isDev()) {
                mainWindow.webContents.send('backend:log', logEntry);
            }
        });

        // Spawn backend and wait for it to be healthy
        await bm.spawn(app);
        console.log('[Main] Backend is online, creating window...');
    } catch (err) {
        console.error('[Main] Backend failed to start:', err.message);
        // Continue anyway — app will show degraded status
        // User can retry via UI or the app can work in limited mode
    }

    createWindow();
});

app.on('window-all-closed', () => {
    // On macOS apps stay active until Cmd+Q, but Maestro is Windows-only
    app.quit();
});

app.on('before-quit', async () => {
    // Stop backend gracefully when app is closing
    console.log('[Main] App quitting, stopping backend...');
    if (backendManager) {
        backendManager.stop();
    }
});

app.on('activate', () => {
    // Re-create window on macOS dock click (defensive, mainly Windows app)
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
