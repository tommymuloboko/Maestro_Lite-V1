import { getApiService } from '@/lib/api/apiAdapter';

export async function getDashboardSummary() {
  const svc = await getApiService();
  return svc.getDashboardSummary();
}

export async function getDashboardAlerts() {
  const svc = await getApiService();
  return svc.getDashboardAlerts();
}

export async function getRecentUnverifiedShifts() {
  const svc = await getApiService();
  return svc.getRecentUnverifiedShifts();
}
