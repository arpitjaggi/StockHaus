import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

// Debug logging - always log in case of issues
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 VITE_API_BASE_URL env:', import.meta.env.VITE_API_BASE_URL);

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
    const loginUrl = `${API_BASE_URL}/auth/login`;
    console.log('🔧 Attempting login to:', loginUrl);
    
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('🔧 Login response status:', res.status, res.statusText);
      
      if (!res.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, try text
          const text = await res.text();
          errorMessage = text || errorMessage;
        }
        
        // Provide helpful error messages
        if (res.status === 0 || res.status === 500) {
          errorMessage = 'Cannot connect to server. Check if backend is running and VITE_API_BASE_URL is set correctly.';
        } else if (res.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (res.status === 404) {
          errorMessage = `API endpoint not found at ${loginUrl}. Check VITE_API_BASE_URL configuration.`;
        } else if (res.status === 0) {
          errorMessage = 'CORS error or network failure. Check CORS_ORIGIN in Railway includes your Vercel URL.';
        }
        
        throw new Error(errorMessage);
      }
      const data = await res.json();
      localStorage.setItem(tokenKey, data.token);
      setUser({ username: data.username });
    } catch (err) {
      console.error('🔧 Login error:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const errorMsg = `Network error: Cannot reach backend server at ${loginUrl}. ` +
          `Check: 1) VITE_API_BASE_URL in Vercel env vars, 2) Railway backend is running, 3) CORS_ORIGIN includes your Vercel URL.`;
        throw new Error(errorMsg);
      }
      throw err;
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

