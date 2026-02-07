# Maestro-Lite
# Electron ↔ Local Backend Integration (Single Source of Truth)

This document is the **complete and authoritative guide** for how the Maestro-Lite
**Electron (Vite + React) desktop application** integrates with the **local Node.js backend**
that communicates with the PTS2 controller, manages offline data, and synchronizes with Supabase.

This file intentionally contains **everything in one place**.

---

## 1. What Maestro-Lite Is (Context)

Maestro-Lite is a **fuel-only backoffice system**.

- No POS
- No cashier
- No quick-clear
- Fuel transactions come from **PTS2**
- Attendants authorize pumps via **RFID / tag**
- Payment type is assigned **after the fact** by a manager
- Only **verified transactions** are visible to HQ and reports

The Electron app is **station backoffice only**.

---

## 2. Chosen Integration Model (Option B)

**Electron starts and controls the backend process.**

This means:
- One application icon for the station
- No manual backend startup
- Backend dies when Electron exits
- UI never runs without the backend

This is the correct model for fuel station environments.

---

## 3. High-Level Architecture

```
Electron UI (Vite + React)
        |
        | HTTP / WebSocket
        v
Electron Main Process
        |
        | spawn
        v
Local Node Backend
 (PTS2, SQLite, Sync, Supabase)
```

---

## 4. Responsibility Separation

### Electron (Frontend)
- Renders UI
- Starts/stops backend
- Calls APIs
- Shows backend health

### Backend (Server)
- Polls PTS2
- Handles shifts & verification
- Stores offline data
- Syncs to Supabase

---

## 5. Backend Health Contract

Required endpoint:

GET /health

Response:
```json
{
  "ok": true,
  "uptime": 123456,
  "timestamp": "2026-02-07T10:00:00Z"
}
```

---

## 6. Backend Startup Flow

1. Electron launches
2. Backend is spawned
3. Electron waits for /health
4. UI loads
5. Backend marked ONLINE

---

## 7. Environment Configuration

### Development
```env
BACKEND_DIR=C:\path\to\backend
BACKEND_ENTRY=index.js
BACKEND_PORT=3000
VITE_API_BASE_URL=http://127.0.0.1:3000
```

### Production
Backend bundled in:
```
resources/backend
```

---

## 8. Backend Status Indicator (UI)

### States
- STARTING
- ONLINE
- DEGRADED
- OFFLINE

### Check Logic
Poll /health every 5s with 3s timeout.

---

## 9. Offline-First Behavior

- SQLite always written first
- Internet loss does not stop station
- Sync retries automatically

---

## 10. Final Guarantees

✔ Offline safe  
✔ Auditable  
✔ Fuel-industry correct  
✔ Single source of truth  

