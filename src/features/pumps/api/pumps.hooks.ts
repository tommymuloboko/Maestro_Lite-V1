/**
 * React Query hooks for Pumps.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getPumps, getPump, getPumpStatus, getPumpTransactions } from '../api/pumps.api';

export function usePumps() {
  return useQuery({
    queryKey: queryKeys.pumps.list(),
    queryFn: getPumps,
  });
}

export function usePump(id: string) {
  return useQuery({
    queryKey: queryKeys.pumps.detail(id),
    queryFn: () => getPump(id),
    enabled: !!id,
  });
}

export function usePumpStatus() {
  return useQuery({
    queryKey: queryKeys.pumps.status(),
    queryFn: getPumpStatus,
    refetchInterval: 5_000, // poll every 5 s for live status
  });
}

export function usePumpTransactions(pumpId: string) {
  return useQuery({
    queryKey: queryKeys.pumps.transactions(pumpId),
    queryFn: () => getPumpTransactions(pumpId),
    enabled: !!pumpId,
  });
}
