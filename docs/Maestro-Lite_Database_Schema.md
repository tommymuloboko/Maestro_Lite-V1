
# Maestro-Lite Database Schema Documentation

## Overview
Maestro-Lite is a **fuel-only backoffice system** built around PTS2 fuel controllers and RFID-based attendant authorization.
The database is designed to be **auditable, deterministic, and safe**, separating raw fuel data from manager-verified records.

---

## Naming Conventions
- **Table names:** UPPERCASE
- **Column names:** lowercase
- **Primary keys:** `id`
- **Foreign keys:** `*_id`
- **Currency:** ISO-4217, default `ZMW`

---

## Core Hierarchy
COMPANIES → STATIONS → (USERS, EMPLOYEES) → ATTENDANTS → SHIFTS → TRANSACTIONS

---

## Table Definitions

### COMPANIES
Represents the owning organization (HQ).

**Columns**
- id (uuid, PK)
- name (text)
- code (text, unique)
- created_at (timestamptz)

---

### STATIONS
Physical fuel stations under a company.

**Columns**
- id (uuid, PK)
- company_id (uuid, FK → companies)
- name (text)
- code (text)
- timezone (text)
- location (text)
- station_url (text)
- is_active (boolean)
- created_at (timestamptz)

---

### USERS
System login accounts (HQ admins and station managers).

**Columns**
- id (uuid, PK)
- company_id (uuid, FK)
- station_id (uuid, FK, nullable for HQ)
- username (text, unique)
- password_hash (text)
- full_name (text)
- email (text)
- is_active (boolean)
- created_at (timestamptz)

---

### EMPLOYEES
Staff registry for stations.

**Columns**
- id (uuid, PK)
- company_id (uuid, FK)
- station_id (uuid, FK)
- user_id (uuid, FK, nullable, unique)
- employee_no (text)
- full_name (text)
- job_title (text)
- is_active (boolean)
- created_at (timestamptz)

---

### ATTENDANTS
Fuel attendants only (operational staff).

**Columns**
- id (uuid, PK)
- company_id (uuid, FK)
- station_id (uuid, FK)
- employee_id (uuid, FK, unique)
- attendant_no (text)
- phone (text)
- is_active (boolean)
- created_at (timestamptz)

---

### ATTENDANT_TAGS
RFID tags assigned to attendants.

**Columns**
- id (uuid, PK)
- attendant_id (uuid, FK)
- station_id (uuid, FK)
- tag_number (text, unique)
- is_active (boolean)
- issued_at (timestamptz)
- revoked_at (timestamptz)

---

### PUMPS
PTS2 pumps (no nozzle abstraction).

**Columns**
- id (uuid, PK)
- station_id (uuid, FK)
- pts2_pump_id (integer)
- name (text)
- is_active (boolean)

---

### TANKS
Fuel storage tanks.

**Columns**
- id (uuid, PK)
- station_id (uuid, FK)
- pts2_tank_id (integer)
- name (text)
- fuel_grade (text)
- capacity_liters (numeric)
- is_active (boolean)

---

### TANK_READINGS
Time-series tank measurements.

**Columns**
- id (uuid, PK)
- tank_id (uuid, FK)
- reading_time (timestamptz)
- level_liters (numeric)
- temperature (numeric)
- water_level (numeric)

---

### ATTENDANT_SHIFTS
Work sessions for attendants.

**Columns**
- id (uuid, PK)
- company_id (uuid, FK)
- station_id (uuid, FK)
- attendant_id (uuid, FK)
- tag_number (text)
- started_at (timestamptz)
- ended_at (timestamptz)
- is_open (boolean)
- is_ended (boolean)
- is_pending_verification (boolean)
- is_verified (boolean)
- is_disputed (boolean)
- opened_by_user_id (uuid, FK)
- created_at (timestamptz)

---

### SHIFT_CLOSE_DECLARATIONS
Declared totals entered by attendants at shift end.

**Columns**
- id (uuid, PK)
- shift_id (uuid, FK, unique)
- declared_cash (numeric)
- declared_card (numeric)
- declared_debtors (numeric)
- declared_other (jsonb)
- declared_total (numeric)
- currency (char(3), default ZMW)
- submitted_at (timestamptz)

---

### FUEL_TRANSACTIONS_RAW
Raw PTS2 fuel transactions (unverified).

**Columns**
- id (bigserial, PK)
- company_id (uuid, FK)
- station_id (uuid, FK)
- shift_id (uuid, FK)
- attendant_id (uuid, FK)
- tag_number (text)
- full_name (text)
- pump_id (integer)
- time (timestamptz)
- amount (numeric)
- currency (char(3), default ZMW)
- transaction_id (integer)
- is_verified (boolean)
- created_at (timestamptz)

---

### FUEL_TRANSACTIONS_VERIFIED
Manager-verified fuel transactions (reporting truth).

**Columns**
- id (uuid, PK)
- raw_id (bigint, FK, unique)
- company_id (uuid, FK)
- station_id (uuid, FK)
- shift_id (uuid, FK)
- attendant_id (uuid, FK)
- payment_type (text)
- verified_by_user_id (uuid, FK)
- verified_at (timestamptz)
- amount (numeric)
- currency (char(3), default ZMW)
- time (timestamptz)
- tag_number (text)
- full_name (text)
- pump_id (integer)
- transaction_id (integer)

---

### SHIFT_VERIFICATION_SUMMARY
Final manager decision for a shift.

**Columns**
- id (uuid, PK)
- shift_id (uuid, FK, unique)
- computed_total (numeric)
- declared_total (numeric)
- verified_total (numeric)
- variance_amount (numeric)
- currency (char(3), default ZMW)
- is_verified (boolean)
- is_disputed (boolean)
- notes (text)
- verified_by_user_id (uuid, FK)
- verified_at (timestamptz)

---

### AUDIT_LOG
Immutable audit trail.

**Columns**
- id (uuid, PK)
- company_id (uuid, FK)
- station_id (uuid, FK)
- actor_user_id (uuid, FK)
- action (text)
- entity_table (text)
- entity_pk (text)
- before (jsonb)
- after (jsonb)
- created_at (timestamptz)

---

## Reporting Rule
**All reports MUST use `fuel_transactions_verified`.**
