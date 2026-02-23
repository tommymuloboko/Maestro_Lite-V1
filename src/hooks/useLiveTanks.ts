import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { pollingIntervals } from '@/config/ui';
import type { Tank } from '@/types/tanks';
import { useWebSocket } from '@/context/WebSocketContext';

/** When WS is connected, slow the poll way down (safety-net only). */
const WS_CONNECTED_POLL_MS = 120_000;

export function useLiveTanks() {
  const { wsStatus } = useWebSocket();
  const interval = wsStatus === 'connected' ? WS_CONNECTED_POLL_MS : pollingIntervals.tanks;

  return useQuery({
    queryKey: queryKeys.tanks.list(),
    queryFn: () => api.get<Tank[]>(endpoints.tanks.list),
    refetchInterval: interval,
    staleTime: interval / 2,
  });
}
