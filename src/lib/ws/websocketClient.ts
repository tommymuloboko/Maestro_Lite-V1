/**
 * WebSocket Client — reconnecting, authenticated WS manager.
 *
 * Features:
 *  • Exponential backoff reconnect (1 s → 30 s cap)
 *  • JWT auth via query-string token
 *  • Heartbeat ping/pong (30 s interval, 10 s timeout)
 *  • Typed event emitter (on / off)
 *  • Status change callback
 */

import type { WsConnectionStatus, WsEventType, WsListener, WsMessage } from './types';
import { getStoredTokens } from '@/lib/storage/secureStore';

// ─── Config ──────────────────────────────────────────────────

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_TIMEOUT_MS = 10_000;

// ─── Client ──────────────────────────────────────────────────

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private listeners = new Map<WsEventType, Set<WsListener>>();
    private wildcardListeners = new Set<WsListener>();
    private reconnectAttempt = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
    private intentionalClose = false;

    private _status: WsConnectionStatus = 'disconnected';
    public onStatusChange: ((status: WsConnectionStatus) => void) | null = null;

    constructor(url: string) {
        this.url = url;
    }

    // ─── Public API ────────────────────────────────────────────

    get status(): WsConnectionStatus {
        return this._status;
    }

    get isConnected(): boolean {
        return this._status === 'connected';
    }

    /** Open the WebSocket connection. Safe to call multiple times. */
    connect(): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.intentionalClose = false;
        this.doConnect();
    }

    /** Gracefully close the connection. Will NOT auto-reconnect. */
    disconnect(): void {
        this.intentionalClose = true;
        this.cleanup();
        this.setStatus('disconnected');
        console.log('[WS] Disconnected (intentional)');
    }

    /** Subscribe to a specific event type. */
    on<T = unknown>(type: WsEventType, listener: WsListener<T>): void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)!.add(listener as WsListener);
    }

    /** Unsubscribe from a specific event type. */
    off<T = unknown>(type: WsEventType, listener: WsListener<T>): void {
        this.listeners.get(type)?.delete(listener as WsListener);
    }

    /** Subscribe to ALL events (useful for logging / debugging). */
    onAny(listener: WsListener): void {
        this.wildcardListeners.add(listener);
    }

    /** Unsubscribe from ALL events listener. */
    offAny(listener: WsListener): void {
        this.wildcardListeners.delete(listener);
    }

    // ─── Internals ─────────────────────────────────────────────

    private doConnect(): void {
        this.cleanup();

        const tokens = getStoredTokens();
        const authParam = tokens?.accessToken ? `?token=${encodeURIComponent(tokens.accessToken)}` : '';
        const fullUrl = `${this.url}${authParam}`;

        console.log(`[WS] Connecting to ${this.url}...`);
        this.setStatus('connecting');

        try {
            this.ws = new WebSocket(fullUrl);
        } catch (err) {
            console.error('[WS] Failed to create WebSocket:', err);
            this.setStatus('error');
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = () => {
            console.log('[WS] Connected');
            this.reconnectAttempt = 0;
            this.setStatus('connected');
            this.startHeartbeat();
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
            console.log(`[WS] Closed (code=${event.code}, reason=${event.reason})`);
            this.stopHeartbeat();

            if (!this.intentionalClose) {
                this.setStatus('disconnected');
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (event) => {
            console.warn('[WS] Error:', event);
            // onclose will fire after onerror, so reconnect is handled there
        };
    }

    private handleMessage(raw: unknown): void {
        if (typeof raw !== 'string') return;

        // Handle bare pong responses
        if (raw === 'pong') {
            this.clearHeartbeatTimeout();
            return;
        }

        let msg: WsMessage;
        try {
            msg = JSON.parse(raw);
        } catch {
            console.warn('[WS] Non-JSON message:', raw);
            return;
        }

        if (!msg.type) {
            console.warn('[WS] Message missing type:', msg);
            return;
        }

        // Handle pong inside JSON envelope
        if (msg.type === 'pong') {
            this.clearHeartbeatTimeout();
            return;
        }

        // Extract the effective payload:
        // If the server wraps data in { type, payload }, use msg.payload.
        // Otherwise the backend sends flat objects like { type, pump, status, nozzle }
        // — gather all fields except `type` and `timestamp` as the payload.
        const effectivePayload: unknown =
            msg.payload !== undefined
                ? msg.payload
                : (() => {
                    const { type: _t, timestamp: _ts, ...rest } = msg;
                    return Object.keys(rest).length > 0 ? rest : undefined;
                })();

        // Emit to type-specific listeners
        const typeListeners = this.listeners.get(msg.type);
        if (typeListeners) {
            for (const listener of typeListeners) {
                try {
                    listener(effectivePayload, msg);
                } catch (err) {
                    console.error(`[WS] Listener error for "${msg.type}":`, err);
                }
            }
        }

        // Emit to wildcard listeners
        for (const listener of this.wildcardListeners) {
            try {
                listener(effectivePayload, msg);
            } catch (err) {
                console.error('[WS] Wildcard listener error:', err);
            }
        }
    }

    // ─── Heartbeat ─────────────────────────────────────────────

    private startHeartbeat(): void {
        this.stopHeartbeat();

        this.heartbeatTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send('ping');

                this.heartbeatTimeout = setTimeout(() => {
                    console.warn('[WS] Heartbeat timeout — closing connection');
                    this.ws?.close(4000, 'Heartbeat timeout');
                }, HEARTBEAT_TIMEOUT_MS);
            }
        }, HEARTBEAT_INTERVAL_MS);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        this.clearHeartbeatTimeout();
    }

    private clearHeartbeatTimeout(): void {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    // ─── Reconnect ─────────────────────────────────────────────

    private scheduleReconnect(): void {
        if (this.intentionalClose) return;

        const delay = Math.min(
            RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempt),
            RECONNECT_MAX_MS,
        );

        this.reconnectAttempt += 1;
        console.log(`[WS] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempt})...`);

        this.reconnectTimer = setTimeout(() => {
            this.doConnect();
        }, delay);
    }

    // ─── Cleanup ───────────────────────────────────────────────

    private cleanup(): void {
        this.stopHeartbeat();

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            // Remove handlers before closing to prevent cascading events
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onclose = null;
            this.ws.onerror = null;

            if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
                this.ws.close(1000, 'Client cleanup');
            }

            this.ws = null;
        }
    }

    private setStatus(status: WsConnectionStatus): void {
        if (this._status === status) return;
        this._status = status;
        this.onStatusChange?.(status);
    }
}
