import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge, Center, Group, Loader, SimpleGrid, Text } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { PumpCard } from '../components/PumpCard';
import type { Pump, PumpStatus, Nozzle } from '@/types/pumps';
import { getApiService } from '@/lib/api/apiAdapter';
import { createInitialSimPumps, tickSimPumps } from '@/features/monitoring/simulators/pumpSimulator';
import { useDataSource } from '@/context/DataSourceContext';
import { DataSourceToggle } from '@/components/DataSourceToggle';
import { env } from '@/config/env';

// ─── PTS payload types ──────────────────────────────────────

/**
 * The backend REST response (`GET /api/pts/pumps`) and the WebSocket
 * `connected` event both return pump data in a **flat** structure:
 *
 *   { pump: 1, Pump: 1, NozzlePrices: [...], _resolvedStatus: "Idle", ... }
 *
 * There is NO nested `Data` wrapper. The `_resolvedStatus` field is the
 * backend-resolved human-readable status string like "Idle", "Filling",
 * "Finished", etc.
 *
 * When a pump is actively fueling, the fields change from Last* to current:
 *   Volume, Amount, FuelGradeName  (instead of LastVolume, LastAmount, LastFuelGradeName)
 */
interface FlatPtsPump {
  pump: number;
  Pump: number;
  _resolvedStatus?: string;
  State?: string;            // "Finished" for offline pumps
  lastUpdate?: string;

  // ── Idle / post-fueling fields ──
  NozzleUp?: number;
  Nozzle?: number;
  Request?: string;
  NozzlePrices?: number[];
  LastNozzle?: number;
  LastVolume?: number;
  LastPrice?: number;
  LastAmount?: number;
  LastTransaction?: number;
  LastFuelGradeId?: number;
  LastFuelGradeName?: string;
  LastTotalVolume?: number;
  LastTotalAmount?: number;
  LastDateTimeStart?: string;
  LastDateTime?: string;
  LastFlowRate?: number;
  LastUser?: string;
  LastReceivedTotalNozzle?: number;
  LastReceivedTotalVolume?: number;
  LastReceivedTotalAmount?: number;
  User?: string;

  // ── Active fueling fields (different from Last* above) ──
  Volume?: number;
  Price?: number;
  Amount?: number;
  FuelGradeId?: number;
  FuelGradeName?: string;
  Transaction?: number;
  DateTimeStart?: string;
  FlowRate?: number;
  IsSuspended?: boolean;
  OrderedType?: string;
}

/** Shape of the broadcast "pumpStatus" data payload from WS */
interface PumpStatusBroadcast {
  pump: number;
  status: FlatPtsPump;
}

// ─── Helpers ────────────────────────────────────────────────

/** Map _resolvedStatus / State string → our PumpStatus enum */
function resolvePtsStatus(resolved?: string): PumpStatus {
  if (!resolved) return 'offline';
  const t = resolved.toLowerCase();
  if (t === 'idle') return 'idle';
  if (t === 'filling' || t.includes('fueling') || t.includes('dispensing')) return 'fueling';
  if (t === 'authorized' || t.includes('calling') || t.includes('nozzle')) return 'authorized';
  if (t === 'finished' || t.includes('offline') || t.includes('closed')) return 'offline';
  if (t.includes('error') || t.includes('fault') || t.includes('alarm')) return 'error';
  return 'idle';
}

/** Build nozzles from the NozzlePrices array (only present on idle pumps) */
function buildNozzles(pumpNumber: number, p: FlatPtsPump): Nozzle[] {
  const nozzles: Nozzle[] = [];
  const prices = p.NozzlePrices ?? [];

  for (let i = 0; i < prices.length; i++) {
    if (prices[i] > 0) {
      const nozzleNum = i + 1;
      const isLastNozzle = nozzleNum === (p.LastNozzle ?? 0);
      nozzles.push({
        id: `P${pumpNumber}-N${nozzleNum}`,
        number: nozzleNum,
        fuelType: isLastNozzle ? (p.LastFuelGradeName || 'Fuel') : `Grade ${nozzleNum}`,
        fuelTypeId: isLastNozzle ? String(p.LastFuelGradeId ?? nozzleNum) : String(nozzleNum),
        totalizer: isLastNozzle ? (p.LastTotalVolume ?? 0) : 0,
      });
    }
  }

  // If fueling, we may have a single active nozzle with FuelGradeName but no NozzlePrices
  if (nozzles.length === 0 && p.FuelGradeName) {
    nozzles.push({
      id: `P${pumpNumber}-N${p.Nozzle ?? 1}`,
      number: p.Nozzle ?? 1,
      fuelType: p.FuelGradeName,
      fuelTypeId: String(p.FuelGradeId ?? 1),
      totalizer: 0,
    });
  }

  return nozzles;
}

