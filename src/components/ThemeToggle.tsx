"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md border transition-all duration-200 shadow-lg group",
        theme === 'dark'
          ? 'bg-white/10 border-white/20 hover:bg-white/20'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      )}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" />
      )}
    </button>
  );
}
