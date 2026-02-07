# Attendant Shift API – Full Specification

This document defines the **complete attendant shift lifecycle**, API endpoints, database writes, rules, and state transitions.
It strictly follows the provided specification and **does not introduce any new columns**.

Source: Attendant_Shift.txt

---

## 1) Open Shift (Create attendant_shifts)

### Endpoint
POST /api/attendant-shifts/open

### Request (only existing columns)
```json
{
  "company_id": "uuid",
  "station_id": "uuid",
  "attendant_id": "uuid",
  "tag_number": "text",
  "opened_by_user_id": "uuid"
}
```

### Database Write
Insert into `attendant_shifts`:
- company_id
- station_id
- attendant_id
- tag_number
- opened_by_user_id
- started_at = now()
- flags use defaults:
  - is_open = true
  - is_ended = false
  - is_pending_verification = false
  - is_verified = false
  - is_disputed = false

### Rules
- Attendant must be active (if `attendants.is_active` is enforced)
- Only **one open shift per attendant per station**

```sql
WHERE attendant_id = $1
AND station_id = $2
AND is_open = true
```

### Response
```json
{
  "error": false,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "station_id": "uuid",
    "attendant_id": "uuid",
    "tag_number": "text",
    "started_at": "timestamptz",
    "ended_at": null,
    "is_open": true,
    "is_ended": false,
    "is_pending_verification": false,
    "is_verified": false,
    "is_disputed": false,
    "opened_by_user_id": "uuid",
    "created_at": "timestamptz"
  }
}
```

---

## 2) End Shift (Close attendant_shifts)

### Endpoint
POST /api/attendant-shifts/{shiftId}/end

### Database Write
Update `attendant_shifts`:
- ended_at = now()
- is_open = false
- is_ended = true
- is_pending_verification = true

### Rules
- Shift must exist
- Must be `is_open = true` and `is_ended = false`

### Response
```json
{
  "error": false,
  "data": {
    "id": "uuid",
    "is_open": false,
    "is_ended": true,
    "ended_at": "timestamptz"
  }
}
```

---

## 3) Get Shift (Single)

### Endpoint
GET /api/attendant-shifts/{shiftId}

### Returns
- Shift row
- Optionally embedded:
  - Close declaration (if exists)
  - Verification summary (if exists)

**Used by:** “Shift Details” UI screen.

---

## 4) List Shifts (Station Scoped)

### Endpoint
GET /api/stations/{stationId}/attendant-shifts

### Query Parameters
- open → is_open
- pending → is_pending_verification
- verified → is_verified
- disputed → is_disputed
- from / to → filter by started_at (or created_at)
- attendant_id → attendant_shifts.attendant_id

### Use Cases
- Backoffice “Shifts Overview”

### Core Filter
```sql
WHERE station_id = $stationId
```

Optional filters applied as provided.

---

## 5) List Shifts (By Attendant)

### Endpoint
GET /api/attendants/{attendantId}/attendant-shifts

### Description
- Filters by `attendant_shifts.attendant_id`
- Optional `from` / `to` using `started_at`

---

## 6) Submit or Update Close Declaration

### Endpoint
POST /api/attendant-shifts/{shiftId}/close-declaration

### Request
```json
{
  "declared_cash": 0,
  "declared_card": 0,
  "declared_debtors": 0,
  "declared_other": {},
  "declared_total": 0,
  "currency": "ZMW"
}
```

### Database Write
Upsert into `shift_close_declarations` on `shift_id`:
- declared_cash
- declared_card
- declared_debtors
- declared_other
- declared_total
- currency
- submitted_at = now()

Update shift flags:
- attendant_shifts.is_pending_verification = true

### Rules
- Shift must exist
- Recommended: shift must be ended (`is_ended = true`)
- `declared_total` should equal sum of declared fields
  (validate or compute server-side)

---

## 7) Get Close Declaration

### Endpoint
GET /api/attendant-shifts/{shiftId}/close-declaration

### Response
Returns `shift_close_declarations` row.

---

## 8) Verify Shift (Manager Verification)

### Endpoint
POST /api/attendant-shifts/{shiftId}/verify

### Request (only existing columns)
```json
{
  "verified_total": 0,
  "currency": "ZMW",
  "notes": "optional",
  "verified_by_user_id": "uuid"
}
```

### Server Computations
```sql
computed_total =
COALESCE(SUM(fuel_transactions_raw.amount), 0)
WHERE shift_id = $shiftId
```

- declared_total from `shift_close_declarations`
- variance_amount = computed_total - declared_total

### Database Write
Upsert into `shift_verification_summary`:
- shift_id
- computed_total
- declared_total
- verified_total
- variance_amount
- currency
- notes
- verified_by_user_id
- verified_at = now()
- is_verified = true
- is_disputed = (verified_total != computed_total)

Update `attendant_shifts`:
- is_pending_verification = false
- is_verified = true
- is_disputed = summary.is_disputed

### Rules
- Shift must exist
- Shift must be ended
- Close declaration must exist
- Only managers / supervisors allowed

### Response
Returns verification summary row.

---

## 9) Mark Shift as Disputed (Without Verify)

### Endpoint
POST /api/attendant-shifts/{shiftId}/dispute

### Request
```json
{
  "notes": "optional",
  "verified_by_user_id": "uuid"
}
```

### Rules (Recommended)
- Only allowed if a verification summary already exists
- Dispute is a post-verification outcome

### Database Write
Update `shift_verification_summary`:
- is_disputed = true
- is_verified = false (or keep as-is if policy allows)

---

## 10) Get Verification Summary

### Endpoint
GET /api/attendant-shifts/{shiftId}/verification

### Response
Returns `shift_verification_summary` row.

---

## 11) Shift State Transitions (Flags Only)

### On OPEN
- is_open = true
- is_ended = false
- is_pending_verification = false
- is_verified = false
- is_disputed = false

### On END
- is_open = false
- is_ended = true
- is_pending_verification = true

### On DECLARATION SUBMIT
- shift remains ended
- is_pending_verification = true

### On VERIFY
- is_pending_verification = false
- is_verified = true
- is_disputed = (verified_total != computed_total)

---

**End of Specification**
