/**
 * React Query hooks for Tanks.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getTanks, getTank, getTankReadings, getTankTrend, getTankAlerts } from '../api/tanks.api';

export function useTanks() {
  return useQuery({
    queryKey: queryKeys.tanks.list(),
    queryFn: getTanks,
  });
}

export function useTank(id: string) {
  return useQuery({
    queryKey: queryKeys.tanks.detail(id),
    queryFn: () => getTank(id),
    enabled: !!id,
  });
}

export function useTankReadings(tankId: string) {
  return useQuery({
    queryKey: queryKeys.tanks.readings(tankId),
    queryFn: () => getTankReadings(tankId),
    enabled: !!tankId,
  });
}

export function useTankTrend(tankId: string) {
  return useQuery({
    queryKey: ['tanks', 'trend', tankId] as const,
    queryFn: () => getTankTrend(tankId),
    enabled: !!tankId,
  });
}

export function useTankAlerts() {
  return useQuery({
    queryKey: queryKeys.tanks.alerts(),
    queryFn: getTankAlerts,
  });
}
