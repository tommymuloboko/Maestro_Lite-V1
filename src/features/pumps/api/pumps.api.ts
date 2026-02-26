import { getApiService } from '@/lib/api/apiAdapter';
import type { Pump, PumpStatus } from '@/types/pumps';

// ─── PTS raw types (same as PumpsScreen) ─────────────────────

interface PtsPumpData {
  Pump: number;
  NozzleUp: number;
  Nozzle: number;
  Request: string;
  NozzlePrices: number[];
  LastNozzle: number;
  LastVolume: number;
  LastPrice: number;
  LastAmount: number;
  LastTransaction: number;
  LastFuelGradeId: number;
  LastFuelGradeName: string;
  LastTotalVolume: number;
  LastTotalAmount: number;
  LastDateTimeStart: string;
  LastDateTime: string;
  LastFlowRate: number;
  LastUser: string;
  User: string;
}

interface PtsPumpMessage {
  Id: number;
  Type: string;
  Data: PtsPumpData;
}

/** Shape from getCachedPumpsStatus() — has extra pump + lastUpdate fields */
interface CachedPumpStatus extends PtsPumpMessage {
  pump: number;
  lastUpdate: string;
}

/** DB config record from GET /api/pumps */
interface DbPumpConfig {
  id: string;          // UUID
  station_id: string;  // UUID
  pts2_pump_id: number;
  name: string;
  is_active: boolean;
}

// ─── PTS → Pump converters ──────────────────────────────────

function resolvePtsStatus(ptsType: string): PumpStatus {
  const t = ptsType.toLowerCase();
  if (t.includes('fueling') || t.includes('dispensing') || t.includes('filling')) return 'fueling';
  if (t.includes('authorized') || t.includes('calling') || t.includes('nozzle')) return 'authorized';
  if (t.includes('offline') || t.includes('finished') || t.includes('closed')) return 'offline';
  if (t.includes('error') || t.includes('fault') || t.includes('alarm')) return 'error';
  return 'idle';
}

function ptsToPump(msg: PtsPumpMessage): Pump {
  const d = msg.Data;
  const pumpNumber = d.Pump ?? msg.Id;
  const status = resolvePtsStatus(msg.Type);

  const pump: Pump = {
    id: String(pumpNumber),
    number: pumpNumber,
    name: `Pump ${pumpNumber}`,
    status,
    nozzles: (d.NozzlePrices ?? [])
      .map((price, i) => {
        if (price <= 0) return null;
        const nozzleNum = i + 1;
        const isLast = nozzleNum === d.LastNozzle;
        return {
          id: `P${pumpNumber}-N${nozzleNum}`,
          number: nozzleNum,
          fuelType: isLast ? (d.LastFuelGradeName || 'Fuel') : `Grade ${nozzleNum}`,
          fuelTypeId: isLast ? String(d.LastFuelGradeId ?? nozzleNum) : String(nozzleNum),
          totalizer: isLast ? (d.LastTotalVolume ?? 0) : 0,
        };
      })
      .filter(Boolean) as Pump['nozzles'],
    lastUpdated: d.LastDateTime || new Date().toISOString(),
  };

  if (status === 'fueling' || d.LastVolume > 0) {
    pump.currentTransaction = {
      volume: d.LastVolume ?? 0,
      amount: d.LastAmount ?? 0,
      fuelType: d.LastFuelGradeName || 'Unknown',
      startTime: d.LastDateTimeStart || new Date().toISOString(),
    };
  }

  return pump;
}

/** Convert a DB config record to a minimal Pump (no live status) */
function dbConfigToPump(cfg: DbPumpConfig): Pump {
  return {
    id: cfg.id,
    number: cfg.pts2_pump_id,
    name: cfg.name || `Pump ${cfg.pts2_pump_id}`,
    status: cfg.is_active ? 'idle' : 'offline',
    nozzles: [],
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Response normalizers ───────────────────────────────────

/**
 * Normalize the pumps response from whichever endpoint the API service uses.
 *
 * GET /api/pts/pumps → { success, data: CachedPumpStatus[] }   (live PTS data)
 * GET /api/pumps     → { success, pumps: DbPumpConfig[] }      (DB config records)
 */
function normalizePumpsResponse(payload: unknown): Pump[] {
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;

  // Case 1: PTS live data → { data: [...] } with raw PTS packets
  if (Array.isArray(record.data)) {
    const items = record.data as CachedPumpStatus[];
    // Verify it's PTS data by checking for Type/Data fields on first item
    if (items.length > 0 && items[0].Type && items[0].Data) {
      return items.map(ptsToPump);
    }
  }

  // Case 2: DB config records → { pumps: [...] }
  if (Array.isArray(record.pumps)) {
    return (record.pumps as DbPumpConfig[]).map(dbConfigToPump);
  }

  // Case 3: Bare array (unlikely but safe)
  if (Array.isArray(payload)) {
    const arr = payload as Record<string, unknown>[];
    if (arr.length > 0 && arr[0].Type && arr[0].Data) {
      return (arr as unknown as CachedPumpStatus[]).map(ptsToPump);
    }
    // Assume DB config
    return (arr as unknown as DbPumpConfig[]).map(dbConfigToPump);
  }

  return [];
}

// ─── Exported API functions ─────────────────────────────────

export async function getPumps(): Promise<Pump[]> {
  const svc = await getApiService();
  const payload = await svc.getPumps();
  return normalizePumpsResponse(payload);
}

export async function getPump(id: string) {
  const svc = await getApiService();
  return svc.getPump(id);
}

export async function getPumpStatus() {
  const pumps = await getPumps();

  return pumps.map((p) => ({
    pumpId: p.number,
    status: p.status,
    currentTransaction: p.currentTransaction,
    lastUpdated: p.lastUpdated ?? new Date().toISOString(),
  }));
}

export async function getPumpTransactions(pumpId: string) {
  const svc = await getApiService();
  return svc.getPumpTransactions(pumpId);
}
