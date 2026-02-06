import { getApiService } from '@/lib/api/apiAdapter';

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
  const pumps = await svc.getPumps();
  return pumps.map((p) => ({
    pumpId: Number(p.id),
    status: p.status,
    currentTransaction: p.currentTransaction,
    lastUpdated: p.lastUpdated,
  }));
}

export async function getPumpTransactions(pumpId: string) {
  const svc = await getApiService();
  return svc.getPumpTransactions(pumpId);
}
