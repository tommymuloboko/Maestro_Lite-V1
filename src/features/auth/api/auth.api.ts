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

// API functions - not implemented yet
export async function login() {
  throw new Error('API not implemented');
}

export async function logout() {
  throw new Error('API not implemented');
}

export async function refreshToken() {
  throw new Error('API not implemented');
}

export async function getCurrentUser() {
  throw new Error('API not implemented');
}
