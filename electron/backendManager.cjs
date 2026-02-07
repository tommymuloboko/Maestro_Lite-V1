/**
 * Maestro-Lite — Backend Manager
 *
 * Spawns, monitors, and manages the lifecycle of the local Node.js backend.
 * The backend is expected to be in a separate directory (configured via env).
 *
 * Usage:
 *   const backendManager = require('./backendManager.cjs');
 *   await backendManager.spawn();
 *   backendManager.getStatus(); // 'STARTING' | 'ONLINE' | 'DEGRADED' | 'OFFLINE'
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');
const http = require('http');

// ─── Load .env file manually (no dotenv dependency) ──────────
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      // Only set if not already defined (don't override system env vars)
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
  console.log('[BackendManager] Loaded .env file');
}

// ─── Configuration ────────────────────────────────────────────
// These can be overridden via environment variables or passed to spawn()

const DEFAULT_CONFIG = {
  // Development: expects backend in a sibling folder or env var
  // Production: bundled in resources/backend
  backendDir: process.env.BACKEND_DIR || path.join(__dirname, '..', '..', 'maestro-backend'),
  backendEntry: process.env.BACKEND_ENTRY || 'index.js',
  backendPort: parseInt(process.env.BACKEND_PORT || '3000', 10),
  healthEndpoint: '/api/health',   // Backend uses /api/health (not /health)
  healthCheckInterval: 5000,       // Check health every 5 seconds
  healthCheckTimeout: 3000,        // 3 second timeout for health requests
  startupTimeout: 120000,          // 120 seconds to wait for backend to start (slow DB connections)
  startupRetryInterval: 1000,      // Retry health check every 1 second during startup
};

// ─── Status Constants ─────────────────────────────────────────

const STATUS = {
  OFFLINE: 'OFFLINE',
  STARTING: 'STARTING',
  ONLINE: 'ONLINE',
  DEGRADED: 'DEGRADED',
};

// ─── Backend Manager Class ────────────────────────────────────

class BackendManager extends EventEmitter {
  constructor() {
    super();
    this.process = null;
    this.status = STATUS.OFFLINE;
    this.config = { ...DEFAULT_CONFIG };
    this.healthCheckTimer = null;
    this.lastError = null;
  }

  /**
   * Get production backend path (bundled in resources)
   */
  getProductionBackendDir(app) {
    return path.join(process.resourcesPath, 'backend');
  }

  /**
   * Configure backend location
   * @param {object} options - Configuration overrides
   */
  configure(options = {}) {
    this.config = { ...this.config, ...options };
    this.log(`Configured with backendDir: ${this.config.backendDir}`);
  }

  /**
   * Spawn the backend process
   * @param {object} app - Electron app instance (for production path detection)
   * @returns {Promise<void>} Resolves when backend is healthy
   */
  async spawn(app) {
    if (this.process) {
      this.log('Backend already running, skipping spawn');
      return;
    }

    // In production, use bundled backend path
    if (app && app.isPackaged) {
      this.config.backendDir = this.getProductionBackendDir(app);
    }

    this.setStatus(STATUS.STARTING);
    this.log(`Starting backend from: ${this.config.backendDir}`);

    return new Promise((resolve, reject) => {
      const backendPath = path.join(this.config.backendDir, this.config.backendEntry);

      // Check if backend directory exists
      const fs = require('fs');
      if (!fs.existsSync(this.config.backendDir)) {
        const err = new Error(`Backend directory not found: ${this.config.backendDir}`);
        this.lastError = err;
        this.log(err.message, 'error');
        this.setStatus(STATUS.OFFLINE);
        reject(err);
        return;
      }

      if (!fs.existsSync(backendPath)) {
        const err = new Error(`Backend entry file not found: ${backendPath}`);
        this.lastError = err;
        this.log(err.message, 'error');
        this.setStatus(STATUS.OFFLINE);
        reject(err);
        return;
      }

      // Find node executable - use shell on Windows for PATH resolution
      const isWindows = process.platform === 'win32';

      this.log(`Spawning: node ${backendPath}`);

      // Spawn Node.js process
      // Use shell: true on Windows to resolve 'node' from PATH
      this.process = spawn('node', [backendPath], {
        cwd: this.config.backendDir,
        env: {
          ...process.env,
          PORT: String(this.config.backendPort),
          NODE_ENV: app?.isPackaged ? 'production' : 'development',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: isWindows,  // Use shell on Windows for PATH resolution
        windowsHide: true,
      });

      // Handle stdout
      this.process.stdout.on('data', (data) => {
        const message = data.toString().trim();
        this.log(`[backend] ${message}`);
        this.emit('log', { type: 'stdout', message });
      });

      // Handle stderr
      this.process.stderr.on('data', (data) => {
        const message = data.toString().trim();
        this.log(`[backend:error] ${message}`, 'error');
        this.emit('log', { type: 'stderr', message });
      });

      // Handle process exit
      this.process.on('exit', (code, signal) => {
        this.log(`Backend exited with code ${code}, signal ${signal}`);
        this.process = null;
        this.setStatus(STATUS.OFFLINE);
        this.stopHealthCheck();
        this.emit('exit', { code, signal });
      });

      // Handle spawn error
      this.process.on('error', (err) => {
        this.lastError = err;
        this.log(`Failed to spawn backend: ${err.message}`, 'error');
        this.setStatus(STATUS.OFFLINE);
        reject(err);
      });

      // Wait for backend to be healthy
      this.waitForHealth()
        .then(() => {
          this.setStatus(STATUS.ONLINE);
          this.startHealthCheck();
          resolve();
        })
        .catch((err) => {
          this.lastError = err;
          this.log(`Backend failed to become healthy: ${err.message}`, 'error');
          this.stop();
          reject(err);
        });
    });
  }

  /**
   * Stop the backend process
   */
  stop() {
    if (this.process) {
      this.log('Stopping backend...');
      this.stopHealthCheck();

      // Try graceful shutdown first
      this.process.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.process) {
          this.log('Force killing backend...');
          this.process.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  /**
   * Restart the backend
   * @param {object} app - Electron app instance
   */
  async restart(app) {
    this.log('Restarting backend...');
    this.stop();

    // Wait for process to fully exit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return this.spawn(app);
  }

  /**
   * Get current status
   * @returns {string} Current status
   */
  getStatus() {
    return this.status;
  }

  /**
   * Get detailed status info
   * @returns {object} Status details
   */
  getStatusDetails() {
    return {
      status: this.status,
      pid: this.process?.pid || null,
      port: this.config.backendPort,
      backendDir: this.config.backendDir,
      lastError: this.lastError?.message || null,
    };
  }

  // ─── Private Methods ────────────────────────────────────────

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      const oldStatus = this.status;
      this.status = newStatus;
      this.log(`Status changed: ${oldStatus} → ${newStatus}`);
      this.emit('status-changed', { oldStatus, newStatus });
    }
  }

  /**
   * Wait for backend health endpoint to respond
   */
  async waitForHealth() {
    const startTime = Date.now();
    const { startupTimeout, startupRetryInterval, backendPort, healthEndpoint } = this.config;

    return new Promise((resolve, reject) => {
      const checkHealth = () => {
        if (Date.now() - startTime > startupTimeout) {
          reject(new Error(`Backend did not become healthy within ${startupTimeout}ms`));
          return;
        }

        this.checkHealthOnce(backendPort, healthEndpoint)
          .then((healthy) => {
            if (healthy) {
              resolve();
            } else {
              setTimeout(checkHealth, startupRetryInterval);
            }
          })
          .catch(() => {
            setTimeout(checkHealth, startupRetryInterval);
          });
      };

      checkHealth();
    });
  }

  /**
   * Single health check request
   */
  checkHealthOnce(port, endpoint) {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: endpoint,
          method: 'GET',
          timeout: this.config.healthCheckTimeout,
        },
        (res) => {
          resolve(res.statusCode === 200);
        }
      );

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  /**
   * Start periodic health checks
   */
  startHealthCheck() {
    this.stopHealthCheck();

    this.healthCheckTimer = setInterval(async () => {
      const healthy = await this.checkHealthOnce(
        this.config.backendPort,
        this.config.healthEndpoint
      );

      if (healthy && this.status !== STATUS.ONLINE) {
        this.setStatus(STATUS.ONLINE);
      } else if (!healthy && this.status === STATUS.ONLINE) {
        this.setStatus(STATUS.DEGRADED);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Log helper
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[BackendManager][${level.toUpperCase()}]`;
    console.log(`${timestamp} ${prefix} ${message}`);
  }
}

// Export singleton instance
module.exports = new BackendManager();
