import { getApiService } from '@/lib/api/apiAdapter';

export async function getTanks() {
  const svc = await getApiService();
  return svc.getTanks();
}

export async function getTank(id: string) {
  const svc = await getApiService();
  return svc.getTank(id);
}

export async function getTankReadings(tankId: string) {
  const svc = await getApiService();
  return svc.getTankReadings(tankId);
}

export async function getTankTrend(tankId: string) {
  const svc = await getApiService();
  return svc.getTankTrend(tankId);
}

export async function getTankAlerts() {
  const svc = await getApiService();
  return svc.getTankAlerts();
}
