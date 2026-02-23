import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { pollingIntervals } from '@/config/ui';
import type { CurrentTransaction, Nozzle, Pump, PumpStatus } from '@/types/pumps';
import { useWebSocket } from '@/context/WebSocketContext';

/** When WS is connected, slow the poll way down (safety-net only). */
const WS_CONNECTED_POLL_MS = 60_000;

const pumpStatuses: PumpStatus[] = ['idle', 'authorized', 'fueling', 'offline', 'error'];

function isPumpStatus(value: unknown): value is PumpStatus {
  return typeof value === 'string' && pumpStatuses.includes(value as PumpStatus);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeCurrentTransaction(value: unknown): CurrentTransaction | undefined {
  const tx = asRecord(value);
  if (!tx) {
    return undefined;
  }

  const volume = asNumber(tx.volume);
  const amount = asNumber(tx.amount);
  if (volume === null || amount === null) {
    return undefined;
  }

  return {
    volume,
    amount,
    fuelType: typeof tx.fuelType === 'string' ? tx.fuelType : 'Unknown',
    startTime: typeof tx.startTime === 'string' ? tx.startTime : new Date().toISOString(),
  };
}

function normalizeNozzles(value: unknown): Nozzle[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const nozzle = asRecord(item);
      if (!nozzle) {
        return null;
      }

      const nozzleNumber = asNumber(nozzle.number);
      const totalizer = asNumber(nozzle.totalizer);
      if (nozzleNumber === null || totalizer === null) {
        return null;
      }

      return {
        id: String(nozzle.id ?? nozzle.number ?? nozzleNumber),
        number: nozzleNumber,
        fuelType: typeof nozzle.fuelType === 'string' ? nozzle.fuelType : 'Unknown',
        fuelTypeId: typeof nozzle.fuelTypeId === 'string' ? nozzle.fuelTypeId : 'unknown',
        totalizer,
      };
    })
    .filter((item): item is Nozzle => item !== null);
}

function normalizePump(value: unknown): Pump | null {
  const pump = asRecord(value);
  if (!pump) {
    return null;
  }

  const rawId = pump.id ?? pump.pumpId;
  const rawNumber = pump.number ?? pump.pumpNumber ?? pump.pumpId;
  const number = asNumber(rawNumber);
  if (!rawId || number === null) {
    return null;
  }

  return {
    id: String(rawId),
    number,
    name: typeof pump.name === 'string' ? pump.name : `Pump ${number}`,
    status: isPumpStatus(pump.status) ? pump.status : 'offline',
    nozzles: normalizeNozzles(pump.nozzles),
    currentTransaction: normalizeCurrentTransaction(pump.currentTransaction),
    lastUpdated: typeof pump.lastUpdated === 'string' ? pump.lastUpdated : new Date().toISOString(),
  };
}

function extractPumpCollection(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const root = asRecord(payload);
  if (!root) {
    return [];
  }

  const candidates: unknown[] = [
    root.data,
    root.pumps,
    root.items,
    root.results,
  ];

  const nestedData = asRecord(root.data);
  if (nestedData) {
    candidates.push(nestedData.pumps, nestedData.items, nestedData.results);
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function normalizePumpsResponse(payload: unknown): Pump[] {
  return extractPumpCollection(payload)
    .map((item) => normalizePump(item))
    .filter((item): item is Pump => item !== null);
}

export function useLivePumps() {
  const { wsStatus } = useWebSocket();
  const interval = wsStatus === 'connected' ? WS_CONNECTED_POLL_MS : pollingIntervals.pumps;

  return useQuery({
    queryKey: queryKeys.pumps.status(),
    queryFn: async () => {
      const response = await api.get<unknown>(endpoints.pumps.status);
      return normalizePumpsResponse(response);
    },
    refetchInterval: interval,
    staleTime: interval / 2,
  });
}
