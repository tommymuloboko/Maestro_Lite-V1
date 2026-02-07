# Attendant Tag API Specification

This document defines **all endpoints, rules, and behaviors** for managing attendant RFID / tag assignments using the existing
`attendant_tags` table only.  
No new columns are introduced. Nothing is omitted.

---

## Data Model (Existing Columns Only)

### attendant_tags

| Column        | Type        | Notes |
|--------------|------------|-------|
| id           | uuid (PK)  | Primary key |
| attendant_id | uuid       | Required, FK → attendants.id |
| station_id   | uuid       | Required, FK → stations.id |
| tag_number   | text       | Required, treated as globally unique |
| is_active    | boolean    | Default true |
| issued_at    | timestamptz| Default now() |
| revoked_at   | timestamptz| Nullable |

### Important Notes
- `tag_number` **must be globally unique**
- If uniqueness is not enforced at DB level, **enforce it in server logic**
- Only one active tag per attendant is recommended

---

## 1) Issue / Assign Tag to Attendant

### Endpoint
POST /api/attendant-tags

### Request
```json
{
  "attendant_id": "uuid",
  "station_id": "uuid",
  "tag_number": "text"
}
```

### Database Behavior
- Optional (recommended): auto-revoke any existing active tag for this attendant
- Insert new row into `attendant_tags`:
  - is_active = true
  - issued_at = now()
  - revoked_at = null

### Response
```json
{
  "error": false,
  "data": {
    "id": "uuid",
    "attendant_id": "uuid",
    "station_id": "uuid",
    "tag_number": "TAG123",
    "is_active": true,
    "issued_at": "2026-02-07T00:00:00.000Z",
    "revoked_at": null
  }
}
```

### Rules (Server-Side Enforcement)
- attendant_id must exist in `attendants`
- station_id must exist in `stations`
- tag_number must not already be active for another attendant
- Recommended: only allow issuing tags within attendant’s station  
  (`attendants.station_id == station_id`)

---

## 2) List Tags (All / Filtered)

### Endpoint
GET /api/attendant-tags

### Query Parameters
- station_id
- attendant_id
- active (true / false)

### Examples
```
/api/attendant-tags?attendant_id=UUID
/api/attendant-tags?station_id=UUID&active=true
```

### Response
Returns a list of `attendant_tags` rows.

---

## 3) Get One Tag

### Endpoint
GET /api/attendant-tags/{tagId}

### Response
Returns the `attendant_tags` row.

### Rules
- Tag must exist

---

## 4) Revoke a Tag (Disable)

### Endpoint
POST /api/attendant-tags/{tagId}/revoke

### Request
```json
{}
```

### Database Write
Update `attendant_tags`:
- is_active = false
- revoked_at = now()

### Response
Returns updated row.

### Rules
- Tag must exist
- Tag must currently be `is_active = true`

---

## 5) Reactivate a Tag (Optional)

⚠ Only if business rules allow reusing the same tag record.

### Endpoint
POST /api/attendant-tags/{tagId}/activate

### Database Write
Update `attendant_tags`:
- is_active = true
- revoked_at = null
- **Do NOT change issued_at**

### Rules
- Ensure attendant does not already have another active tag
  - OR auto-revoke the other active tag

---

## 6) Get Active Tag for an Attendant (Very Common)

### Endpoint
GET /api/attendants/{attendantId}/active-tag

### Behavior
- Find `attendant_tags` where:
  - attendant_id = {attendantId}
  - is_active = true

### Response
- 200 → active tag row
- 404 → no active tag found

---

## Recommended Constraints (Logic-Level)

- One active tag per attendant
- One active tag per tag_number (global)
- Auto-revoke old tags on reassignment
- All validation enforced server-side if DB constraints are missing

---

**End of Specification**
