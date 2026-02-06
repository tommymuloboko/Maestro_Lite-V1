import type { ShiftSummaryReport, DailySalesReport, AttendantPerformanceReport, PumpTotalsReport } from '@/types/reports';

export const mockShiftSummaryReports: ShiftSummaryReport[] = [
  {
    shiftId: 'SH-001',
    attendantName: 'John Mwale',
    startTime: '2026-02-06T06:00:00Z',
    endTime: '2026-02-06T14:00:00Z',
    totalSales: 5924.5,
    totalVolume: 245.7,
    transactionCount: 3,
    variance: -2.6,
    status: 'verified',
  },
  {
    shiftId: 'SH-002',
    attendantName: 'Peter Banda',
    startTime: '2026-02-06T06:00:00Z',
    endTime: '2026-02-06T14:00:00Z',
    totalSales: 2187.9,
    totalVolume: 85.8,
    transactionCount: 2,
    variance: -2.9,
    status: 'ended',
  },
  {
    shiftId: 'SH-003',
    attendantName: 'Mary Zulu',
    startTime: '2026-02-05T22:00:00Z',
    endTime: '2026-02-06T06:00:00Z',
    totalSales: 1530.0,
    totalVolume: 60.0,
    transactionCount: 2,
    variance: 0,
    status: 'verified',
  },
];

export const mockDailySalesReports: DailySalesReport[] = [
  {
    date: '2026-02-06',
    totalSales: 11196.54,
    totalVolume: 460.3,
    transactionCount: 8,
    byPaymentType: { cash: 3085.5, card: 2924.0, mobile: 2319.14, credit: 2867.9 },
    byFuelType: {
      Petrol: { volume: 191.0, amount: 4870.5 },
      Diesel: { volume: 265.8, amount: 6326.04 },
    },
  },
  {
    date: '2026-02-05',
    totalSales: 9850.0,
    totalVolume: 410.2,
    transactionCount: 7,
    byPaymentType: { cash: 4200.0, card: 3150.0, mobile: 1500.0, credit: 1000.0 },
    byFuelType: {
      Petrol: { volume: 220.0, amount: 5610.0 },
      Diesel: { volume: 190.2, amount: 4240.0 },
    },
  },
];

export const mockAttendantPerformanceReports: AttendantPerformanceReport[] = [
  {
    attendantId: 'att-1',
    attendantName: 'John Mwale',
    shiftCount: 12,
    totalSales: 68400.0,
    totalVolume: 2840.5,
    averageVariance: -1.3,
    transactionCount: 156,
  },
  {
    attendantId: 'att-2',
    attendantName: 'Peter Banda',
    shiftCount: 10,
    totalSales: 52100.0,
    totalVolume: 2160.0,
    averageVariance: -0.5,
    transactionCount: 128,
  },
  {
    attendantId: 'att-3',
    attendantName: 'Mary Zulu',
    shiftCount: 8,
    totalSales: 38500.0,
    totalVolume: 1590.0,
    averageVariance: 0.2,
    transactionCount: 95,
  },
  {
    attendantId: 'att-4',
    attendantName: 'James Phiri',
    shiftCount: 5,
    totalSales: 22800.0,
    totalVolume: 950.0,
    averageVariance: -3.1,
    transactionCount: 62,
  },
];

export const mockPumpTotalsReports: PumpTotalsReport[] = [
  {
    pumpId: '1',
    pumpNumber: 1,
    totalVolume: 1250.5,
    totalSales: 31887.75,
    transactionCount: 45,
    byFuelType: { Petrol: { volume: 1250.5, amount: 31887.75 } },
  },
  {
    pumpId: '2',
    pumpNumber: 2,
    totalVolume: 980.3,
    totalSales: 23331.14,
    transactionCount: 38,
    byFuelType: { Diesel: { volume: 980.3, amount: 23331.14 } },
  },
  {
    pumpId: '3',
    pumpNumber: 3,
    totalVolume: 620.0,
    totalSales: 15810.0,
    transactionCount: 22,
    byFuelType: { Petrol: { volume: 620.0, amount: 15810.0 } },
  },
  {
    pumpId: '4',
    pumpNumber: 4,
    totalVolume: 0,
    totalSales: 0,
    transactionCount: 0,
    byFuelType: {},
  },
];
