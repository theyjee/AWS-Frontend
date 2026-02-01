'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ServiceSelectionHeaderProps {
  title?: string;
  subtitle?: string;
  showIcon?: boolean;
}

export function ServiceSelectionHeader({
  title = "Choose a Service to Practice",
  subtitle = "Select the AWS service you want to focus on",
  showIcon = false,
}: ServiceSelectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl mb-6 pt-4 sm:pt-6 pb-4 sm:pb-6 px-6 sm:px-8",
        "shadow-lg backdrop-blur-sm",
        theme === 'dark'
          ? 'bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/40 border border-blue-700/50'
          : 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border border-blue-200/50'
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob",
            theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
          )}
        />
        <div
          className={cn(
            "absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000",
            theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'
          )}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-center">
          {/* Icon */}
          {showIcon && (
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  "p-3 rounded-full",
                  theme === 'dark'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-blue-200/60 text-blue-700'
                )}
              >
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Title */}
          <h2
            className={cn(
              "text-2xl sm:text-3xl font-bold mb-1 tracking-tight",
              "transition-colors duration-300",
              theme === 'dark'
                ? 'text-white drop-shadow-sm'
                : 'text-gray-900 drop-shadow-sm'
            )}
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p
            className={cn(
              "text-sm sm:text-base max-w-2xl mx-auto",
              "transition-colors duration-300",
              theme === 'dark'
                ? 'text-blue-100/90'
                : 'text-blue-900/70'
            )}
          >
            {subtitle}
          </p>

          {/* Decorative line */}
          <div className="flex justify-center mt-3 mb-0">
            <div
              className={cn(
                "h-1 w-12 rounded-full",
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
