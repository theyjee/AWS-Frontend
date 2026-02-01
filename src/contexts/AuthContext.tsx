'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { firebaseAuth, syncUserWithBackend } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Sync user with backend when they sign in
          await syncUserWithBackend(firebaseUser);
          setUser(firebaseUser);
        } catch (error) {
          console.error('Error syncing user:', error);
          setUser(firebaseUser); // Still set the user even if sync fails
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setError(null);
      const { user: newUser } = await firebaseAuth.signUp(email, password, name);

      if (newUser) {
        await syncUserWithBackend(newUser);
        setUser(newUser);
        router.push('/');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      setError(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { user: signedInUser } = await firebaseAuth.signIn(email, password);

      if (signedInUser) {
        await syncUserWithBackend(signedInUser);
        setUser(signedInUser);

        // Redirect based on current path
        if (pathname?.includes('/sign-in')) {
          router.push('/');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { user: googleUser } = await firebaseAuth.signInWithGoogle();

      if (googleUser) {
        await syncUserWithBackend(googleUser);
        setUser(googleUser);

        // Redirect based on current path
        if (pathname?.includes('/sign-in') || pathname?.includes('/sign-up')) {
          router.push('/');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      setError(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseAuth.signOut();
      setUser(null);
      router.push('/sign-in');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setError(errorMessage);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await firebaseAuth.resetPassword(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);
      throw error;
    }
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      setError(null);
      const updatedUser = await firebaseAuth.updateUserProfile(updates);
      if (updatedUser) {
        await syncUserWithBackend(updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      throw error;
    }
  };

  const getIdToken = async () => {
    return await firebaseAuth.getIdToken();
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    getIdToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for protected routes
export const useRequireAuth = (redirectUrl = '/sign-in') => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  return { user, loading };
};