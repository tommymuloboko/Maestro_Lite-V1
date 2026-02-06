import type { Attendant } from './attendants';
import type { FuelTransaction, RawFuelTransaction, VerifiedFuelTransaction } from './fuel';
import type { PaymentType } from './common';

export type ShiftStatus = 'active' | 'ended' | 'verified' | 'closed';

export interface Shift {
  id: string;
  companyId: string;
  stationId: string;
  attendantId: string;
  attendant?: Attendant;
  tagNumber: string;
  pumpIds: string[];
  startTime: string;
  endTime?: string;
  status: ShiftStatus;

  // Shift state flags (mirror DB ATTENDANT_SHIFTS)
  isOpen: boolean;
  isEnded: boolean;
  isPendingVerification: boolean;
  isVerified: boolean;
  isDisputed: boolean;

  openingReadings: PumpReading[];
  closingReadings?: PumpReading[];

  // Raw PTS2 transactions for this shift
  transactions: FuelTransaction[];
  rawTransactions?: RawFuelTransaction[];
  verifiedTransactions?: VerifiedFuelTransaction[];

  // Attendant end-shift declaration
  declaration?: ShiftCloseDeclaration;

  // Manager verification result
  verificationSummary?: ShiftVerificationSummary;

  // Legacy fields (kept for backward-compat UI)
  payments: ShiftPayment[];
  variance?: ShiftVariance;
  verifiedBy?: string;
  verifiedAt?: string;
  openedByUserId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PumpReading {
  pumpId: string;
  nozzleId: string;
  fuelType: string;
  volume: number;
  amount: number;
  timestamp: string;
}

export interface ShiftPayment {
  id: string;
  paymentType: PaymentType;
  declaredAmount: number;
  countedAmount: number;
  variance: number;
}

export interface ShiftVariance {
  totalDeclared: number;
  totalCounted: number;
  totalExpected: number;
  variance: number;
  variancePercent: number;
}

/* ─────────────────────────────────────────────────────────────
   DB: SHIFT_CLOSE_DECLARATIONS
   Attendant declares how much money for each payment type.
   ───────────────────────────────────────────────────────────── */
export interface ShiftCloseDeclaration {
  id: string;
  shiftId: string;
  declaredCash: number;
  declaredCard: number;
  declaredDebtors: number;
  declaredOther: Record<string, number>;   // jsonb
  declaredTotal: number;
  currency: string;                        // default 'ZMW'
  submittedAt: string;
}

/* ─────────────────────────────────────────────────────────────
   DB: SHIFT_VERIFICATION_SUMMARY
   Manager's final decision after counting & verifying.
   ───────────────────────────────────────────────────────────── */
export interface ShiftVerificationSummary {
  id: string;
  shiftId: string;
  computedTotal: number;   // sum of raw transaction amounts
  declaredTotal: number;   // from attendant declaration
  verifiedTotal: number;   // sum of verified transaction amounts
  varianceAmount: number;  // computed − verified
  currency: string;
  isVerified: boolean;
  isDisputed: boolean;
  notes?: string;
  verifiedByUserId: string;
  verifiedAt: string;
}

export interface ShiftSummary {
  totalVolume: number;
  totalAmount: number;
  transactionCount: number;
  byFuelType: Record<string, { volume: number; amount: number }>;
  byPaymentType: Record<string, number>;
}
