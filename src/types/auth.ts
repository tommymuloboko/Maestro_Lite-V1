export interface User {
  id: string;
  username: string;
  name: string;
  role: string; // Allow any role from backend, not just fixed values
  stationId?: string;
  companyId?: string;
  email?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
