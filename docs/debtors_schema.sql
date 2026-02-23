-- =============================================================
-- Maestro-Lite — Debtors Module — Supabase SQL Schema
-- Copy and paste this entire script into the Supabase SQL Editor.
-- =============================================================

-- ─── 1. Debtors (main account) ────────────────────────────────

CREATE TABLE IF NOT EXISTS debtors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id      UUID REFERENCES stations(id) ON DELETE CASCADE,

  -- General tab
  account_number  TEXT NOT NULL,
  company_name    TEXT NOT NULL,
  title_initials  TEXT,
  account_type    TEXT NOT NULL DEFAULT 'balance_brought_forward',
  vat_reg_no      TEXT,
  company_reg_no  TEXT,

  -- Contact 1
  contact1_name       TEXT,
  contact1_telephone  TEXT,
  contact1_fax        TEXT,
  contact1_cell       TEXT,
  contact1_email      TEXT,

  -- Contact 2
  contact2_name       TEXT,
  contact2_telephone  TEXT,
  contact2_fax        TEXT,
  contact2_cell       TEXT,
  contact2_email      TEXT,

  -- Addresses
  postal_address   TEXT,
  physical_address TEXT,

  -- Settings tab
  is_main_account     BOOLEAN NOT NULL DEFAULT TRUE,
  main_account_no     TEXT,
  main_account_name   TEXT,
  debtor_category     TEXT,
  credit_limit        NUMERIC(12,2) NOT NULL DEFAULT 1000.00,
  terms_of_payment    TEXT NOT NULL DEFAULT 'Cash',
  charge_interest     BOOLEAN NOT NULL DEFAULT FALSE,
  enter_order_number  BOOLEAN NOT NULL DEFAULT FALSE,
  enter_odometer      BOOLEAN NOT NULL DEFAULT FALSE,
  enter_region_code   BOOLEAN NOT NULL DEFAULT FALSE,
  print_balance       TEXT NOT NULL DEFAULT 'system_default',
  statement_type      TEXT NOT NULL DEFAULT 'monthly',
  send_via_print      BOOLEAN NOT NULL DEFAULT TRUE,
  send_via_email      BOOLEAN NOT NULL DEFAULT FALSE,
  account_status      TEXT NOT NULL DEFAULT 'enabled',

  -- Discount tab
  settlement_discount_pct  NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  settlement_terms         TEXT NOT NULL DEFAULT 'Cash',
  trade_discount_category  TEXT,
  trade_discount_pct       NUMERIC(5,2) NOT NULL DEFAULT 0.00,

  -- Balances (denormalized for fast reads)
  opening_balance    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  current_balance    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  deposit            NUMERIC(12,2) NOT NULL DEFAULT 0.00,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique account number per station
CREATE UNIQUE INDEX IF NOT EXISTS idx_debtors_station_account
  ON debtors (station_id, account_number);

-- ─── 2. Debtor Vehicles ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS debtor_vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debtor_id       UUID NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,

  registration    TEXT NOT NULL,
  driver          TEXT,
  tag_no          TEXT,
  grades_allowed  TEXT NOT NULL DEFAULT 'ALL GRADES',
  card_no         TEXT,
  restrict_fueling_times  BOOLEAN NOT NULL DEFAULT FALSE,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debtor_vehicles_debtor
  ON debtor_vehicles (debtor_id);

-- ─── 3. Vehicle Fueling Schedule ──────────────────────────────

CREATE TABLE IF NOT EXISTS debtor_vehicle_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id  UUID NOT NULL REFERENCES debtor_vehicles(id) ON DELETE CASCADE,

  day_of_week   INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Mon .. 6=Sun
  is_allowed    BOOLEAN NOT NULL DEFAULT TRUE,
  time_from     TIME NOT NULL DEFAULT '00:00',
  time_to       TIME NOT NULL DEFAULT '23:59',

  UNIQUE (vehicle_id, day_of_week)
);

-- ─── 4. Debtor Transactions (ledger) ──────────────────────────

CREATE TABLE IF NOT EXISTS debtor_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debtor_id   UUID NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,

  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  type          TEXT NOT NULL,          -- 'invoice', 'credit_note', 'payment', 'debit_note'
  doc_no        TEXT,
  reference     TEXT,
  description   TEXT,
  debit         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  credit        NUMERIC(12,2) NOT NULL DEFAULT 0.00,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debtor_txn_debtor
  ON debtor_transactions (debtor_id, date DESC);

-- ─── 5. Debtor Aging (materialized / cached view) ─────────────

CREATE TABLE IF NOT EXISTS debtor_aging (
  debtor_id      UUID PRIMARY KEY REFERENCES debtors(id) ON DELETE CASCADE,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  days_30        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  days_60        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  days_90        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  days_120_plus  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. Enable Row-Level Security (RLS) ──────────────────────

ALTER TABLE debtors                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE debtor_vehicles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE debtor_vehicle_schedules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE debtor_transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE debtor_aging              ENABLE ROW LEVEL SECURITY;

-- ─── 7. Updated-at trigger ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_debtors_updated_at
  BEFORE UPDATE ON debtors
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_debtor_vehicles_updated_at
  BEFORE UPDATE ON debtor_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
