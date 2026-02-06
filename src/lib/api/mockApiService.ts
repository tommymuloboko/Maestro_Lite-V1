/**
 * Mock API Service — in-memory implementation of IApiService.
 *
 * Uses the mock data from src/mocks/ and simulates realistic delays.
 * Mutations (start shift, end shift, verify) modify in-memory state,
 * so the app behaves like it's connected to a real backend.
 *
 * Switch to real backend by setting VITE_USE_MOCK_API=false.
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

// Import mocks
import {
  mockShifts,
  getMockShiftById,
  mockDeclarations,
  getMockDeclarationByShiftId,
  mockVerificationSummaries,
  getMockVerificationSummaryByShiftId,
} from '@/mocks/shifts.mock';
import {
  mockFuelTransactions,
  mockRawTransactions,
  mockVerifiedTransactions,
  getMockRawByShift,
  getMockVerifiedByShift,
} from '@/mocks/fuelTransactions.mock';
import { mockPumps } from '@/mocks/pumps.mock';
import { mockTanks, getMockTankById, getMockTankTrend } from '@/mocks/tanks.mock';
import { mockAttendants, mockRfidTags } from '@/mocks/attendants.mock';
import {
  mockShiftSummaryReports,
  mockDailySalesReports,
  mockAttendantPerformanceReports,
  mockPumpTotalsReports,
} from '@/mocks/reports.mock';

import { DEMO_CREDENTIALS, DEMO_USER } from '@/features/auth/api/auth.api';

// ─── Helpers ─────────────────────────────────────────────────

/** Simulate network latency (200–600ms) */
function delay(ms?: number): Promise<void> {
  const wait = ms ?? 200 + Math.random() * 400;
  return new Promise((resolve) => setTimeout(resolve, wait));
}

function paginate<T>(items: T[], page = 1, pageSize = 20): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

