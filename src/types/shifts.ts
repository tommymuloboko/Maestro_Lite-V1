import type { Attendant } from './attendants';
import type { FuelTransaction } from './fuel';
import type { PaymentType } from './common';

export type ShiftStatus = 'active' | 'ended' | 'verified' | 'closed';

export interface Shift {
  id: string;
  attendantId: string;
  attendant?: Attendant;
  pumpIds: string[];
  startTime: string;
  endTime?: string;
  status: ShiftStatus;
  openingReadings: PumpReading[];
  closingReadings?: PumpReading[];
  transactions: FuelTransaction[];
  payments: ShiftPayment[];
  variance?: ShiftVariance;
  verifiedBy?: string;
  verifiedAt?: string;
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

export interface ShiftSummary {
  totalVolume: number;
  totalAmount: number;
  transactionCount: number;
  byFuelType: Record<string, { volume: number; amount: number }>;
  byPaymentType: Record<string, number>;
}
