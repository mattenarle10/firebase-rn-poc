import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, onAuthStateChanged, signInWithEmail, signUpWithEmail, signOutUser, type User } from '@/src/services/auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    async signIn(email: string, password: string) {
      return await signInWithEmail(email, password);
    },
    async signUp(email: string, password: string) {
      return await signUpWithEmail(email, password);
    },
    async signOut() {
      await signOutUser();
    },
  }), [user, loading]);

  return React.createElement(AuthContext.Provider, { value }, children as any);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}