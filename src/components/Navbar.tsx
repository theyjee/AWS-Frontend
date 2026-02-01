'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Navbar() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return null; // Or a loading skeleton
  }

  return (
    <nav className="fixed top-4 right-4 md:top-6 md:right-24 z-50">
      <div
        className={cn(
          "rounded-full px-2 py-1.5 md:px-4 md:py-2 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-md border",
          theme === 'dark'
            ? 'border-blue-500/30 bg-gradient-to-r from-slate-900/70 via-blue-900/60 to-blue-800/60'
            : 'border-blue-300/40 bg-gradient-to-r from-blue-50/70 via-blue-50/60 to-white/70'
        )}
      >
        <div className="flex items-center gap-2 md:gap-4">
          {/* Auth */}
          <div className="flex items-center gap-1 md:gap-2">
            {!user ? (
              <>
                <Link href="/sign-in">
                  <button
                    className={cn(
                      "px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full transition-colors",
                      theme === 'dark'
                        ? 'text-slate-200 hover:text-white hover:bg-white/10'
                        : 'text-[#2C488F] hover:text-[#1E3A6F] hover:bg-blue-200/40'
                    )}
                  >
                    Sign In
                  </button>
                </Link>

                <Link href="/sign-up">
                  <button
                    className={cn(
                      'px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full',
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-[#2C488F] via-[#3B5BA0] to-[#4A6CB1] text-white hover:from-[#3B5BA0] hover:via-[#4A6CB1] hover:to-[#5D7CC2] shadow-lg'
                        : 'bg-gradient-to-r from-[#2C488F] via-[#3B5BA0] to-[#4A6CB1] text-white hover:from-[#3B5BA0] hover:via-[#4A6CB1] hover:to-[#5D7CC2] shadow-md'
                    )}
                  >
                    Sign Up
                  </button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3">
                  {/* User Menu */}
                  <div className="relative group">
                    <button
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C488F] to-[#3B5BA0] flex items-center justify-center text-white text-sm font-semibold">
                        {user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase()}
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        theme === 'dark' ? 'text-slate-200' : 'text-[#2C488F]'
                      )}>
                        {user.displayName || user.email?.split('@')[0]}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className={cn(
                      "absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200",
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700'
                        : 'bg-white border border-gray-200'
                    )}>
                      <Link href="/profile">
                        <button className={cn(
                          "w-full text-left px-4 py-2 text-sm transition-colors",
                          theme === 'dark'
                            ? 'text-slate-200 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}>
                          Profile
                        </button>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm transition-colors",
                          theme === 'dark'
                            ? 'text-slate-200 hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}