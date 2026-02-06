import type { PaymentType } from './common';

export interface FuelType {
  id: string;
  name: string;
  code: string;
  color: string;
  unitPrice: number;
}

/* ─────────────────────────────────────────────────────────────
   RAW transaction – straight from PTS2 controller.
   Has NO payment_type (payment is assigned during verification).
   Maps to DB table: FUEL_TRANSACTIONS_RAW
   ───────────────────────────────────────────────────────────── */
export interface RawFuelTransaction {
  id: string;                        // bigserial → string for frontend
  companyId: string;
  stationId: string;
  shiftId: string;
  attendantId: string;
  tagNumber: string;
  fullName: string;
  pumpId: number;                    // pts2 pump id (integer)
  time: string;                      // ISO timestamptz
  amount: number;                    // ZMW
  currency: string;                  // ISO-4217, default 'ZMW'
  transactionId: number;             // PTS2 transaction_id
  isVerified: boolean;
  createdAt: string;
}

/* ─────────────────────────────────────────────────────────────
   VERIFIED transaction – created by manager during shift verify.
   Maps to DB table: FUEL_TRANSACTIONS_VERIFIED
   ALL REPORTS use this table only.
   ───────────────────────────────────────────────────────────── */
export interface VerifiedFuelTransaction {
  id: string;                        // uuid
  rawId: string;                     // FK → raw transaction
  companyId: string;
  stationId: string;
  shiftId: string;
  attendantId: string;
  paymentType: PaymentType;          // assigned by manager
  verifiedByUserId: string;
  verifiedAt: string;
  amount: number;
  currency: string;
  time: string;
  tagNumber: string;
  fullName: string;
  pumpId: number;
  transactionId: number;
}

/* ─────────────────────────────────────────────────────────────
   Legacy unified type kept for backward-compatible UI components.
   Combines raw fields + optional verification fields.
   ───────────────────────────────────────────────────────────── */
export interface FuelTransaction {
  id: string;
  transactionNumber: string;
  pumpId: string;
  nozzleId: string;
  fuelType: string;
  volume: number;
  unitPrice: number;
  amount: number;
  paymentType?: PaymentType;         // undefined for raw, present for verified
  attendantId?: string;
  shiftId?: string;
  timestamp: string;
  pts2TransactionId?: string;
  tagNumber?: string;
  fullName?: string;
  isVoided: boolean;
  voidReason?: string;
  // Verification state
  isVerified: boolean;
  verifiedByUserId?: string;
  verifiedAt?: string;
  rawId?: string;                    // link back to raw if this is a verified view
}

export interface FuelSalesFilters {
  startDate?: string;
  endDate?: string;
  pumpId?: string;
  fuelType?: string;
  paymentType?: PaymentType;
  attendantId?: string;
  shiftId?: string;
  verifiedOnly?: boolean;            // filters to verified transactions
}

export interface FuelSalesSummary {
  totalVolume: number;
  totalAmount: number;
  transactionCount: number;
  byFuelType: Record<string, { volume: number; amount: number; count: number }>;
  byPaymentType: Record<PaymentType, number>;
}
