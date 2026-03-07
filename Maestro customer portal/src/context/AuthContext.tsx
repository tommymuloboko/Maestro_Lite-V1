import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users for the system
const DEMO_USERS: Record<string, User & { password: string }> = {
  'customer@maestro.com': {
    id: 'cust-001',
    name: 'John Mokoena',
    email: 'customer@maestro.com',
    role: 'customer',
    phone: '+27 83 456 7890',
    companyName: 'Maestro Logistics',
    password: 'password123',
  },
  'manager@maestro.com': {
    id: 'mgr-001',
    name: 'Pieter van der Merwe',
    email: 'manager@maestro.com',
    role: 'station_manager',
    phone: '+27 71 234 5678',
    siteId: 'SITE-JHB-001',
    password: 'password123',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('maestro_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email: string, password: string, role: UserRole): boolean => {
    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password && demoUser.role === role) {
      const { password: _pw, ...userData } = demoUser;
      void _pw;
      setUser(userData);
      sessionStorage.setItem('maestro_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('maestro_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
