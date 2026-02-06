import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthState, LoginCredentials } from '@/types/auth';
import { storeTokens, getStoredTokens, clearAllStorage, storeUser, getStoredUser } from '@/lib/storage/secureStore';
import { DEMO_CREDENTIALS, DEMO_USER } from '@/features/auth/api/auth.api';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    const tokens = getStoredTokens();
    const user = getStoredUser();

    if (tokens && user && tokens.expiresAt > Date.now()) {
      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      if (tokens) clearAllStorage();
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    if (
      credentials.username === DEMO_CREDENTIALS.username &&
      credentials.password === DEMO_CREDENTIALS.password
    ) {
      const user: User = DEMO_USER;
      const tokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      };

      storeTokens(tokens);
      storeUser(user);

      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    clearAllStorage();
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

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
