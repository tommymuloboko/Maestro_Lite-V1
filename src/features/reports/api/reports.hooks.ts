/**
 * React Query hooks for Reports.
 * ALL report data uses VERIFIED transactions only.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import type { ReportFiltersDto } from '@/lib/api/dto';
import {
  getShiftSummaryReport,
  getDailySalesReport,
  getAttendantPerformanceReport,
  getPumpTotalsReport,
} from '../api/reports.api';

export function useShiftSummaryReport(filters: ReportFiltersDto) {
  return useQuery({
    queryKey: queryKeys.reports.shiftSummary(filters),
    queryFn: () => getShiftSummaryReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
  });
}

export function useDailySalesReport(filters: ReportFiltersDto) {
  return useQuery({
    queryKey: queryKeys.reports.dailySales(filters),
    queryFn: () => getDailySalesReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
  });
}

export function useAttendantPerformanceReport(filters: ReportFiltersDto) {
  return useQuery({
    queryKey: queryKeys.reports.attendantPerformance(filters),
    queryFn: () => getAttendantPerformanceReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
  });
}

export function usePumpTotalsReport(filters: ReportFiltersDto) {
  return useQuery({
    queryKey: queryKeys.reports.pumpTotals(filters),
    queryFn: () => getPumpTotalsReport(filters),
    enabled: !!filters.startDate && !!filters.endDate,
  });
}
