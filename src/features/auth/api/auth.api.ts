import type { LoginCredentials } from '@/types/auth';
import { getApiService } from '@/lib/api/apiAdapter';

// Demo credentials for development
export const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export const DEMO_USER = {
  id: 'demo-user-1',
  username: 'admin',
  name: 'Demo Manager',
  role: 'manager' as const,
  stationId: 'station-001',
};

// ── API functions (delegate to adapter) ──────────────────────

export async function login(credentials: LoginCredentials) {
  const svc = await getApiService();
  return svc.login(credentials);
}

export async function logout() {
  const svc = await getApiService();
  return svc.logout();
}

export async function refreshToken(token: string) {
  const svc = await getApiService();
  return svc.refreshToken(token);
}

export async function getCurrentUser() {
  const svc = await getApiService();
  return svc.getCurrentUser();
}
