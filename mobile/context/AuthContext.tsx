import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { authService } from '@/services/auth.service';
import { MeResponse } from '@/types/api';

interface AuthContextType {
  user: MeResponse | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateBudget: (budget: number) => Promise<void>;
  updateCurrency: (currency: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    try {
      await api.initialize();
      const storedToken = await api.getToken();
      if (storedToken) {
        setToken(storedToken);
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch {
      await api.setToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.token) {
      await api.setToken(response.token);
      setToken(response.token);
      const userData = await authService.getMe();
      setUser(userData);
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    await authService.signup({ email, password, fullName });
  };

  const logout = async () => {
    await api.setToken(null);
    setToken(null);
    setUser(null);
  };

  const updateBudget = async (budget: number) => {
    const response = await authService.updateBudget(budget);
    setUser(prev => prev ? { ...prev, budget: response.budget } : null);
  };

  const updateCurrency = async (currency: string) => {
    const response = await authService.updateCurrency(currency);
    setUser(prev => prev ? { ...prev, currency: response.currency } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        restoreSession,
        updateBudget,
        updateCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}