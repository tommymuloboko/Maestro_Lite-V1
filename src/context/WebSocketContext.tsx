/**
 * WebSocket Context — manages WS lifecycle tied to auth state,
 * and injects real-time data into the React Query cache.
 */

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from './AuthContext';
import { WebSocketClient } from '@/lib/ws/websocketClient';
import type { WsConnectionStatus } from '@/lib/ws/types';
import type { Pump } from '@/types/pumps';
import type { Tank, TankAlert } from '@/types/tanks';
import { queryKeys } from '@/lib/query/keys';
import { env } from '@/config/env';

// ─── Context value ───────────────────────────────────────────

interface WebSocketContextValue {
    /** Current WS connection status */
    wsStatus: WsConnectionStatus;
    /** Force reconnect (e.g. after network recovery) */
    reconnect: () => void;
    /** The underlying client — use for advanced subscriptions */
    client: WebSocketClient | null;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthContext();
    const queryClient = useQueryClient();
    const clientRef = useRef<WebSocketClient | null>(null);
    const [wsStatus, setWsStatus] = useState<WsConnectionStatus>('disconnected');

    // Create or get the singleton client
    const getClient = useCallback(() => {
        if (!clientRef.current) {
            const client = new WebSocketClient(env.wsUrl);

            client.onStatusChange = (status) => {
                setWsStatus(status);
            };

            // ─── Pump events → React Query cache ─────────────────

            client.on<Pump[]>('pump:status', (pumps) => {
                if (Array.isArray(pumps) && pumps.length > 0) {
                    queryClient.setQueryData(queryKeys.pumps.status(), pumps);
                }
            });

            client.on<Pump>('pump:update', (pump) => {
                if (!pump || !pump.id) return;
                queryClient.setQueryData<Pump[]>(queryKeys.pumps.status(), (prev) => {
                    if (!prev) return prev;
                    return prev.map((p) => (p.id === pump.id ? { ...p, ...pump } : p));
                });
            });

            // ─── Tank events → React Query cache ─────────────────

            client.on<Tank[]>('tank:status', (tanks) => {
                if (Array.isArray(tanks) && tanks.length > 0) {
                    queryClient.setQueryData(queryKeys.tanks.list(), tanks);
                }
            });

            client.on<Tank>('tank:update', (tank) => {
                if (!tank || !tank.id) return;
                queryClient.setQueryData<Tank[]>(queryKeys.tanks.list(), (prev) => {
                    if (!prev) return prev;
                    return prev.map((t) => (t.id === tank.id ? { ...t, ...tank } : t));
                });
            });

            // ─── Tank alerts → React Query cache ─────────────────

            client.on<TankAlert>('tank:alert', (alert) => {
                if (!alert) return;
                queryClient.setQueryData<TankAlert[]>(queryKeys.tanks.alerts(), (prev) => {
                    const existing = prev ?? [];
                    // Replace if same ID, otherwise prepend
                    const idx = existing.findIndex((a) => a.id === alert.id);
                    if (idx >= 0) {
                        const updated = [...existing];
                        updated[idx] = alert;
                        return updated;
                    }
                    return [alert, ...existing];
                });
            });

            // ─── Shift & transaction events → invalidate queries ─

            client.on('shift:update', () => {
                void queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
                void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
            });

            client.on('transaction:new', () => {
                void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
                void queryClient.invalidateQueries({ queryKey: queryKeys.fuelSales.all });
                void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
            });

            // ─── Debug logging in dev mode ───────────────────────

            if (env.isDev) {
                client.onAny((_payload, msg) => {
                    if (msg.type !== 'pong') {
                        console.log(`[WS Event] ${msg.type}`, msg.payload);
                    }
                });
            }

            clientRef.current = client;
        }

        return clientRef.current;
    }, [queryClient]);

    // Connect when authenticated, disconnect when not
    useEffect(() => {
        const client = getClient();

        if (isAuthenticated) {
            client.connect();
        } else {
            client.disconnect();
        }

        return () => {
            client.disconnect();
        };
    }, [isAuthenticated, getClient]);

    const reconnect = useCallback(() => {
        const client = clientRef.current;
        if (client && isAuthenticated) {
            client.disconnect();
            // Small delay to let the close complete
            setTimeout(() => client.connect(), 100);
        }
    }, [isAuthenticated]);

    return (
        <WebSocketContext.Provider
            value={{
                wsStatus,
                reconnect,
                client: clientRef.current,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
}
