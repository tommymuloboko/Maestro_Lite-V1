/**
 * API Adapter pattern – single interface for all backend operations.
 *
 * Two implementations:
 * 1. RealApiService  → calls Node.js backend at localhost:3000/api
 * 2. MockApiService  → returns in-memory mock data with simulated delays
 *
 * Switch via VITE_USE_MOCK_API env var (defaults to 'true' in dev).
 */

import type { User, LoginCredentials, AuthTokens } from '@/types/auth';
import type { Shift, ShiftCloseDeclaration, ShiftVerificationSummary } from '@/types/shifts';
import type { FuelTransaction, RawFuelTransaction, VerifiedFuelTransaction, FuelSalesSummary } from '@/types/fuel';
import type { Pump } from '@/types/pumps';
import type { Tank, TankReading, TankAlert, TankTrendPoint } from '@/types/tanks';
import type { Attendant, AttendantRfidTag } from '@/types/attendants';
import type { PaymentType, PaginatedResponse } from '@/types/common';
import type {
  ShiftSummaryReport,
  DailySalesReport,
  AttendantPerformanceReport,
  PumpTotalsReport,
} from '@/types/reports';
import type {
  StartShiftRequestDto,
  EndShiftRequestDto,
  VerifyShiftRequestDto,
  VerifyShiftResponseDto,
  DashboardSummaryDto,
  ShiftListFiltersDto,
  FuelSalesFiltersDto,
  ReportFiltersDto,
} from './dto';

// ─── API Service Interface ──────────────────────────────────

export interface IApiService {
  // Auth
  login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  getCurrentUser(): Promise<User>;

  // Shifts
  getShifts(filters?: ShiftListFiltersDto): Promise<PaginatedResponse<Shift>>;
  getShift(id: string): Promise<Shift>;
  startShift(data: StartShiftRequestDto): Promise<{ shiftId: string }>;
  endShift(id: string, data: EndShiftRequestDto): Promise<void>;
  verifyShift(id: string, data: VerifyShiftRequestDto): Promise<VerifyShiftResponseDto>;
  getShiftRawTransactions(shiftId: string): Promise<RawFuelTransaction[]>;
  getShiftVerifiedTransactions(shiftId: string): Promise<VerifiedFuelTransaction[]>;
  getShiftDeclaration(shiftId: string): Promise<ShiftCloseDeclaration | null>;
  getShiftVerificationSummary(shiftId: string): Promise<ShiftVerificationSummary | null>;

  // Fuel Sales (display layer – returns unified FuelTransaction)
  getFuelSales(filters?: FuelSalesFiltersDto): Promise<PaginatedResponse<FuelTransaction>>;
  getFuelSale(id: string): Promise<FuelTransaction>;
  getFuelSalesSummary(filters?: FuelSalesFiltersDto): Promise<FuelSalesSummary>;

  // Pumps
  getPumps(): Promise<Pump[]>;
  getPump(id: string): Promise<Pump>;
  getPumpTransactions(pumpId: string): Promise<FuelTransaction[]>;

  // Tanks
  getTanks(): Promise<Tank[]>;
  getTank(id: string): Promise<Tank>;
  getTankReadings(tankId: string): Promise<TankReading[]>;
  getTankTrend(tankId: string): Promise<TankTrendPoint[]>;
  getTankAlerts(): Promise<TankAlert[]>;

  // Reports (ALWAYS use verified data)
  getShiftSummaryReport(filters: ReportFiltersDto): Promise<ShiftSummaryReport[]>;
  getDailySalesReport(filters: ReportFiltersDto): Promise<DailySalesReport[]>;
  getAttendantPerformanceReport(filters: ReportFiltersDto): Promise<AttendantPerformanceReport[]>;
  getPumpTotalsReport(filters: ReportFiltersDto): Promise<PumpTotalsReport[]>;

  // Dashboard
  getDashboardSummary(): Promise<DashboardSummaryDto>;
  getDashboardAlerts(): Promise<TankAlert[]>;
  getRecentUnverifiedShifts(): Promise<Shift[]>;

  // Settings – Attendants
  getAttendants(): Promise<Attendant[]>;
  getAttendant(id: string): Promise<Attendant>;
  createAttendant(data: Partial<Attendant>): Promise<Attendant>;
  updateAttendant(id: string, data: Partial<Attendant>): Promise<Attendant>;
  deleteAttendant(id: string): Promise<void>;
  getAttendantTags(attendantId: string): Promise<AttendantRfidTag[]>;
}

// ─── Factory ─────────────────────────────────────────────────

let _instance: IApiService | null = null;

export async function getApiService(): Promise<IApiService> {
  if (_instance) return _instance;

  const { env } = await import('@/config/env');

  if (env.useMockApi) {
    const { MockApiService } = await import('./mockApiService');
    _instance = new MockApiService();
  } else {
    const { RealApiService } = await import('./realApiService');
    _instance = new RealApiService();
  }

  return _instance;
}

/**
 * Reset the cached instance (useful for testing or switching modes at runtime).
 */
export function resetApiService(): void {
  _instance = null;
}
