import type { Shift } from '@/types/shifts';
import { mockAttendants } from './attendants.mock';
import { getMockTransactionsByShift } from './fuelTransactions.mock';

export const mockShifts: Shift[] = [
  {
    id: 'SH-001',
    attendantId: 'att-1',
    attendant: mockAttendants[0],
    pumpIds: ['1', '2'],
    startTime: '2026-02-06T06:00:00Z',
    endTime: '2026-02-06T14:00:00Z',
    status: 'verified',
    openingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125385.3, amount: 3197326.15, timestamp: '2026-02-06T06:00:00Z' },
      { pumpId: '2', nozzleId: 'n2-1', fuelType: 'Diesel', volume: 98130.3, amount: 2335481.14, timestamp: '2026-02-06T06:00:00Z' },
    ],
    closingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125430.5, amount: 3198477.75, timestamp: '2026-02-06T14:00:00Z' },
      { pumpId: '2', nozzleId: 'n2-1', fuelType: 'Diesel', volume: 98210.3, amount: 2337385.14, timestamp: '2026-02-06T14:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-001'),
    payments: [
      { id: 'pay-1', paymentType: 'cash', declaredAmount: 1152.6, countedAmount: 1150.0, variance: -2.6 },
      { id: 'pay-2', paymentType: 'card', declaredAmount: 1904.0, countedAmount: 1904.0, variance: 0 },
      { id: 'pay-3', paymentType: 'credit', declaredAmount: 2867.9, countedAmount: 2867.9, variance: 0 },
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
    createdAt: '2026-02-06T06:00:00Z',
    updatedAt: '2026-02-06T14:30:00Z',
  },
  {
    id: 'SH-002',
    attendantId: 'att-2',
    attendant: mockAttendants[1],
    pumpIds: ['1', '3'],
    startTime: '2026-02-06T06:00:00Z',
    endTime: '2026-02-06T14:00:00Z',
    status: 'ended',
    openingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125385.3, amount: 3197326.15, timestamp: '2026-02-06T06:00:00Z' },
      { pumpId: '3', nozzleId: 'n3-1', fuelType: 'Petrol', volume: 87594.4, amount: 2233657.2, timestamp: '2026-02-06T06:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-002'),
    payments: [
      { id: 'pay-4', paymentType: 'cash', declaredAmount: 1422.9, countedAmount: 1420.0, variance: -2.9 },
      { id: 'pay-5', paymentType: 'mobile', declaredAmount: 765.0, countedAmount: 765.0, variance: 0 },
    ],
    createdAt: '2026-02-06T06:00:00Z',
    updatedAt: '2026-02-06T14:00:00Z',
  },
  {
    id: 'SH-003',
    attendantId: 'att-3',
    attendant: mockAttendants[2],
    pumpIds: ['1', '3'],
    startTime: '2026-02-05T22:00:00Z',
    endTime: '2026-02-06T06:00:00Z',
    status: 'verified',
    openingReadings: [
      { pumpId: '1', nozzleId: 'n1-1', fuelType: 'Petrol', volume: 125345.3, amount: 3196305.15, timestamp: '2026-02-05T22:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-003'),
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
    createdAt: '2026-02-05T22:00:00Z',
    updatedAt: '2026-02-06T07:00:00Z',
  },
  {
    id: 'SH-004',
    attendantId: 'att-4',
    attendant: mockAttendants[3],
    pumpIds: ['2'],
    startTime: '2026-02-06T10:00:00Z',
    status: 'active',
    openingReadings: [
      { pumpId: '2', nozzleId: 'n2-1', fuelType: 'Diesel', volume: 98210.3, amount: 2337385.14, timestamp: '2026-02-06T10:00:00Z' },
    ],
    transactions: getMockTransactionsByShift('SH-004'),
    payments: [],
    createdAt: '2026-02-06T10:00:00Z',
    updatedAt: '2026-02-06T11:30:00Z',
  },
];

export function getMockShiftById(id: string): Shift | undefined {
  return mockShifts.find((s) => s.id === id);
}
