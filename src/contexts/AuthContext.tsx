
'use client';

import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { SplashScreen } from '@/components/layout/SplashScreen';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStillLoading, setAuthStillLoading] = useState(true);
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthStillLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isLoggedIn = !!user;

  // Show SplashScreen if not client-side yet (for SSR/hydration consistency) OR if auth is still loading.
  if (!isClientSide || authStillLoading) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading: authStillLoading, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
