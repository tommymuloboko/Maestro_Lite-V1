import { getApiService } from '@/lib/api/apiAdapter';
import type { Pump, PumpStatus } from '@/types/pumps';

const pumpStatuses: PumpStatus[] = ['idle', 'authorized', 'fueling', 'offline', 'error'];

function isPumpStatus(value: unknown): value is PumpStatus {
  return typeof value === 'string' && pumpStatuses.includes(value as PumpStatus);
}

function normalizePumpsResponse(payload: unknown): Pump[] {
  if (Array.isArray(payload)) {
    return payload as Pump[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const containers = [record.data, record.pumps, record.items, record.results];

    for (const container of containers) {
      if (Array.isArray(container)) {
        return container as Pump[];
      }
    }
  }

  return [];
}

export async function getPumps() {
  const svc = await getApiService();
  return svc.getPumps();
}

export async function getPump(id: string) {
  const svc = await getApiService();
  return svc.getPump(id);
}

export async function getPumpStatus() {
  const svc = await getApiService();
  const payload = (await svc.getPumps()) as unknown;
  const pumps = normalizePumpsResponse(payload);

  return pumps.map((p) => ({
    pumpId: Number(p.id ?? p.number ?? 0),
    status: isPumpStatus(p.status) ? p.status : 'offline',
    currentTransaction: p.currentTransaction,
    lastUpdated: p.lastUpdated ?? new Date().toISOString(),
  }));
}

export async function getPumpTransactions(pumpId: string) {
  const svc = await getApiService();
  return svc.getPumpTransactions(pumpId);
}
