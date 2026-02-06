/**
 * Real API Service — calls the Node.js backend at localhost:3000/api.
 *
 * Uses the shared `api` client (fetch wrapper with auth headers).
 * When backend is running, set VITE_USE_MOCK_API=false to use this.
 */

import type { IApiService } from './apiAdapter';
import type { User, LoginCredentials, AuthTokens } from '@/types/auth';
import type { Shift, ShiftCloseDeclaration, ShiftVerificationSummary } from '@/types/shifts';
import type {
  FuelTransaction,
  RawFuelTransaction,
  VerifiedFuelTransaction,
  FuelSalesSummary,
} from '@/types/fuel';
import type { Pump } from '@/types/pumps';
import type { Tank, TankReading, TankAlert, TankTrendPoint } from '@/types/tanks';
import type { Attendant, AttendantRfidTag } from '@/types/attendants';
import type { PaginatedResponse } from '@/types/common';
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
  LoginResponseDto,
} from './dto';

import { api } from './client';
import { endpoints } from './endpoints';

// ─── Real API Service ────────────────────────────────────────

export class RealApiService implements IApiService {
  // ── Auth ───────────────────────────────────────────────────

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await api.post<LoginResponseDto>(endpoints.auth.login, credentials);
    return { user: res.user, tokens: res.tokens };
  }

  async logout(): Promise<void> {
    await api.post(endpoints.auth.logout);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return api.post<AuthTokens>(endpoints.auth.refresh, { refreshToken });
  }

  async getCurrentUser(): Promise<User> {
    return api.get<User>(endpoints.auth.me);
  }

  // ── Shifts ─────────────────────────────────────────────────

  async getShifts(filters?: ShiftListFiltersDto): Promise<PaginatedResponse<Shift>> {
    return api.get<PaginatedResponse<Shift>>(endpoints.shifts.list, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  }

  async getShift(id: string): Promise<Shift> {
    return api.get<Shift>(endpoints.shifts.get(id));
  }

  async startShift(data: StartShiftRequestDto): Promise<{ shiftId: string }> {
    return api.post<{ shiftId: string }>(endpoints.shifts.start, data);
  }

  async endShift(id: string, data: EndShiftRequestDto): Promise<void> {
    await api.post(endpoints.shifts.end(id), data);
  }

  async verifyShift(id: string, data: VerifyShiftRequestDto): Promise<VerifyShiftResponseDto> {
    return api.post<VerifyShiftResponseDto>(endpoints.shifts.verify(id), data);
  }

  async getShiftRawTransactions(shiftId: string): Promise<RawFuelTransaction[]> {
    return api.get<RawFuelTransaction[]>(endpoints.shifts.rawTransactions(shiftId));
  }

  async getShiftVerifiedTransactions(shiftId: string): Promise<VerifiedFuelTransaction[]> {
    return api.get<VerifiedFuelTransaction[]>(endpoints.shifts.verifiedTransactions(shiftId));
  }

  async getShiftDeclaration(shiftId: string): Promise<ShiftCloseDeclaration | null> {
    return api.get<ShiftCloseDeclaration | null>(endpoints.shifts.declaration(shiftId));
  }

  async getShiftVerificationSummary(shiftId: string): Promise<ShiftVerificationSummary | null> {
    return api.get<ShiftVerificationSummary | null>(endpoints.shifts.verificationSummary(shiftId));
  }

  // ── Fuel Sales ─────────────────────────────────────────────

  async getFuelSales(filters?: FuelSalesFiltersDto): Promise<PaginatedResponse<FuelTransaction>> {
    return api.get<PaginatedResponse<FuelTransaction>>(endpoints.fuelSales.list, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  }

  async getFuelSale(id: string): Promise<FuelTransaction> {
    return api.get<FuelTransaction>(endpoints.fuelSales.get(id));
  }

  async getFuelSalesSummary(filters?: FuelSalesFiltersDto): Promise<FuelSalesSummary> {
    return api.get<FuelSalesSummary>(endpoints.fuelSales.summary, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  }

  // ── Pumps ──────────────────────────────────────────────────

  async getPumps(): Promise<Pump[]> {
    return api.get<Pump[]>(endpoints.pumps.list);
  }

  async getPump(id: string): Promise<Pump> {
    return api.get<Pump>(endpoints.pumps.get(id));
  }

  async getPumpTransactions(pumpId: string): Promise<FuelTransaction[]> {
    return api.get<FuelTransaction[]>(endpoints.pumps.transactions(pumpId));
  }

  // ── Tanks ──────────────────────────────────────────────────

  async getTanks(): Promise<Tank[]> {
    return api.get<Tank[]>(endpoints.tanks.list);
  }

  async getTank(id: string): Promise<Tank> {
    return api.get<Tank>(endpoints.tanks.get(id));
  }

  async getTankReadings(tankId: string): Promise<TankReading[]> {
    return api.get<TankReading[]>(endpoints.tanks.readings(tankId));
  }

  async getTankTrend(tankId: string): Promise<TankTrendPoint[]> {
    // Trend data comes from readings endpoint — backend provides it
    return api.get<TankTrendPoint[]>(endpoints.tanks.readings(tankId), {
      params: { format: 'trend' },
    });
  }

  async getTankAlerts(): Promise<TankAlert[]> {
    return api.get<TankAlert[]>(endpoints.tanks.alerts);
  }

  // ── Reports ────────────────────────────────────────────────

  async getShiftSummaryReport(filters: ReportFiltersDto): Promise<ShiftSummaryReport[]> {
    return api.get<ShiftSummaryReport[]>(endpoints.reports.shiftSummary, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  }

  async getDailySalesReport(filters: ReportFiltersDto): Promise<DailySalesReport[]> {
    return api.get<DailySalesReport[]>(endpoints.reports.dailySales, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  }

  async getAttendantPerformanceReport(filters: ReportFiltersDto): Promise<AttendantPerformanceReport[]> {
    return api.get<AttendantPerformanceReport[]>(endpoints.reports.attendantPerformance, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  }

  async getPumpTotalsReport(filters: ReportFiltersDto): Promise<PumpTotalsReport[]> {
    return api.get<PumpTotalsReport[]>(endpoints.reports.pumpTotals, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  }

  // ── Dashboard ──────────────────────────────────────────────

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    return api.get<DashboardSummaryDto>(endpoints.dashboard.summary);
  }

  async getDashboardAlerts(): Promise<TankAlert[]> {
    return api.get<TankAlert[]>(endpoints.dashboard.alerts);
  }

  async getRecentUnverifiedShifts(): Promise<Shift[]> {
    return api.get<Shift[]>(endpoints.dashboard.recentShifts);
  }

  // ── Settings – Attendants ──────────────────────────────────

  async getAttendants(): Promise<Attendant[]> {
    return api.get<Attendant[]>(endpoints.settings.attendants);
  }

  async getAttendant(id: string): Promise<Attendant> {
    return api.get<Attendant>(endpoints.settings.attendant(id));
  }

  async createAttendant(data: Partial<Attendant>): Promise<Attendant> {
    return api.post<Attendant>(endpoints.settings.attendants, data);
  }

  async updateAttendant(id: string, data: Partial<Attendant>): Promise<Attendant> {
    return api.put<Attendant>(endpoints.settings.attendant(id), data);
  }

  async deleteAttendant(id: string): Promise<void> {
    await api.delete(endpoints.settings.attendant(id));
  }

  async getAttendantTags(attendantId: string): Promise<AttendantRfidTag[]> {
    return api.get<AttendantRfidTag[]>(endpoints.settings.attendantTags, {
      params: { attendantId },
    });
  }
}