/** Convert a flat PTS pump object → our Pump type */
export function flatPtsToPump(p: FlatPtsPump): Pump {
  const pumpNumber = p.Pump ?? p.pump;
  const status = resolvePtsStatus(p._resolvedStatus ?? p.State);

  const pump: Pump = {
    id: String(pumpNumber),
    number: pumpNumber,
    name: `Pump ${pumpNumber}`,
    status,
    nozzles: buildNozzles(pumpNumber, p),
    lastUpdated: p.lastUpdate ?? p.LastDateTime ?? new Date().toISOString(),
  };

  // Attach transaction data — use current fueling fields first, fall back to Last* fields
  if (status === 'fueling' && p.Volume != null) {
    // Actively fueling — use the live fields
    pump.currentTransaction = {
      volume: p.Volume ?? 0,
      amount: p.Amount ?? 0,
      fuelType: p.FuelGradeName || 'Unknown',
      startTime: p.DateTimeStart || new Date().toISOString(),
    };
  } else if ((p.LastVolume ?? 0) > 0) {
    // Last completed transaction
    pump.currentTransaction = {
      volume: p.LastVolume ?? 0,
      amount: p.LastAmount ?? 0,
      fuelType: p.LastFuelGradeName || 'Unknown',
      startTime: p.LastDateTimeStart || new Date().toISOString(),
    };
  }

  return pump;
}

// ─── Component ──────────────────────────────────────────────

export function PumpsScreen() {
  const { useSimulator } = useDataSource();

  const [pumps, setPumps] = useState<Pump[]>([]);
  const [isLoading, setIsLoading] = useState(!useSimulator);
  const wsRef = useRef<WebSocket | null>(null);

  const loadPumpsFromApi = useCallback(async () => {
    setIsLoading(true);
    try {
      const api = await getApiService();
      // getPumps() returns Pump[] but the realApiService normalizer is wrong,
      // so we bypass it and fetch the raw response directly from the API
      const res = await (api as unknown as { getPumpsRaw?: () => Promise<unknown> }).getPumpsRaw?.()
        ?? api.getPumps();

      // If we got the raw payload { success, data: [...] }, normalize it ourselves
      if (res && typeof res === 'object' && !Array.isArray(res) && 'data' in (res as Record<string, unknown>)) {
        const raw = (res as { data: FlatPtsPump[] }).data;
        setPumps(raw.map(flatPtsToPump));
      } else if (Array.isArray(res)) {
        // getPumps() already returned Pump[] — check if they have _resolvedStatus (raw format)
        const first = res[0] as Record<string, unknown> | undefined;
        if (first && ('_resolvedStatus' in first || 'Pump' in first)) {
          setPumps((res as unknown as FlatPtsPump[]).map(flatPtsToPump));
        } else {
          setPumps(res as Pump[]);
        }
      } else {
        setPumps([]);
      }
    } catch (error) {
      console.error('Failed to load pumps:', error);
      setPumps([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    const wsUrl = env.wsUrl || `ws://${window.location.hostname}:3000`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log('[PumpsScreen WS] Connected');

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string);

        // Initial full state on connect
        // Backend sends: { type: 'connected', data: { pumps: [...], tanks: [...] } }
        if (msg.type === 'connected' && msg.data?.pumps) {
          const flatPumps = msg.data.pumps as FlatPtsPump[];
          const initial = flatPumps.map(flatPtsToPump);
          if (initial.length > 0) {
            setPumps(initial);
            setIsLoading(false);
          }
        }

        // Live pump status update
        // Backend broadcasts: { type: 'pumpStatus', timestamp, data: { pump, status: {...} } }
        if (msg.type === 'pumpStatus' && msg.data) {
          const broadcast = msg.data as PumpStatusBroadcast;
          const flatPump = broadcast.status ?? msg.data;

          if (flatPump && (flatPump.Pump != null || flatPump.pump != null)) {
            const updated = flatPtsToPump(flatPump as FlatPtsPump);
            setPumps((prev) => {
              const exists = prev.some((p) => p.number === updated.number);
              if (exists) {
                return prev.map((p) => p.number === updated.number ? updated : p);
              }
              return [...prev, updated].sort((a, b) => a.number - b.number);
            });
          }
        }
      } catch (err) {
        console.error('[PumpsScreen WS] Parse error:', err);
      }
    };

    ws.onerror = (error: Event) => console.error('[PumpsScreen WS] Error:', error);
    ws.onclose = () => console.log('[PumpsScreen WS] Disconnected');

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (useSimulator) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      setPumps(createInitialSimPumps());
      setIsLoading(false);

      const timer = window.setInterval(() => {
        setPumps((prev) => tickSimPumps(prev));
      }, 1000);

      return () => window.clearInterval(timer);
    }

    loadPumpsFromApi();
    const cleanupWs = connectWebSocket();

    return () => {
      cleanupWs();
    };
  }, [useSimulator, loadPumpsFromApi, connectWebSocket]);

  if (isLoading) {
    return (
      <Screen title="Pumps" actions={<DataSourceToggle />}>
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  return (
    <Screen title="Pumps" actions={<DataSourceToggle />}>
      {useSimulator && (
        <Group mb="sm" gap="xs">
          <Badge variant="light" color="blue">SIMULATOR</Badge>
          <Text size="xs" c="dimmed">
            Live backend bypassed for UI development
          </Text>
        </Group>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {pumps.map((pump) => (
          <PumpCard key={pump.id} pump={pump} />
        ))}
      </SimpleGrid>

      {pumps.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">No pumps detected</Text>
      )}
    </Screen>
  );
}
