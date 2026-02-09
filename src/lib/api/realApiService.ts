/**
 * Real API Service — calls the cloud backend API.
 *
 * Uses the shared `api` client (fetch wrapper with auth headers).
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
  TransactionsResponseDto,
  TransactionsSummaryDto,
  VerifiedSummaryDto,
  AttendantsResponseDto,
  AttendantResponseDto,
  CreateAttendantRequestDto,
} from './dto';

import { api } from './client';
import { endpoints } from './endpoints';
import { getStoredStationId, getStoredUser } from '@/lib/storage/secureStore';

// ─── Helper to parse expiresIn string ─────────────────────────

function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn?.match(/^(\d+)([hmd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // Default 24h

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

// ─── Real API Service ────────────────────────────────────────


export class RealApiService implements IApiService {
  // ── Auth ───────────────────────────────────────────────────

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await api.post<LoginResponseDto>(endpoints.auth.login, credentials, {
      skipAuthRedirect: true, // Don't redirect on 401 for login failures
    });

    if (!res.success || !res.token || !res.user) {
      throw new Error('Invalid response from server');
    }

    // Map backend user to frontend User type
    const user: User = {
      id: res.user.id,
      username: res.user.username,
      name: res.user.full_name || res.user.username,
      email: res.user.email,
      role: res.user.roles?.[0] || 'user',
      companyId: res.user.company_id,
      stationId: res.user.station_id,
    };

    // Build tokens with calculated expiry
    const tokens: AuthTokens = {
      accessToken: res.token,
      refreshToken: res.token, // Backend uses single token
      expiresAt: Date.now() + parseExpiresIn(res.expiresIn),
    };

    return { user, tokens };
  }

  async logout(): Promise<void> {
    try {
      await api.post(endpoints.auth.logout);
    } catch {
      // Ignore logout errors - we're clearing local state anyway
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return api.post<AuthTokens>(endpoints.auth.refresh, { refreshToken });
  }

  async getCurrentUser(): Promise<User> {
    return api.get<User>(endpoints.auth.me);
  }

  // ── Shifts ─────────────────────────────────────────────────

  async getShifts(filters?: ShiftListFiltersDto): Promise<PaginatedResponse<Shift>> {
    // Get current user's stationId from stored user
    const user = getStoredUser();
    const stationId = user?.stationId || getStoredStationId();
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 50;

    if (!stationId) {
      console.warn('[API] No stationId available, returning empty shifts');
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // Backend response format
    interface ShiftResponseDto {
      error: boolean;
      count: number;
      data: Array<{
        id: string;
        company_id: string;
        station_id: string;
        attendant_id: string;
        tag_number: string | null;
        started_at: string;
        ended_at: string | null;
        is_open: boolean;
        is_ended: boolean;
        is_pending_verification: boolean;
        is_verified: boolean;
        is_disputed: boolean;
        opened_by_user_id: string;
        created_at: string;
        attendant_no?: string;
        attendant_name?: string;
      }>;
    }

    const res = await api.get<ShiftResponseDto>(endpoints.shifts.listByStation(stationId), {
      params: {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        ...(filters?.attendantId && { attendant_id: filters.attendantId }),
        ...(filters?.startDate && { from: filters.startDate }),
        ...(filters?.endDate && { to: filters.endDate }),
      },
    });

    // Map snake_case to camelCase
    const shifts: Shift[] = (res.data || []).map((s) => ({
      id: s.id,
      companyId: s.company_id,
      stationId: s.station_id,
      attendantId: s.attendant_id,
      tagNumber: s.tag_number || '',
      pumpIds: [],
      startTime: s.started_at,
      endTime: s.ended_at || undefined,
      status: s.is_verified ? 'verified' : s.is_ended ? 'ended' : 'active',
      isOpen: s.is_open,
      isEnded: s.is_ended,
      isPendingVerification: s.is_pending_verification,
      isVerified: s.is_verified,
      isDisputed: s.is_disputed,
      openedByUserId: s.opened_by_user_id,
      createdAt: s.created_at,
      updatedAt: s.created_at,
      openingReadings: [],
      transactions: [],
      payments: [],
      // Enriched fields from join
      attendant: s.attendant_name ? {
        id: s.attendant_id,
        companyId: s.company_id,
        stationId: s.station_id,
        employeeId: '',
        attendantNo: s.attendant_no || '',
        name: s.attendant_name,
        employeeCode: s.attendant_no || '',
        isActive: true,
        createdAt: s.created_at,
        updatedAt: s.created_at,
      } : undefined,
    }));

    return {
      data: shifts,
      total: res.count || shifts.length,
      page,
      pageSize,
      totalPages: Math.ceil((res.count || 0) / pageSize),
    };
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
    const res = await api.get<{ data: RawFuelTransaction[] }>(endpoints.shifts.rawTransactions(shiftId));
    return res.data;
  }

  async getShiftVerifiedTransactions(shiftId: string): Promise<VerifiedFuelTransaction[]> {
    const res = await api.get<{ data: VerifiedFuelTransaction[] }>(endpoints.shifts.verifiedTransactions(shiftId));
    return res.data;
  }

  async getShiftDeclaration(shiftId: string): Promise<ShiftCloseDeclaration | null> {
    try {
      return await api.get<ShiftCloseDeclaration>(endpoints.shifts.declaration(shiftId));
    } catch {
      return null;
    }
  }

  async getShiftVerificationSummary(shiftId: string): Promise<ShiftVerificationSummary | null> {
    try {
      return await api.get<ShiftVerificationSummary>(endpoints.shifts.verificationSummary(shiftId));
    } catch {
      return null;
    }
  }

  // ── Fuel Sales ─────────────────────────────────────────────

  async getFuelSales(filters?: FuelSalesFiltersDto): Promise<PaginatedResponse<FuelTransaction>> {
    return api.get<PaginatedResponse<FuelTransaction>>(endpoints.fuelSales.list, {
      params: filters,
    });
  }

  async getFuelSale(id: string): Promise<FuelTransaction> {
    return api.get<FuelTransaction>(endpoints.fuelSales.get(id));
  }

  async getFuelSalesSummary(filters?: FuelSalesFiltersDto): Promise<FuelSalesSummary> {
    return api.get<FuelSalesSummary>(endpoints.fuelSales.summary, {
      params: filters,
    });
  }

  // ── Pumps ──────────────────────────────────────────────────

  async getPumps(): Promise<Pump[]> {
    const res = await api.get<Pump[] | { data: Pump[] }>(endpoints.pumps.list);
    // Handle both direct array and wrapped response
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  async getPump(id: string): Promise<Pump> {
    return api.get<Pump>(endpoints.pumps.get(id));
  }

  async getPumpTransactions(pumpId: string): Promise<FuelTransaction[]> {
    return api.get<FuelTransaction[]>(endpoints.pumps.transactions(pumpId));
  }

  // ── Tanks ──────────────────────────────────────────────────

  async getTanks(): Promise<Tank[]> {
    const res = await api.get<Tank[] | { data: Tank[] }>(endpoints.tanks.list);
    // Handle both direct array and wrapped response
    return Array.isArray(res) ? res : (res?.data ?? []);
  }

  async getTank(id: string): Promise<Tank> {
    return api.get<Tank>(endpoints.tanks.get(id));
  }

  async getTankReadings(tankId: string): Promise<TankReading[]> {
    return api.get<TankReading[]>(endpoints.tanks.readings(tankId));
  }

  async getTankTrend(tankId: string): Promise<TankTrendPoint[]> {
    return api.get<TankTrendPoint[]>(endpoints.tanks.readings(tankId));
  }

  async getTankAlerts(): Promise<TankAlert[]> {
    const payload = await api.get<TankAlert[] | { data?: TankAlert[] }>(endpoints.tanks.alerts);

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
      return payload.data;
    }

    return [];
  }

  // ── Reports ────────────────────────────────────────────────

  async getShiftSummaryReport(filters: ReportFiltersDto): Promise<ShiftSummaryReport[]> {
    return api.get<ShiftSummaryReport[]>(endpoints.reports.shiftSummary, {
      params: filters,
    });
  }

  async getDailySalesReport(filters: ReportFiltersDto): Promise<DailySalesReport[]> {
    return api.get<DailySalesReport[]>(endpoints.reports.dailySales, {
      params: filters,
    });
  }

  async getAttendantPerformanceReport(filters: ReportFiltersDto): Promise<AttendantPerformanceReport[]> {
    return api.get<AttendantPerformanceReport[]>(endpoints.reports.attendantPerformance, {
      params: filters,
    });
  }

  async getPumpTotalsReport(filters: ReportFiltersDto): Promise<PumpTotalsReport[]> {
    return api.get<PumpTotalsReport[]>(endpoints.reports.pumpTotals, {
      params: filters,
    });
  }

  // ── Dashboard ──────────────────────────────────────────────

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    return api.get<DashboardSummaryDto>(endpoints.dashboard.summary);
  }

  async getDashboardAlerts(): Promise<TankAlert[]> {
    const normalizeAlerts = (payload: unknown): TankAlert[] => {
      if (Array.isArray(payload)) {
        return payload as TankAlert[];
      }

      if (payload && typeof payload === 'object') {
        const data = (payload as { data?: unknown }).data;
        if (Array.isArray(data)) {
          return data as TankAlert[];
        }
      }

      return [];
    };

    try {
      const dashboardAlerts = await api.get<TankAlert[] | { data?: TankAlert[] }>(endpoints.dashboard.alerts);
      const normalizedDashboardAlerts = normalizeAlerts(dashboardAlerts);
      if (normalizedDashboardAlerts.length > 0) {
        return normalizedDashboardAlerts;
      }
    } catch {
      // Ignore dashboard alerts fetch failures and use tank alerts fallback.
    }

    try {
      const tankAlerts = await api.get<TankAlert[] | { data?: TankAlert[] }>(endpoints.tanks.alerts);
      return normalizeAlerts(tankAlerts);
    } catch {
      return [];
    }
  }

  async getRecentUnverifiedShifts(): Promise<Shift[]> {
    return api.get<Shift[]>(endpoints.dashboard.recentShifts);
  }

  // ── Transactions (new /api/transactions endpoint) ──────────

  async getTransactions(params?: {
    station_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; transactions: RawFuelTransaction[] }> {
    const user = getStoredUser();
    const stationId = params?.station_id || user?.stationId || getStoredStationId();

    const res = await api.get<TransactionsResponseDto>(endpoints.transactions.list, {
      params: {
        station_id: stationId,
        limit: params?.limit ?? 100,
        offset: params?.offset ?? 0,
      },
    });

    // Map snake_case to camelCase
    const transactions: RawFuelTransaction[] = (res.transactions || []).map((t) => ({
      id: t.id,
      companyId: t.company_id,
      stationId: t.station_id,
      shiftId: t.shift_id || '',
      attendantId: t.attendant_id || '',
      tagNumber: t.tag_number,
      fullName: t.full_name || '',
      pumpId: t.pump_id,
      time: t.time,
      amount: parseFloat(t.amount),
      currency: t.currency,
      transactionId: t.transaction_id,
      isVerified: t.is_verified,
      createdAt: t.created_at,
    }));

    return { count: res.count, transactions };
  }

  async getTransactionsSummary(stationId?: string): Promise<{
    verifiedTotal: number;
    unverifiedTotal: number;
    totalCount: number;
    verifiedCount: number;
    unverifiedCount: number;
    currency: string;
  }> {
    const user = getStoredUser();
    const resolvedStationId = stationId || user?.stationId || getStoredStationId();

    if (!resolvedStationId) {
      throw new Error('Station ID is required');
    }

    const res = await api.get<TransactionsSummaryDto>(endpoints.transactions.summary(resolvedStationId));

    const summary = res.summary?.[0] || {
      verified_total: '0',
      unverified_total: '0',
      total_count: '0',
      verified_count: '0',
      unverified_count: '0',
      currency: 'ZMW',
    };

    return {
      verifiedTotal: parseFloat(summary.verified_total),
      unverifiedTotal: parseFloat(summary.unverified_total),
      totalCount: parseInt(summary.total_count, 10),
      verifiedCount: parseInt(summary.verified_count, 10),
      unverifiedCount: parseInt(summary.unverified_count, 10),
      currency: summary.currency,
    };
  }

  async getVerifiedTransactionsSummary(stationId?: string): Promise<{
    byPaymentType: Array<{
      paymentType: string;
      count: number;
      totalAmount: number;
      currency: string;
    }>;
    totalAmount: number;
    totalCount: number;
  }> {
    const user = getStoredUser();
    const resolvedStationId = stationId || user?.stationId || getStoredStationId();

    const res = await api.get<VerifiedSummaryDto>(endpoints.transactions.verifiedSummary, {
      params: { station_id: resolvedStationId },
    });

    return {
      byPaymentType: (res.summary?.by_payment_type || []).map((p) => ({
        paymentType: p.payment_type,
        count: parseInt(p.count, 10),
        totalAmount: parseFloat(p.total_amount),
        currency: p.currency,
      })),
      totalAmount: res.summary?.total_amount || 0,
      totalCount: res.summary?.total_count || 0,
    };
  }

  // ── Attendants (new /api/attendants endpoint) ──────────────

  async getAttendants(): Promise<Attendant[]> {
    const res = await api.get<AttendantsResponseDto>(endpoints.attendants.list, {
      params: { limit: 100, offset: 0 },
    });

    // Map snake_case to camelCase
    return (res.attendants || []).map((a) => ({
      id: a.id,
      companyId: a.company_id,
      stationId: a.station_id,
      employeeId: a.employee_id,
      attendantNo: a.attendant_no,
      name: a.attendant_no, // Use attendant_no as name if full_name not available
      employeeCode: a.attendant_no,
      phone: a.phone,
      isActive: a.is_active,
      createdAt: a.created_at,
      updatedAt: a.created_at,
    }));
  }

  async getAttendant(id: string): Promise<Attendant> {
    return api.get<Attendant>(endpoints.attendants.get(id));
  }

  async createAttendant(data: CreateAttendantRequestDto): Promise<Attendant> {
    const res = await api.post<AttendantResponseDto>(endpoints.attendants.create, data);

    const a = res.attendant;
    return {
      id: a.id,
      companyId: a.company_id,
      stationId: a.station_id,
      employeeId: a.employee_id,
      attendantNo: a.attendant_no,
      name: a.attendant_no,
      employeeCode: a.attendant_no,
      phone: a.phone,
      isActive: a.is_active,
      createdAt: a.created_at,
      updatedAt: a.created_at,
    };
  }

  async updateAttendant(id: string, data: Partial<Attendant>): Promise<Attendant> {
    return api.put<Attendant>(endpoints.attendants.update(id), data);
  }

  async deleteAttendant(id: string): Promise<void> {
    await api.delete(endpoints.attendants.delete(id));
  }

  async getAttendantTags(attendantId: string): Promise<AttendantRfidTag[]> {
    return api.get<AttendantRfidTag[]>(endpoints.attendants.tags(attendantId));
  }
}

