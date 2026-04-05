'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from './api';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lf_token');
    const email = localStorage.getItem('lf_user_email');
    if (token) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // FastAPI OAuth2 espera form-data no /token
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    const response = await fetch(`${api.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Erro ao fazer login' }));
      throw new Error(err.detail || 'Erro ao fazer login');
    }

    const data = await response.json();
    localStorage.setItem('lf_token', data.access_token);
    localStorage.setItem('lf_user_email', email);
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const register = async (email: string, password: string): Promise<string> => {
    const response = await fetch(`${api.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({ detail: 'Erro ao cadastrar' }));

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao cadastrar');
    }

    return data.message;
  };

  const logout = () => {
    localStorage.removeItem('lf_token');
    localStorage.removeItem('lf_user_email');
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
