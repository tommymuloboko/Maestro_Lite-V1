import { getApiService } from '@/lib/api/apiAdapter';
import type { ReportFiltersDto } from '@/lib/api/dto';

/**
 * ALL report data uses VERIFIED transactions only.
 * This is enforced at both the API adapter level and the backend.
 */

export async function getShiftSummaryReport(filters: ReportFiltersDto) {
  const svc = await getApiService();
  return svc.getShiftSummaryReport(filters);
}

export async function getDailySalesReport(filters: ReportFiltersDto) {
  const svc = await getApiService();
  return svc.getDailySalesReport(filters);
}

export async function getAttendantPerformanceReport(filters: ReportFiltersDto) {
  const svc = await getApiService();
  return svc.getAttendantPerformanceReport(filters);
}

export async function getPumpTotalsReport(filters: ReportFiltersDto) {
  const svc = await getApiService();
  return svc.getPumpTotalsReport(filters);
}
