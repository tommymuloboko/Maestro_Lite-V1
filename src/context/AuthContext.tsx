import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import type { AuthState, LoginCredentials, AuthTokens } from '@/types/auth';
import { storeTokens, getStoredTokens, clearAllStorage, storeUser, getStoredUser, storeStationId } from '@/lib/storage/secureStore';
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefreshToken } from '@/features/auth/api/auth.api';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Refresh token 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const tokens = getStoredTokens();
    const user = getStoredUser();

    if (tokens && user && tokens.expiresAt > Date.now()) {
      return {
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      };
    }

    if (tokens) {
      clearAllStorage();
    }

    return {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    };
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefreshRef = useRef<(tokens: AuthTokens) => void>(() => {});

  // Clear refresh timer
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Schedule token refresh
  const scheduleRefresh = useCallback((tokens: AuthTokens) => {
    clearRefreshTimer();

    const timeUntilExpiry = tokens.expiresAt - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - REFRESH_BUFFER_MS, 0);

    if (refreshTime > 0) {
      console.log(`[Auth] Scheduling token refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`);
      refreshTimerRef.current = setTimeout(async () => {
        try {
          console.log('[Auth] Refreshing token...');
          const newTokens = await apiRefreshToken(tokens.refreshToken);
          storeTokens(newTokens);
          setState((s) => ({ ...s, tokens: newTokens }));
          scheduleRefreshRef.current(newTokens);
        } catch (error) {
          console.warn('[Auth] Token refresh failed, logging out:', error);
          clearAllStorage();
          setState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }, refreshTime);
    }
  }, [clearRefreshTimer]);

  useEffect(() => {
    scheduleRefreshRef.current = scheduleRefresh;
  }, [scheduleRefresh]);

  // Keep refresh timer in sync with the active token
  useEffect(() => {
    if (state.tokens && state.isAuthenticated) {
      scheduleRefresh(state.tokens);
    }

    return () => clearRefreshTimer();
  }, [state.tokens, state.isAuthenticated, scheduleRefresh, clearRefreshTimer]);

  const login = async (credentials: LoginCredentials) => {
    const { user, tokens } = await apiLogin(credentials);

    storeTokens(tokens);
    storeUser(user);

    // Store stationId if available for X-Station-Id header
    if (user.stationId) {
      storeStationId(user.stationId);
    }

    setState({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    });

    scheduleRefresh(tokens);
  };

  const logout = useCallback(() => {
    clearRefreshTimer();

    // Fire-and-forget server logout (don't wait for response)
    apiLogout().catch((err) => {
      console.warn('[Auth] Server logout failed:', err);
    });

    clearAllStorage();
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, [clearRefreshTimer]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
