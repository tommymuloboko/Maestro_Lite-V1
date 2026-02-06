import type { Shift, ShiftCloseDeclaration, ShiftVerificationSummary } from '@/types/shifts';
import { mockAttendants } from './attendants.mock';
import { getMockTransactionsByShift, getMockRawByShift, getMockVerifiedByShift } from './fuelTransactions.mock';

/* ─── Shift Close Declarations (attendant end-shift declarations) ── */

export const mockDeclarations: ShiftCloseDeclaration[] = [
  {
    id: 'decl-001',
    shiftId: 'SH-001',
    declaredCash: 1152.60,
    declaredCard: 1904.00,
    declaredDebtors: 2867.90,
    declaredOther: {},
    declaredTotal: 5924.50,
    currency: 'ZMW',
    submittedAt: '2026-02-06T14:05:00Z',
  },
  {
    id: 'decl-002',
    shiftId: 'SH-002',
    declaredCash: 1422.90,
    declaredCard: 0,
    declaredDebtors: 0,
    declaredOther: { mobile: 765.00 },
    declaredTotal: 2187.90,
    currency: 'ZMW',
    submittedAt: '2026-02-06T14:02:00Z',
  },
  {
    id: 'decl-003',
    shiftId: 'SH-003',
    declaredCash: 510.00,
    declaredCard: 1020.00,
    declaredDebtors: 0,
    declaredOther: {},
    declaredTotal: 1530.00,
    currency: 'ZMW',
    submittedAt: '2026-02-06T06:05:00Z',
  },
  {
    id: 'decl-005',
    shiftId: 'SH-005',
    declaredCash: 890.00,
    declaredCard: 2100.00,
    declaredDebtors: 450.50,
    declaredOther: {},
    declaredTotal: 3440.50,
    currency: 'ZMW',
    submittedAt: '2026-02-05T18:05:00Z',
  },
];

/* ─── Shift Verification Summaries (manager decisions) ── */

export const mockVerificationSummaries: ShiftVerificationSummary[] = [
  {
    id: 'vs-001',
    shiftId: 'SH-001',
    computedTotal: 5924.50,        // sum of raw tx amounts
    declaredTotal: 5924.50,        // what attendant declared
    verifiedTotal: 5924.50,        // sum of verified tx amounts
    varianceAmount: 0,
    currency: 'ZMW',
    isVerified: true,
    isDisputed: false,
    notes: 'All amounts match.',
    verifiedByUserId: 'demo-user-1',
    verifiedAt: '2026-02-06T14:30:00Z',
  },
  {
    id: 'vs-003',
    shiftId: 'SH-003',
    computedTotal: 1530.00,
    declaredTotal: 1530.00,
    verifiedTotal: 1530.00,
    varianceAmount: 0,
    currency: 'ZMW',
    isVerified: true,
    isDisputed: false,
    verifiedByUserId: 'demo-user-1',
    verifiedAt: '2026-02-06T07:00:00Z',
  },
];

/* ─── Main Shifts ── */

