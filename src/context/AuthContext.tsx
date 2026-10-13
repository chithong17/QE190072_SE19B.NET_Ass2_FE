"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { AUTH_SESSION_EVENT } from '@/lib/axios';

export interface User {
  accountId: number;
  fullName: string;
  email: string;
  role: number;
  roleName: string;
}

interface StoredSession {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
}

export interface AuthContextType extends StoredSession {
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, userData: User, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const emptySession: StoredSession = { token: null, refreshToken: null, user: null };

const AuthContext = createContext<AuthContextType>({
  ...emptySession,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: () => undefined,
  logout: async () => undefined,
  updateUser: () => undefined,
});

function clearStoredSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function readStoredSession(): StoredSession {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const storedUser = localStorage.getItem('user');
  if (!token || !storedUser) return emptySession;
  return { token, refreshToken, user: JSON.parse(storedUser) as User };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession>(emptySession);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const syncSession = () => {
      Promise.resolve().then(() => {
        try {
          setSession(readStoredSession());
        } catch (error) {
          console.error('Failed to restore the authentication session:', error);
          clearStoredSession();
          setSession(emptySession);
        } finally {
          setLoading(false);
        }
      });
    };
    const expireSession = () => {
      syncSession();
      router.push('/login?expired=1');
    };

    syncSession();
    window.addEventListener(AUTH_SESSION_EVENT, syncSession);
    window.addEventListener('auth-session-expired', expireSession);
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
      window.removeEventListener('auth-session-expired', expireSession);
    };
  }, [router]);

  const login = (newToken: string, userData: User, newRefreshToken?: string) => {
    const next = { token: newToken, user: userData, refreshToken: newRefreshToken ?? null };
    setSession(next);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
    else localStorage.removeItem('refreshToken');
  };

  const logout = async () => {
    try {
      if (session.refreshToken) await api.post('/auth/revoke');
    } catch {
      // Local logout still succeeds if the server is unavailable.
    } finally {
      clearStoredSession();
      setSession(emptySession);
      router.push('/');
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (!session.user) return;
    const user = { ...session.user, ...data };
    setSession({ ...session, user });
    localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{
      ...session,
      loading,
      isAuthenticated: Boolean(session.token && session.user),
      isAdmin: session.user?.role === 1,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
