export type ReportType =
  | 'shift-summary'
  | 'daily-sales-by-payment'
  | 'attendant-performance'
  | 'pump-totals'
  | 'tank-inventory'
  | 'variance-report';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  attendantId?: string;
  pumpId?: string;
  tankId?: string;
  shiftId?: string;
}

export interface ShiftSummaryReport {
  shiftId: string;
  attendantName: string;
  startTime: string;
  endTime: string;
  totalSales: number;
  totalVolume: number;
  transactionCount: number;
  variance: number;
  status: string;
}

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalVolume: number;
  transactionCount: number;
  byPaymentType: Record<string, number>;
  byFuelType: Record<string, { volume: number; amount: number }>;
}

export interface AttendantPerformanceReport {
  attendantId: string;
  attendantName: string;
  shiftCount: number;
  totalSales: number;
  totalVolume: number;
  averageVariance: number;
  transactionCount: number;
}

export interface PumpTotalsReport {
  pumpId: string;
  pumpNumber: number;
  totalVolume: number;
  totalSales: number;
  transactionCount: number;
  byFuelType: Record<string, { volume: number; amount: number }>;
}
