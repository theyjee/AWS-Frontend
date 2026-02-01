"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved theme preference
    // If no preference exists, defaults to light mode
    const savedTheme = localStorage.getItem('quiz-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    // Otherwise, theme remains 'light' (the default)
  }, []);

  useEffect(() => {
    if (mounted) {
      // Save theme preference to localStorage
      localStorage.setItem('quiz-theme', theme);

      // Update document class for global styling
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    // Check if View Transitions API is supported
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      // Create custom clip-path animation
      const transition = document.startViewTransition(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
      });

      // Wait for the transition to be ready, then apply custom animation
      transition.ready.then(() => {
        // Create the curtain wipe-down effect using clip-path
        const root = document.documentElement;
        
        // Set initial clip-path (hidden at top)
        root.style.setProperty('--clip-path-start', 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)');
        root.style.setProperty('--clip-path-end', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
        
        // Apply animation to the pseudo-element created by view transition
        const style = document.createElement('style');
        style.textContent = `
          ::view-transition-new(root),
          ::view-transition-old(root) {
            animation: curtainWipeDown 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
          }
          
          @keyframes curtainWipeDown {
            from {
              clip-path: var(--clip-path-start);
            }
            to {
              clip-path: var(--clip-path-end);
            }
          }
        `;
        document.head.appendChild(style);
        
        // Clean up style element after animation
        setTimeout(() => {
          document.head.removeChild(style);
        }, 600);
      });
    } else {
      // Fallback for browsers that don't support View Transitions API
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  if (!mounted) {
    // Prevent flash of unstyled content
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