export const mockShifts: Shift[] = [
  // ── SH-001: VERIFIED (John Mwale) ──
  {
    id: 'SH-001',
    companyId: 'company-001',
    stationId: 'station-001',
    attendantId: 'att-1',
    attendant: mockAttendants[0],
    tagNumber: 'RFID-0001-A',
    pumpIds: ['1', '2'],
    startTime: '2026-02-06T06:00:00Z',
    endTime: '2026-02-06T14:00:00Z',
    status: 'verified',
    isOpen: false,
    isEnded: true,
    isPendingVerification: false,
    isVerified: true,
    isDisputed: false,
    openingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125385.3, amount: 3197326.15, timestamp: '2026-02-06T06:00:00Z' },
      { pumpId: '2', nozzleId: 'n2-1', fuelType: 'Diesel', volume: 98130.3, amount: 2335481.14, timestamp: '2026-02-06T06:00:00Z' },
    ],
    closingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125430.5, amount: 3198477.75, timestamp: '2026-02-06T14:00:00Z' },
      { pumpId: '2', nozzleId: 'n2-1', fuelType: 'Diesel', volume: 98210.3, amount: 2337385.14, timestamp: '2026-02-06T14:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-001'),
    rawTransactions: getMockRawByShift('SH-001'),
    verifiedTransactions: getMockVerifiedByShift('SH-001'),
    declaration: mockDeclarations[0],
    verificationSummary: mockVerificationSummaries[0],
    payments: [
      { id: 'pay-1', paymentType: 'cash', declaredAmount: 1152.6, countedAmount: 1150.0, variance: -2.6 },
      { id: 'pay-2', paymentType: 'card', declaredAmount: 1904.0, countedAmount: 1904.0, variance: 0 },
      { id: 'pay-3', paymentType: 'debtors', declaredAmount: 2867.9, countedAmount: 2867.9, variance: 0 },
    ],
    variance: {
      totalDeclared: 5924.5,
      totalCounted: 5921.9,
      totalExpected: 5924.5,
      variance: -2.6,
      variancePercent: -0.04,
    },
    verifiedBy: 'demo-user-1',
    verifiedAt: '2026-02-06T14:30:00Z',
    openedByUserId: 'demo-user-1',
    createdAt: '2026-02-06T06:00:00Z',
    updatedAt: '2026-02-06T14:30:00Z',
  },

  // ── SH-002: ENDED — awaiting verification (Peter Banda) ──
  {
    id: 'SH-002',
    companyId: 'company-001',
    stationId: 'station-001',
    attendantId: 'att-2',
    attendant: mockAttendants[1],
    tagNumber: 'RFID-0002-B',
    pumpIds: ['1', '3'],
    startTime: '2026-02-06T06:00:00Z',
    endTime: '2026-02-06T14:00:00Z',
    status: 'ended',
    isOpen: false,
    isEnded: true,
    isPendingVerification: true,
    isVerified: false,
    isDisputed: false,
    openingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125385.3, amount: 3197326.15, timestamp: '2026-02-06T06:00:00Z' },
      { pumpId: '3', nozzleId: 'n3-1', fuelType: 'Petrol', volume: 87594.4, amount: 2233657.2, timestamp: '2026-02-06T06:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-002'),
    rawTransactions: getMockRawByShift('SH-002'),
    declaration: mockDeclarations[1],
    payments: [
      { id: 'pay-4', paymentType: 'cash', declaredAmount: 1422.9, countedAmount: 0, variance: 0 },
      { id: 'pay-5', paymentType: 'mobile', declaredAmount: 765.0, countedAmount: 0, variance: 0 },
    ],
    openedByUserId: 'demo-user-1',
    createdAt: '2026-02-06T06:00:00Z',
    updatedAt: '2026-02-06T14:00:00Z',
  },

  // ── SH-003: VERIFIED (Mary Zulu — night shift) ──
  {
    id: 'SH-003',
    companyId: 'company-001',
    stationId: 'station-001',
    attendantId: 'att-3',
    attendant: mockAttendants[2],
    tagNumber: 'RFID-0003-C',
    pumpIds: ['1', '3'],
    startTime: '2026-02-05T22:00:00Z',
    endTime: '2026-02-06T06:00:00Z',
    status: 'verified',
    isOpen: false,
    isEnded: true,
    isPendingVerification: false,
    isVerified: true,
    isDisputed: false,
    openingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125345.3, amount: 3196305.15, timestamp: '2026-02-05T22:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-003'),
    rawTransactions: getMockRawByShift('SH-003'),
    verifiedTransactions: getMockVerifiedByShift('SH-003'),
    declaration: mockDeclarations[2],
    verificationSummary: mockVerificationSummaries[1],
    payments: [
      { id: 'pay-6', paymentType: 'cash', declaredAmount: 510.0, countedAmount: 510.0, variance: 0 },
      { id: 'pay-7', paymentType: 'card', declaredAmount: 1020.0, countedAmount: 1020.0, variance: 0 },
    ],
    variance: {
      totalDeclared: 1530.0,
      totalCounted: 1530.0,
      totalExpected: 1530.0,
      variance: 0,
      variancePercent: 0,
    },
    verifiedBy: 'demo-user-1',
    verifiedAt: '2026-02-06T07:00:00Z',
    openedByUserId: 'demo-user-1',
    createdAt: '2026-02-05T22:00:00Z',
    updatedAt: '2026-02-06T07:00:00Z',
  },

  // ── SH-004: ACTIVE (James Phiri — currently working) ──
  {
    id: 'SH-004',
    companyId: 'company-001',
    stationId: 'station-001',
    attendantId: 'att-4',
    attendant: mockAttendants[3],
    tagNumber: 'RFID-0004-D',
    pumpIds: ['2'],
    startTime: '2026-02-06T10:00:00Z',
    status: 'active',
    isOpen: true,
    isEnded: false,
    isPendingVerification: false,
    isVerified: false,
    isDisputed: false,
    openingReadings: [
      { pumpId: '2', nozzleId: 'n2-1', fuelType: 'Diesel', volume: 98210.3, amount: 2337385.14, timestamp: '2026-02-06T10:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-004'),
    rawTransactions: getMockRawByShift('SH-004'),
    payments: [],
    openedByUserId: 'demo-user-1',
    createdAt: '2026-02-06T10:00:00Z',
    updatedAt: '2026-02-06T11:30:00Z',
  },

  // ── SH-005: ENDED — awaiting verification (Peter Banda, yesterday) ──
  {
    id: 'SH-005',
    companyId: 'company-001',
    stationId: 'station-001',
    attendantId: 'att-2',
    attendant: mockAttendants[1],
    tagNumber: 'RFID-0002-B',
    pumpIds: ['1', '3'],
    startTime: '2026-02-05T14:00:00Z',
    endTime: '2026-02-05T18:00:00Z',
    status: 'ended',
    isOpen: false,
    isEnded: true,
    isPendingVerification: true,
    isVerified: false,
    isDisputed: false,
    openingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125300.0, amount: 3196150.0, timestamp: '2026-02-05T14:00:00Z' },
      { pumpId: '3', nozzleId: 'n3-1', fuelType: 'Petrol', volume: 87500.0, amount: 2231250.0, timestamp: '2026-02-05T14:00:00Z' },
    ],
    closingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125385.3, amount: 3198324.15, timestamp: '2026-02-05T18:00:00Z' },
      { pumpId: '3', nozzleId: 'n3-1', fuelType: 'Petrol', volume: 87594.4, amount: 2233657.2, timestamp: '2026-02-05T18:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-005'),
    rawTransactions: getMockRawByShift('SH-005'),
    declaration: mockDeclarations[3],
    payments: [
      { id: 'pay-8', paymentType: 'cash', declaredAmount: 890.0, countedAmount: 0, variance: 0 },
      { id: 'pay-9', paymentType: 'card', declaredAmount: 2100.0, countedAmount: 0, variance: 0 },
      { id: 'pay-10', paymentType: 'debtors', declaredAmount: 450.5, countedAmount: 0, variance: 0 },
    ],
    openedByUserId: 'demo-user-1',
    createdAt: '2026-02-05T14:00:00Z',
    updatedAt: '2026-02-05T18:00:00Z',
  },
];

export function getMockShiftById(id: string): Shift | undefined {
  return mockShifts.find((s) => s.id === id);
}

export function getMockDeclarationByShiftId(shiftId: string): ShiftCloseDeclaration | undefined {
  return mockDeclarations.find((d) => d.shiftId === shiftId);
}

export function getMockVerificationSummaryByShiftId(shiftId: string): ShiftVerificationSummary | undefined {
  return mockVerificationSummaries.find((v) => v.shiftId === shiftId);
}
