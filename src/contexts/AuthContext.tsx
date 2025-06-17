'use client';

import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

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

  // Show skeleton only on the client side if authentication is still loading
  if (isClientSide && authStillLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Simplified Skeleton Header */}
        <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 h-16 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        {/* Centered Loader for main content area */}
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        {/* Simplified Skeleton Footer */}
        <div className="border-t border-border/40 bg-background/95 py-8 text-center">
           <Skeleton className="h-4 w-1/3 mx-auto" />
        </div>
      </div>
    );
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
