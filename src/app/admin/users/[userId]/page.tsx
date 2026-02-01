'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  ArrowLeft,
  ChevronRight,
  Activity,
  Calendar,
  CheckCircle,
  FileText,
  Star
} from 'lucide-react';

interface UserStats {
  user: {
    _id: string;
    name: string;
    email: string;
    totalQuizzes: number;
    averageScore: number;
  };
  serviceStats: {
    [service: string]: {
      totalQuizzes: number;
      totalQuestions: number;
      totalCorrect: number;
      totalPoints: number;
      maxPossiblePoints: number;
      averageScore: number;
      bestScore: number;
    };
  };
  serviceHistory: {
    [service: string]: Array<{
      date: string;
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      timeTaken: number;
    }>;
  };
  recentQuizzes: Array<{
    _id: string;
    service: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    completedAt: string;
    isPartial?: boolean;
  }>;
}

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user statistics');
        }

        const data = await response.json();
        setUserStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  const getServiceColor = (serviceName: string) => {
    if (!serviceName || serviceName.length === 0) {
      return 'gray'; // Default color for missing service
    }

    const palette = ['blue', 'green', 'purple', 'yellow', 'red', 'indigo', 'pink', 'orange', 'teal'];
    let hash = 0;
    for (let i = 0; i < serviceName.length; i++) {
      hash = (hash << 5) - hash + serviceName.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % palette.length;
    return palette[idx];
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-600 text-xl mb-4">Error loading user statistics</div>
          <p className="text-gray-600">{error}</p>
          <div className="mt-6">
            <Link
              href="/admin/users"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              ← Back to Users
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!userStats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-gray-600 text-xl mb-4">User not found</div>
          <div className="mt-6">
            <Link
              href="/admin/users"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              ← Back to Users
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-xl p-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Link
                    href="/admin/users"
                    className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Users</span>
                  </Link>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{userStats.user.name || 'Unknown User'}</span>
                </div>
                <h1 className="text-3xl font-bold mb-1">{userStats.user.name || 'Unknown User'}</h1>
                <p className="text-slate-300 text-lg">{userStats.user.email}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{userStats.user.totalQuizzes} Quizzes</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{userStats.user.averageScore}% Avg Score</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{Object.keys(userStats.serviceStats).length} Services</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Star className={`h-4 w-4 ${
                      userStats.user.averageScore >= 80 ? 'text-yellow-400' :
                      userStats.user.averageScore >= 60 ? 'text-amber-400' : 'text-slate-300'
                    }`} />
                    <span className="text-sm font-medium">Performance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl p-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{userStats.user.averageScore}%</div>
                <div className="text-sm text-slate-600 font-medium">Average Score</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${
                userStats.user.averageScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                userStats.user.averageScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`} style={{ width: `${userStats.user.averageScore}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl p-3">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{userStats.user.totalQuizzes}</div>
                <div className="text-sm text-slate-600 font-medium">Total Quizzes</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl p-3">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">
                  {Object.keys(userStats.serviceStats).length}
                </div>
                <div className="text-sm text-slate-600 font-medium">Services Practiced</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-3">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">
                  {userStats.recentQuizzes.length > 0
                    ? Math.round(userStats.recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / userStats.recentQuizzes.length)
                    : 0}%
                </div>
                <div className="text-sm text-slate-600 font-medium">Recent Average</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${
                (userStats.recentQuizzes.length > 0
                  ? Math.round(userStats.recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / userStats.recentQuizzes.length)
                  : 0) >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                (userStats.recentQuizzes.length > 0
                  ? Math.round(userStats.recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / userStats.recentQuizzes.length)
                  : 0) >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`} style={{ width: `${userStats.recentQuizzes.length > 0 ? Math.round(userStats.recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / userStats.recentQuizzes.length) : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Modern Service Performance */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="h-6 w-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-900">Service Performance Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(userStats.serviceStats).map(([service, stats]) => (
              <div key={service} className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`bg-gradient-to-br from-${getServiceColor(service)}-100 to-${getServiceColor(service)}-200 rounded-xl p-3`}>
                      <Target className={`h-5 w-5 text-${getServiceColor(service)}-600`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{service}</h3>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border bg-${getServiceColor(service)}-50 text-${getServiceColor(service)}-700 border-${getServiceColor(service)}-200`}>
                    <BookOpen className="h-3 w-3 mr-1" />
                    {stats.totalQuizzes} quizzes
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Average Score</span>
                    <span className={`text-lg font-bold ${
                      stats.averageScore >= 80 ? 'text-green-600' :
                      stats.averageScore >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {stats.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Best Score</span>
                    <span className="text-lg font-bold text-green-600">{stats.bestScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Questions Answered</span>
                    <span className="text-lg font-bold text-slate-900">{stats.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Correct Answers</span>
                    <span className="text-lg font-bold text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {stats.totalCorrect}
                    </span>
                  </div>
                </div>

                <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    stats.averageScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    stats.averageScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`} style={{ width: `${stats.averageScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Quiz History */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="h-6 w-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-900">Recent Quiz History</h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
              {userStats.recentQuizzes.length} quizzes
            </span>
          </div>
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userStats.recentQuizzes.map((quiz) => (
                    <tr key={quiz._id} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`bg-gradient-to-br from-${getServiceColor(quiz.service)}-100 to-${getServiceColor(quiz.service)}-200 rounded-lg p-2`}>
                            <FileText className={`h-4 w-4 text-${getServiceColor(quiz.service)}-600`} />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-${getServiceColor(quiz.service)}-50 text-${getServiceColor(quiz.service)}-700 border border-${getServiceColor(quiz.service)}-200`}>
                              {quiz.service}
                            </span>
                            {quiz.isPartial && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                                Partial
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Award className={`h-5 w-5 ${
                            quiz.score >= 80 ? 'text-green-600' :
                            quiz.score >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`} />
                          <span className={`font-bold text-lg ${
                            quiz.score >= 80 ? 'text-green-600' :
                            quiz.score >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {quiz.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-slate-900">{quiz.correctAnswers}</span>
                          <span className="text-slate-400">/</span>
                          <span className="font-medium text-slate-600">{quiz.totalQuestions}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">
                            {quiz.completedAt
                              ? new Date(quiz.completedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'No date'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {userStats.recentQuizzes.length === 0 && (
            <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-16 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-full p-6">
                  <Calendar className="h-12 w-12 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No Quiz History Yet</h3>
                  <p className="text-slate-500 max-w-md">This user hasn&apos;t taken any quizzes yet. Quiz attempts will appear here once they start taking quizzes.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