function uuid(): string {
  return crypto.randomUUID?.() ?? `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── MockApiService ──────────────────────────────────────────

export class MockApiService implements IApiService {
  // Mutable copies for state changes during session
  private shifts = [...mockShifts];
  private rawTx = [...mockRawTransactions];
  private verifiedTx = [...mockVerifiedTransactions];
  private declarations = [...mockDeclarations];
  private verificationSummaries = [...mockVerificationSummaries];
  private attendants = [...mockAttendants];

  // ── Auth ───────────────────────────────────────────────────

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(300);
    if (
      credentials.username === DEMO_CREDENTIALS.username &&
      credentials.password === DEMO_CREDENTIALS.password
    ) {
      return {
        user: DEMO_USER,
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 1000 * 60 * 60 * 24,
        },
      };
    }
    throw new Error('Invalid credentials');
  }

  async logout(): Promise<void> {
    await delay(100);
  }

  async refreshToken(_refreshToken: string): Promise<AuthTokens> {
    await delay(200);
    return {
      accessToken: 'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token-refreshed',
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };
  }

  async getCurrentUser(): Promise<User> {
    await delay(100);
    return DEMO_USER;
  }

  // ── Shifts ─────────────────────────────────────────────────

  async getShifts(filters?: ShiftListFiltersDto): Promise<PaginatedResponse<Shift>> {
    await delay();
    let result = [...this.shifts];

    if (filters?.status) {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters?.attendantId) {
      result = result.filter((s) => s.attendantId === filters.attendantId);
    }
    if (filters?.startDate) {
      result = result.filter((s) => s.startTime >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter((s) => s.startTime <= filters.endDate!);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return paginate(result, filters?.page ?? 1, filters?.pageSize ?? 20);
  }

  async getShift(id: string): Promise<Shift> {
    await delay();
    const shift = this.shifts.find((s) => s.id === id);
    if (!shift) throw new Error(`Shift ${id} not found`);
    return shift;
  }

  async startShift(data: StartShiftRequestDto): Promise<{ shiftId: string }> {
    await delay(400);
    const attendant = this.attendants.find((a) => a.id === data.attendantId);
    const newId = `SH-${String(this.shifts.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const shift: Shift = {
      id: newId,
      companyId: 'company-001',
      stationId: 'station-001',
      attendantId: data.attendantId,
      attendant: attendant,
      tagNumber: data.tagNumber,
      pumpIds: data.pumpIds,
      startTime: now,
      status: 'active',
      isOpen: true,
      isEnded: false,
      isPendingVerification: false,
      isVerified: false,
      isDisputed: false,
      openingReadings: data.openingReadings.map((r) => ({
        pumpId: r.pumpId,
        nozzleId: r.nozzleId,
        fuelType: 'Petrol',
        volume: r.reading,
        amount: r.reading * 25.5,
        timestamp: now,
      })),
      transactions: [],
      rawTransactions: [],
      payments: [],
      openedByUserId: 'demo-user-1',
      createdAt: now,
      updatedAt: now,
    };

    this.shifts.unshift(shift);
    return { shiftId: newId };
  }

  async endShift(id: string, data: EndShiftRequestDto): Promise<void> {
    await delay(400);
    const shift = this.shifts.find((s) => s.id === id);
    if (!shift) throw new Error(`Shift ${id} not found`);

    const now = new Date().toISOString();
    shift.endTime = now;
    shift.status = 'ended';
    shift.isOpen = false;
    shift.isEnded = true;
    shift.isPendingVerification = true;
    shift.updatedAt = now;

    shift.closingReadings = data.closingReadings.map((r) => ({
      pumpId: r.pumpId,
      nozzleId: r.nozzleId,
      fuelType: 'Petrol',
      volume: r.reading,
      amount: r.reading * 25.5,
      timestamp: now,
    }));

    // Store declaration
    const declaration: ShiftCloseDeclaration = {
      id: uuid(),
      shiftId: id,
      declaredCash: data.declaration.declaredCash,
      declaredCard: data.declaration.declaredCard,
      declaredDebtors: data.declaration.declaredDebtors,
      declaredOther: data.declaration.declaredOther ?? {},
      declaredTotal:
        data.declaration.declaredCash +
        data.declaration.declaredCard +
        data.declaration.declaredDebtors +
        Object.values(data.declaration.declaredOther ?? {}).reduce((s, v) => s + v, 0),
      currency: 'ZMW',
      submittedAt: now,
    };
    this.declarations.push(declaration);
    shift.declaration = declaration;
  }

  async verifyShift(id: string, data: VerifyShiftRequestDto): Promise<VerifyShiftResponseDto> {
    await delay(500);
    const shift = this.shifts.find((s) => s.id === id);
    if (!shift) throw new Error(`Shift ${id} not found`);

    const now = new Date().toISOString();
    const rawForShift = this.rawTx.filter((tx) => tx.shiftId === id);

    // Create verified transactions from allocations
    let verifiedTotal = 0;
    const newVerified: VerifiedFuelTransaction[] = [];

    for (const rawTx of rawForShift) {
      const paymentType = data.transactionAllocations[rawTx.id];
      if (!paymentType) continue;

      rawTx.isVerified = true;

      const vtx: VerifiedFuelTransaction = {
        id: uuid(),
        rawId: rawTx.id,
        companyId: rawTx.companyId,
        stationId: rawTx.stationId,
        shiftId: rawTx.shiftId,
        attendantId: rawTx.attendantId,
        paymentType,
        verifiedByUserId: 'demo-user-1',
        verifiedAt: now,
        amount: rawTx.amount,
        currency: rawTx.currency,
        time: rawTx.time,
        tagNumber: rawTx.tagNumber,
        fullName: rawTx.fullName,
        pumpId: rawTx.pumpId,
        transactionId: rawTx.transactionId,
      };

      newVerified.push(vtx);
      this.verifiedTx.push(vtx);
      verifiedTotal += rawTx.amount;
    }

    const computedTotal = rawForShift.reduce((s, tx) => s + tx.amount, 0);
    const declaredTotal = shift.declaration?.declaredTotal ?? 0;

    // Create verification summary
    const summary: ShiftVerificationSummary = {
      id: uuid(),
      shiftId: id,
      computedTotal,
      declaredTotal,
      verifiedTotal,
      varianceAmount: computedTotal - verifiedTotal,
      currency: 'ZMW',
      isVerified: true,
      isDisputed: false,
      notes: data.notes,
      verifiedByUserId: 'demo-user-1',
      verifiedAt: now,
    };

    this.verificationSummaries.push(summary);

    // Update shift status
    shift.status = 'verified';
    shift.isVerified = true;
    shift.isPendingVerification = false;
    shift.verifiedBy = 'demo-user-1';
    shift.verifiedAt = now;
    shift.verifiedTransactions = newVerified;
    shift.verificationSummary = summary;
    shift.updatedAt = now;

    // Update legacy unified transactions
    for (const tx of shift.transactions) {
      const allocation = data.transactionAllocations[tx.rawId ?? tx.id];
      if (allocation) {
        tx.paymentType = allocation;
        tx.isVerified = true;
        tx.verifiedByUserId = 'demo-user-1';
        tx.verifiedAt = now;
      }
    }

    return {
      verificationSummary: summary,
      verifiedCount: newVerified.length,
      message: `Verified ${newVerified.length} transactions for shift ${id}`,
    };
  }

  async getShiftRawTransactions(shiftId: string): Promise<RawFuelTransaction[]> {
    await delay();
    return this.rawTx.filter((tx) => tx.shiftId === shiftId);
  }

  async getShiftVerifiedTransactions(shiftId: string): Promise<VerifiedFuelTransaction[]> {
    await delay();
    return this.verifiedTx.filter((tx) => tx.shiftId === shiftId);
  }

  async getShiftDeclaration(shiftId: string): Promise<ShiftCloseDeclaration | null> {
    await delay();
    return this.declarations.find((d) => d.shiftId === shiftId) ?? null;
  }

  async getShiftVerificationSummary(shiftId: string): Promise<ShiftVerificationSummary | null> {
    await delay();
    return this.verificationSummaries.find((v) => v.shiftId === shiftId) ?? null;
  }

  // ── Fuel Sales ─────────────────────────────────────────────

  async getFuelSales(filters?: FuelSalesFiltersDto): Promise<PaginatedResponse<FuelTransaction>> {
    await delay();
    let result = [...mockFuelTransactions];

    if (filters?.verifiedOnly) {
      result = result.filter((tx) => tx.isVerified);
    }
    if (filters?.shiftId) {
      result = result.filter((tx) => tx.shiftId === filters.shiftId);
    }
    if (filters?.attendantId) {
      result = result.filter((tx) => tx.attendantId === filters.attendantId);
    }
    if (filters?.pumpId) {
      result = result.filter((tx) => tx.pumpId === String(filters.pumpId));
    }

    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return paginate(result, filters?.page ?? 1, filters?.pageSize ?? 50);
  }

  async getFuelSale(id: string): Promise<FuelTransaction> {
    await delay();
    const tx = mockFuelTransactions.find((t) => t.id === id);
    if (!tx) throw new Error(`Transaction ${id} not found`);
    return tx;
  }

  async getFuelSalesSummary(_filters?: FuelSalesFiltersDto): Promise<FuelSalesSummary> {
    await delay();
    // Summary uses VERIFIED transactions only
    const verified = mockFuelTransactions.filter((tx) => tx.isVerified);
    const totalAmount = verified.reduce((s, tx) => s + tx.amount, 0);
    const totalVolume = verified.reduce((s, tx) => s + tx.volume, 0);

    return {
      totalVolume,
      totalAmount,
      transactionCount: verified.length,
      byFuelType: {},
      byPaymentType: {
        cash: verified.filter((tx) => tx.paymentType === 'cash').reduce((s, tx) => s + tx.amount, 0),
        card: verified.filter((tx) => tx.paymentType === 'card').reduce((s, tx) => s + tx.amount, 0),
        debtors: verified.filter((tx) => tx.paymentType === 'debtors').reduce((s, tx) => s + tx.amount, 0),
        mobile: verified.filter((tx) => tx.paymentType === 'mobile').reduce((s, tx) => s + tx.amount, 0),
        credit: verified.filter((tx) => tx.paymentType === 'credit').reduce((s, tx) => s + tx.amount, 0),
        other: verified.filter((tx) => tx.paymentType === 'other').reduce((s, tx) => s + tx.amount, 0),
      },
    };
  }

  // ── Pumps ──────────────────────────────────────────────────

  async getPumps(): Promise<Pump[]> {
    await delay();
    return mockPumps;
  }

  async getPump(id: string): Promise<Pump> {
    await delay();
    const pump = mockPumps.find((p) => p.id === id);
    if (!pump) throw new Error(`Pump ${id} not found`);
    return pump;
  }

  async getPumpTransactions(pumpId: string): Promise<FuelTransaction[]> {
    await delay();
    return mockFuelTransactions.filter((tx) => tx.pumpId === pumpId);
  }

  // ── Tanks ──────────────────────────────────────────────────

  async getTanks(): Promise<Tank[]> {
    await delay();
    return mockTanks;
  }

  async getTank(id: string): Promise<Tank> {
    await delay();
    const tank = getMockTankById(id);
    if (!tank) throw new Error(`Tank ${id} not found`);
    return tank;
  }

  async getTankReadings(tankId: string): Promise<TankReading[]> {
    await delay();
    const trend = getMockTankTrend(tankId);
    return trend.map((t, i) => ({
      id: `reading-${tankId}-${i}`,
      tankId,
      volume: t.volume,
      level: Math.round((t.volume / (getMockTankById(tankId)?.capacity ?? 30000)) * 100),
      temperature: t.temperature,
      timestamp: t.timestamp,
    }));
  }

  async getTankTrend(tankId: string): Promise<TankTrendPoint[]> {
    await delay();
    return getMockTankTrend(tankId);
  }

  async getTankAlerts(): Promise<TankAlert[]> {
    await delay();
    const alerts: TankAlert[] = [];
    for (const tank of mockTanks) {
      for (const alarm of tank.alarms) {
        alerts.push({
          id: `alert-${tank.id}-${alarm.type}`,
          tankId: tank.id,
          type: alarm.type as TankAlert['type'],
          message: alarm.message,
          severity: 'warning',
          isAcknowledged: false,
          createdAt: alarm.time,
        });
      }
    }
    return alerts;
  }

  // ── Reports (VERIFIED data only) ──────────────────────────

  async getShiftSummaryReport(_filters: ReportFiltersDto): Promise<ShiftSummaryReport[]> {
    await delay();
    // Only return shifts that are verified
    return mockShiftSummaryReports.filter((r) => r.status === 'verified');
  }

  async getDailySalesReport(_filters: ReportFiltersDto): Promise<DailySalesReport[]> {
    await delay();
    return mockDailySalesReports;
  }

  async getAttendantPerformanceReport(_filters: ReportFiltersDto): Promise<AttendantPerformanceReport[]> {
    await delay();
    return mockAttendantPerformanceReports;
  }

  async getPumpTotalsReport(_filters: ReportFiltersDto): Promise<PumpTotalsReport[]> {
    await delay();
    return mockPumpTotalsReports;
  }

  // ── Dashboard ──────────────────────────────────────────────

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    await delay();
    const activeShifts = this.shifts.filter((s) => s.status === 'active').length;
    const unverifiedShifts = this.shifts.filter((s) => s.status === 'ended' && s.isPendingVerification).length;
    const verifiedTx = this.verifiedTx;
    const todaySales = verifiedTx.reduce((s, tx) => s + tx.amount, 0);
    const tankAlerts = mockTanks.reduce((s, t) => s + t.alarms.length, 0);
    const online = mockPumps.filter((p) => p.status !== 'offline').length;
    const offline = mockPumps.filter((p) => p.status === 'offline').length;
    const fueling = mockPumps.filter((p) => p.status === 'fueling').length;

    return {
      todaySales,
      todayVolume: 460.3,
      activeShifts,
      unverifiedShifts,
      tankAlerts,
      pumpStatus: { online, offline, fueling },
    };
  }

  async getDashboardAlerts(): Promise<TankAlert[]> {
    return this.getTankAlerts();
  }

  async getRecentUnverifiedShifts(): Promise<Shift[]> {
    await delay();
    return this.shifts
      .filter((s) => s.status === 'ended' && s.isPendingVerification)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  // ── Settings – Attendants ──────────────────────────────────

  async getAttendants(): Promise<Attendant[]> {
    await delay();
    return this.attendants;
  }

  async getAttendant(id: string): Promise<Attendant> {
    await delay();
    const att = this.attendants.find((a) => a.id === id);
    if (!att) throw new Error(`Attendant ${id} not found`);
    return att;
  }

  async createAttendant(data: Partial<Attendant>): Promise<Attendant> {
    await delay(300);
    const att: Attendant = {
      id: uuid(),
      companyId: data.companyId ?? 'company-001',
      stationId: data.stationId ?? 'station-001',
      employeeId: data.employeeId ?? uuid(),
      attendantNo: data.attendantNo ?? `A${String(this.attendants.length + 1).padStart(3, '0')}`,
      name: data.name ?? 'New Attendant',
      employeeCode: data.employeeCode ?? `E${String(this.attendants.length + 1).padStart(3, '0')}`,
      phone: data.phone,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.attendants.push(att);
    return att;
  }

  async updateAttendant(id: string, data: Partial<Attendant>): Promise<Attendant> {
    await delay(300);
    const idx = this.attendants.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Attendant ${id} not found`);
    this.attendants[idx] = { ...this.attendants[idx], ...data, updatedAt: new Date().toISOString() };
    return this.attendants[idx];
  }

  async deleteAttendant(id: string): Promise<void> {
    await delay(200);
    const idx = this.attendants.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Attendant ${id} not found`);
    this.attendants.splice(idx, 1);
  }

  async getAttendantTags(attendantId: string): Promise<AttendantRfidTag[]> {
    await delay();
    return mockRfidTags.filter((t) => t.attendantId === attendantId);
  }
}
