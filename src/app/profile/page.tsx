'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, QuizResult } from '@/types/user';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ServiceSelectionHeader } from '@/components/ServiceSelectionHeader';
import { cn } from '@/lib/utils';

interface UserStats {
  totalQuizzes: number;
  totalCorrect: number;
  totalPointsEarned: number;
  averagePoints: number;
  averageScore: number;
  lastQuizDate?: string;
}

export default function ProfilePage() {
  const { user: firebaseUser, loading: authLoading, getIdToken, updateProfile } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (authLoading) return;

      if (!firebaseUser) {
        router.push('/sign-in');
        return;
      }

      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = await getIdToken();

        // Fetch user profile
        const userResponse = await fetch(`${apiUrl}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const user = await userResponse.json();
        setUserData(user);

        // Fetch user statistics
        const statsResponse = await fetch(`${apiUrl}/quiz-results/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch recent quiz results
        const quizzesResponse = await fetch(`${apiUrl}/quiz-results`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          setRecentQuizzes(quizzesData);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [firebaseUser, authLoading, getIdToken, router]);

  const handleEditName = () => {
    setEditedName(userData?.name || firebaseUser?.displayName || '');
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
    setError(null); // Clear any errors when canceling
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setIsSavingName(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = await getIdToken();

      const requestUrl = `${apiUrl}/users/profile`;
      console.log('Updating name at:', requestUrl); // Debug log

      const response = await fetch(requestUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editedName.trim() })
      });

      if (!response.ok) {
        // Try to parse error as JSON, but handle HTML error pages
        let errorMessage = 'Failed to update name';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      setIsEditingName(false);
      
      // Update Firebase display name in the auth context
      if (firebaseUser) {
        await updateProfile({ displayName: editedName.trim() });
      }
    } catch (err) {
      console.error('Error updating name:', err);
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className={cn(
        "min-h-screen relative flex items-center justify-center overflow-hidden",
        theme === 'dark' 
          ? 'bg-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      )}>
        <AnimatedGridPattern theme={theme} />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={cn(
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "min-h-screen relative flex items-center justify-center overflow-hidden",
        theme === 'dark' 
          ? 'bg-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      )}>
        <AnimatedGridPattern theme={theme} />
        <div className="relative z-10 text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden",
      theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    )}>
      <AnimatedGridPattern theme={theme} />

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <ServiceSelectionHeader
          title="Profile"
          subtitle="View your quiz statistics and progress"
          showIcon={false}
        />

        {/* User Info Card */}
        <div className={cn(
          "rounded-lg shadow-lg p-6 mb-8",
          theme === 'dark'
            ? 'bg-gray-800/90 border border-gray-700'
            : 'bg-white border border-gray-200'
        )}>
          <h2 className={cn(
            "text-2xl font-semibold mb-4",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            User Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className={cn(
                "text-sm mb-2",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Name
              </p>
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => {
                      setEditedName(e.target.value);
                      setError(null); // Clear error when user types
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveName();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    className={cn(
                      "text-lg font-medium px-3 py-2 rounded-lg border w-full",
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:outline-none'
                        : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:outline-none'
                    )}
                    autoFocus
                    disabled={isSavingName}
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className={cn(
                        "px-4 py-1.5 text-sm rounded-lg font-medium transition-colors",
                        isSavingName
                          ? 'opacity-50 cursor-not-allowed'
                          : '',
                        theme === 'dark'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {isSavingName ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSavingName}
                      className={cn(
                        "px-4 py-1.5 text-sm rounded-lg font-medium transition-colors",
                        isSavingName
                          ? 'opacity-50 cursor-not-allowed'
                          : '',
                        theme === 'dark'
                          ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "text-lg font-medium",
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {userData?.name || firebaseUser?.displayName || 'N/A'}
                  </p>
                  <button
                    onClick={handleEditName}
                    className={cn(
                      "text-sm px-2 py-1 rounded hover:bg-opacity-20 transition-colors",
                      theme === 'dark'
                        ? 'text-blue-400 hover:bg-blue-400'
                        : 'text-blue-600 hover:bg-blue-100'
                    )}
                    title="Edit name"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Email
              </p>
              <p className={cn(
                "text-lg font-medium",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {userData?.email || firebaseUser?.email}
              </p>
            </div>
            <div>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Class
              </p>
              <p className={cn(
                "text-lg font-medium",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {userData?.class || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Member Since
              </p>
              <p className={cn(
                "text-lg font-medium",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        {stats && (
          <div className={cn(
            "rounded-lg shadow-lg p-6 mb-8",
            theme === 'dark'
              ? 'bg-gray-800/90 border border-gray-700'
              : 'bg-white border border-gray-200'
          )}>
            <h2 className={cn(
              "text-2xl font-semibold mb-4",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Quiz Statistics
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Total Quizzes
                </p>
                <p className={cn(
                  "text-3xl font-bold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {stats.totalQuizzes}
                </p>
              </div>
              <div>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Average Score
                </p>
                <p className={cn(
                  "text-3xl font-bold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {stats.averageScore.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Total Points
                </p>
                <p className={cn(
                  "text-3xl font-bold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {stats.totalPointsEarned}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Quizzes */}
        {recentQuizzes.length > 0 && (
          <div className={cn(
            "rounded-lg shadow-lg p-6",
            theme === 'dark'
              ? 'bg-gray-800/90 border border-gray-700'
              : 'bg-white border border-gray-200'
          )}>
            <h2 className={cn(
              "text-2xl font-semibold mb-4",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Recent Quizzes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={cn(
                    "border-b",
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  )}>
                    <th className={cn(
                      "text-left py-2 px-2",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      Service
                    </th>
                    <th className={cn(
                      "text-left py-2 px-2",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      Score
                    </th>
                    <th className={cn(
                      "text-left py-2 px-2",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      Points
                    </th>
                    <th className={cn(
                      "text-left py-2 px-2",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuizzes.map((quiz, idx) => (
                    <tr
                      key={quiz._id || idx}
                      className={cn(
                        "border-b",
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      )}
                    >
                      <td className={cn(
                        "py-2 px-2",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {quiz.service}
                      </td>
                      <td className={cn(
                        "py-2 px-2",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {quiz.score}%
                      </td>
                      <td className={cn(
                        "py-2 px-2",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {quiz.totalPoints}
                      </td>
                      <td className={cn(
                        "py-2 px-2",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {new Date(quiz.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/')}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-colors",
              theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            Back to Quiz
          </button>
        </div>
      </div>
    </div>
  );
}