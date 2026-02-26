/**
 * WebSocket Event Types & Message Envelope
 *
 * Defines the contract between the backend WS server and the frontend client.
 */

// ─── Event types sent by the server ──────────────────────────

export type WsEventType =
    // Colon-separated (future / alias)
    | 'pump:status'       // full pump array snapshot
    | 'pump:update'       // single pump delta
    | 'tank:status'       // full tank array snapshot
    | 'tank:update'       // single tank delta
    | 'tank:alert'        // new / updated tank alert
    | 'shift:update'      // shift status change
    | 'transaction:new'   // new fuel transaction recorded
    // camelCase names the backend actually sends
    | 'pumpStatus'
    | 'tankStatus'
    | 'transaction'
    // system
    | 'connected'         // server hello / handshake ack
    | 'error'             // server-side error
    | 'pong';             // heartbeat response

/**
 * Every message from the server is wrapped in this envelope.
 */
export interface WsMessage<T = unknown> {
    type: WsEventType;
    /** Present when the server wraps data in { type, payload }. */
    payload?: T;
    timestamp?: string;
    /** The backend often sends flat messages (e.g. { type, pump, status }). */
    [key: string]: unknown;
}

// ─── Typed payloads for known events ─────────────────────────

export interface WsConnectedPayload {
    message?: string;
    serverTime?: string;
}

export interface WsErrorPayload {
    code?: string;
    message: string;
}

// ─── Client connection states ────────────────────────────────

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// ─── Listener signature ──────────────────────────────────────

export type WsListener<T = unknown> = (payload: T, raw: WsMessage<T>) => void;
