'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import QuizApp from './QuizApp';
import HeroShowcase from '@/components/ui/hero';

export default function AuthWrapper() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      // Wait for auth to fully load
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      // User is authenticated, no need for additional syncing
      // The AuthContext already handles syncing when user signs in
      setLoading(false);
    };

    syncUserWithBackend();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show landing page if user is not signed in
  if (!user) {
    return <HeroShowcase />;
  }

  // User is signed in, show quiz app
  return <QuizApp />;
}