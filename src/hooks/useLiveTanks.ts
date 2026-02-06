import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { pollingIntervals } from '@/config/ui';
import type { Tank } from '@/types/tanks';

export function useLiveTanks() {
  return useQuery({
    queryKey: queryKeys.tanks.list(),
    queryFn: () => api.get<Tank[]>(endpoints.tanks.list),
    refetchInterval: pollingIntervals.tanks,
    staleTime: pollingIntervals.tanks / 2,
  });
}
