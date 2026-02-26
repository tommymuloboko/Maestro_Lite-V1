import { useState, useEffect, useCallback, useRef } from 'react';
import { Center, Loader, SimpleGrid, Text } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { PumpCard } from '../components/PumpCard';
import type { Pump, PumpStatus, Nozzle } from '@/types/pumps';
import { getApiService } from '@/lib/api/apiAdapter';
import { env } from '@/config/env';

// ─── PTS payload types ──────────────────────────────────────
//
// The backend returns NESTED pump objects from GET /api/pts/pumps:
//   { pump: 1, Id: 1, Type: "PumpIdleStatus", Data: { Pump: 1, NozzlePrices: [...], ... }, lastUpdate: "..." }
//
// All the actual pump data fields (NozzlePrices, LastVolume, etc.) live INSIDE .Data
// The status comes from .Type (e.g. "PumpIdleStatus", "PumpFillingStatus")

interface PtsPumpData {
  Pump: number;
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

  // Active fueling fields (replace Last* when pump is dispensing)
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

  // Some responses include resolved status at Data level
  _resolvedStatus?: string;
  State?: string;
}

/** Top-level item from GET /api/pts/pumps → data[] */
interface PtsApiPump {
  pump: number;
  Id: number;
  Type: string;        // "PumpIdleStatus", "PumpFillingStatus", "PumpOfflineStatus"
  Data: PtsPumpData;
  lastUpdate?: string;
  _resolvedStatus?: string;  // sometimes at top level too
}

interface PumpStatusBroadcast {
  pump: number;
  status: PtsApiPump;
}

// ─── Helpers ────────────────────────────────────────────────

function resolvePtsStatus(ptsType?: string, resolved?: string): PumpStatus {
  // If we have a direct _resolvedStatus, use it
  if (resolved) {
    const r = resolved.toLowerCase();
    if (r === 'idle') return 'idle';
    if (r === 'filling' || r.includes('fueling') || r.includes('dispensing')) return 'fueling';
    if (r === 'authorized' || r.includes('calling')) return 'authorized';
    if (r === 'finished' || r.includes('offline') || r.includes('closed')) return 'offline';
    if (r.includes('error') || r.includes('fault')) return 'error';
  }

  // Fall back to Type field (e.g. "PumpIdleStatus")
  if (ptsType) {
    const t = ptsType.toLowerCase();
    if (t.includes('idle')) return 'idle';
    if (t.includes('filling') || t.includes('fueling') || t.includes('dispensing')) return 'fueling';
    if (t.includes('authorized') || t.includes('calling') || t.includes('nozzle')) return 'authorized';
    if (t.includes('offline') || t.includes('finished') || t.includes('closed')) return 'offline';
    if (t.includes('error') || t.includes('fault') || t.includes('alarm')) return 'error';
  }

  return 'offline';
}

function buildNozzles(pumpNumber: number, d: PtsPumpData): Nozzle[] {
  const nozzles: Nozzle[] = [];
  const prices = d.NozzlePrices ?? [];

  for (let i = 0; i < prices.length; i++) {
    if (prices[i] > 0) {
      const nozzleNum = i + 1;
      const isLastNozzle = nozzleNum === (d.LastNozzle ?? 0);
      nozzles.push({
        id: `P${pumpNumber}-N${nozzleNum}`,
        number: nozzleNum,
        fuelType: isLastNozzle ? (d.LastFuelGradeName || 'Fuel') : `Grade ${nozzleNum}`,
        fuelTypeId: isLastNozzle ? String(d.LastFuelGradeId ?? nozzleNum) : String(nozzleNum),
        totalizer: isLastNozzle ? (d.LastTotalVolume ?? 0) : 0,
      });
    }
  }

  // If actively fueling with no NozzlePrices, create from FuelGradeName
  if (nozzles.length === 0 && d.FuelGradeName) {
    nozzles.push({
      id: `P${pumpNumber}-N${d.Nozzle ?? 1}`,
      number: d.Nozzle ?? 1,
      fuelType: d.FuelGradeName,
      fuelTypeId: String(d.FuelGradeId ?? 1),
      totalizer: 0,
    });
  }

  return nozzles;
}

/** Convert a PTS API pump item → our Pump type */
export function ptsApiToPump(item: PtsApiPump): Pump {
  const d = item.Data;
  const pumpNumber = d?.Pump ?? item.pump ?? item.Id;
  const status = resolvePtsStatus(item.Type, item._resolvedStatus ?? d?._resolvedStatus);

  const pump: Pump = {
    id: String(pumpNumber),
    number: pumpNumber,
    name: `Pump ${pumpNumber}`,
    status,
    nozzles: d ? buildNozzles(pumpNumber, d) : [],
    lastUpdated: item.lastUpdate ?? d?.LastDateTime ?? new Date().toISOString(),
  };

  // Attach transaction: active fueling uses Volume/Amount, idle uses Last*
  if (d) {
    if (status === 'fueling' && d.Volume != null) {
      pump.currentTransaction = {
        volume: d.Volume ?? 0,
        amount: d.Amount ?? 0,
        fuelType: d.FuelGradeName || 'Unknown',
        startTime: d.DateTimeStart || new Date().toISOString(),
      };
    } else if ((d.LastVolume ?? 0) > 0) {
      pump.currentTransaction = {
        volume: d.LastVolume ?? 0,
        amount: d.LastAmount ?? 0,
        fuelType: d.LastFuelGradeName || 'Unknown',
        startTime: d.LastDateTimeStart || new Date().toISOString(),
      };
    }
  }

  return pump;
}

// ─── Component ──────────────────────────────────────────────

export function PumpsScreen() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const loadPumps = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiUrl = env.apiUrl || `http://${window.location.hostname}:3000/api`;
      const url = `${apiUrl}/pts/pumps`;

      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const items: PtsApiPump[] = json.data ?? [];
      const normalized = items.map(ptsApiToPump);

      console.log(`[PumpsScreen] Loaded ${normalized.length} pumps, first status: ${normalized[0]?.status}`);
      setPumps(normalized);
    } catch (error) {
      console.error('[PumpsScreen] Failed to load pumps:', error);
      // Fallback to API service
      try {
        const api = await getApiService();
        setPumps(await api.getPumps());
      } catch {
        setPumps([]);
      }
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

        // Initial full state: { type: 'connected', data: { pumps: [...] } }
        if (msg.type === 'connected' && msg.data?.pumps) {
          const ptsItems = msg.data.pumps as PtsApiPump[];
          const initial = ptsItems.map(ptsApiToPump);
          if (initial.length > 0) {
            setPumps(initial);
            setIsLoading(false);
          }
        }

        // Live update: { type: 'pumpStatus', data: { pump, status: { Id, Type, Data } } }
        if (msg.type === 'pumpStatus' && msg.data) {
          const broadcast = msg.data as PumpStatusBroadcast;
          const ptsItem = broadcast.status ?? msg.data;

          if (ptsItem?.Data) {
            const updated = ptsApiToPump(ptsItem as PtsApiPump);
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
    loadPumps();
    const cleanupWs = connectWebSocket();
    return () => { cleanupWs(); };
  }, [loadPumps, connectWebSocket]);

  if (isLoading) {
    return (
      <Screen title="Pumps">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  return (
    <Screen title="Pumps">
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
