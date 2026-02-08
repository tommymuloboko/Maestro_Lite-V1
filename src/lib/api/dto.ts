// Data Transfer Objects for API requests/responses
// These mirror the Node.js backend at localhost:3000/api

import type { PaymentType } from '@/types/common';
import type { RawFuelTransaction, VerifiedFuelTransaction } from '@/types/fuel';
import type {
  ShiftVerificationSummary,
  ShiftStatus,
} from '@/types/shifts';

// ─── Auth ────────────────────────────────────────────────────

export interface LoginRequestDto {
  username: string;
  password: string;
}

/** Backend login response format */
export interface LoginResponseDto {
  success: boolean;
  token: string;
  expiresIn: string; // e.g., "24h"
  user: {
    id: string;
    username: string;
    full_name?: string;
    email?: string;
    roles?: string[];
    company_id?: string;
    station_id?: string;
  };
}

// ─── Shifts ──────────────────────────────────────────────────

export interface StartShiftRequestDto {
  attendantId: string;
  pumpIds: string[];
  tagNumber: string;
  openingReadings: {
    pumpId: string;
    nozzleId: string;
    reading: number;
  }[];
}

export interface StartShiftResponseDto {
  shiftId: string;
  message: string;
}

export interface EndShiftRequestDto {
  closingReadings: {
    pumpId: string;
    nozzleId: string;
    reading: number;
  }[];
  declaration: {
    declaredCash: number;
    declaredCard: number;
    declaredDebtors: number;
    declaredOther?: Record<string, number>;
  };
  notes?: string;
}

export interface VerifyShiftRequestDto {
  /** Map of rawTransactionId → assigned paymentType */
  transactionAllocations: Record<string, PaymentType>;
  /** Manager-counted totals */
  countedCash: number;
  countedCard: number;
  countedDebtors: number;
  notes?: string;
}

export interface VerifyShiftResponseDto {
  verificationSummary: ShiftVerificationSummary;
  verifiedCount: number;
  message: string;
}

export interface ShiftListFiltersDto {
  status?: ShiftStatus;
  attendantId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ─── Fuel Transactions ──────────────────────────────────────

export interface RawTransactionsResponseDto {
  data: RawFuelTransaction[];
  total: number;
}

export interface VerifiedTransactionsResponseDto {
  data: VerifiedFuelTransaction[];
  total: number;
}

export interface FuelSalesFiltersDto {
  startDate?: string;
  endDate?: string;
  pumpId?: number;
  attendantId?: string;
  shiftId?: string;
  verifiedOnly?: boolean;
  page?: number;
  pageSize?: number;
}

// ─── Dashboard ───────────────────────────────────────────────

export interface DashboardSummaryDto {
  todaySales: number;
  todayVolume: number;
  activeShifts: number;
  unverifiedShifts: number;
  tankAlerts: number;
  pumpStatus: {
    online: number;
    offline: number;
    fueling: number;
  };
}

// ─── Pumps ───────────────────────────────────────────────────

export interface PumpStatusDto {
  pumpId: number;
  status: string;
  currentTransaction?: {
    volume: number;
    amount: number;
    fuelType: string;
    startTime: string;
  };
  lastUpdated: string;
}

// ─── Tanks ───────────────────────────────────────────────────

export interface TankReadingDto {
  tankId: string;
  volume: number;
  level: number;
  temperature?: number;
  waterLevel?: number;
  timestamp: string;
}

// ─── Reports (all use verified data only) ────────────────────

export interface ReportFiltersDto {
  startDate?: string;
  endDate?: string;
  attendantId?: string;
  pumpId?: string;
  shiftId?: string;
}

// ─── List response wrapper ──────────────────────────────────

export interface ListResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
