import { getApiService } from '@/lib/api/apiAdapter';
import type { Attendant } from '@/types/attendants';

export async function getStationConfig() {
  // Station config is loaded from local storage / env — not from backend
  const { env } = await import('@/config/env');
  return {
    stationId: env.stationId,
    stationName: env.appName,
    pts2Url: env.pts2Url,
    apiBaseUrl: env.apiBaseUrl,
    currency: 'ZMW',
  };
}

export async function updateStationConfig() {
  // Persisted locally — see StationConfigContext
  throw new Error('Use StationConfigContext to update station config locally');
}

export async function getAttendants() {
  const svc = await getApiService();
  return svc.getAttendants();
}

export async function createAttendant(data: Partial<Attendant>) {
  const svc = await getApiService();
  return svc.createAttendant(data);
}

export async function updateAttendant(id: string, data: Partial<Attendant>) {
  const svc = await getApiService();
  return svc.updateAttendant(id, data);
}

export async function deleteAttendant(id: string) {
  const svc = await getApiService();
  return svc.deleteAttendant(id);
}

export async function getAttendantTags(attendantId: string) {
  const svc = await getApiService();
  return svc.getAttendantTags(attendantId);
}

export async function getPaymentTypes() {
  // Payment types are static configuration
  return ['cash', 'card', 'debtors', 'mobile', 'credit', 'other'] as const;
}

export async function updatePaymentTypes() {
  // Future: allow admin to configure which payment types are available
  throw new Error('Not implemented — payment types are static');
}
