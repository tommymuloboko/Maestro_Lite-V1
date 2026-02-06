import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { pollingIntervals } from '@/config/ui';
import type { Pump } from '@/types/pumps';

export function useLivePumps() {
  return useQuery({
    queryKey: queryKeys.pumps.status(),
    queryFn: () => api.get<Pump[]>(endpoints.pumps.status),
    refetchInterval: pollingIntervals.pumps,
    staleTime: pollingIntervals.pumps / 2,
  });
}
