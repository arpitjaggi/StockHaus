import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = (() => {
  const env = (import.meta.env.VITE_API_BASE_URL as string | undefined);
  if (env && env !== '') return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const runtime = (window as any).__STOCKHAUS_API_BASE__ as string | undefined;
    if (runtime && runtime !== '') return runtime.replace(/\/$/, '');
    try { return `${window.location.origin.replace(/\/$/, '')}/api`; } catch { return 'http://localhost:4000/api'; }
  }
  return 'http://localhost:4000/api';
})();

type AuthContextValue = {
  user: { username: string } | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const tokenKey = 'stockhaus_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Not authorized');
      const data = await res.json();
      setUser({ username: data.username });
    } catch {
      localStorage.removeItem(tokenKey);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem(tokenKey, data.token);
      setUser({ username: data.username });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('stockhaus_active_project_id');
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

