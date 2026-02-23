/**
 * WebSocket Event Types & Message Envelope
 *
 * Defines the contract between the backend WS server and the frontend client.
 */

// ─── Event types sent by the server ──────────────────────────

export type WsEventType =
    | 'pump:status'       // full pump array snapshot
    | 'pump:update'       // single pump delta
    | 'tank:status'       // full tank array snapshot
    | 'tank:update'       // single tank delta
    | 'tank:alert'        // new / updated tank alert
    | 'shift:update'      // shift status change
    | 'transaction:new'   // new fuel transaction recorded
    | 'connected'         // server hello / handshake ack
    | 'error'             // server-side error
    | 'pong';             // heartbeat response

/**
 * Every message from the server is wrapped in this envelope.
 */
export interface WsMessage<T = unknown> {
    type: WsEventType;
    payload: T;
    timestamp?: string;
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
