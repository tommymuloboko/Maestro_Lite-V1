/**
 * React Query hooks for Dashboard.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getDashboardSummary, getDashboardAlerts, getRecentUnverifiedShifts } from '../api/dashboard.api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: getDashboardSummary,
    refetchInterval: 30_000, // refresh every 30 s
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: queryKeys.dashboard.alerts(),
    queryFn: getDashboardAlerts,
    refetchInterval: 30_000,
  });
}

export function useRecentUnverifiedShifts() {
  return useQuery({
    queryKey: [...queryKeys.shifts.all, 'unverified'] as const,
    queryFn: getRecentUnverifiedShifts,
    refetchInterval: 30_000,
  });
}
