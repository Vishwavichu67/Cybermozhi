
'use client';

import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { SplashScreen } from '@/components/layout/SplashScreen'; // Import the SplashScreen

interface AuthContextType {
  user: User | null;
  loading: boolean; // This is the prop exposed by the context
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStillLoading, setAuthStillLoading] = useState(true); // Internal state for auth readiness
  const [isClientSide, setIsClientSide] = useState(false); // To track client-side mounting

  useEffect(() => {
    setIsClientSide(true); // Component has mounted on the client
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthStillLoading(false); // Auth state determined
    });
    return () => unsubscribe();
  }, []);

  const isLoggedIn = !!user;

  // Show SplashScreen only on the client side if authentication is still loading
  if (isClientSide && authStillLoading) {
    return <SplashScreen />;
  }

  // On the server, or on the client after auth state is resolved (or before mount for initial render match)
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
