'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp } from 'lucide-react';

interface Question {
  _id: string;
  service: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  createdAt: string;
}

interface ClassData {
  _id: string;
  classId: string;
  name: string;
  description: string;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  totalQuizAttempts: number;
  averageScore: number;
  servicePopularity?: {
    mostPopular: string;
    attempts: number;
    breakdown: { service: string; attempts: number }[];
  };
  serviceStats?: {
    totalServices: number;
    questionsPerService: { [key: string]: number };
  };
  classStats?: {
    totalClasses: number;
    totalStudentsInClasses: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      // Fetch main dashboard stats
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let statsData: DashboardStats;
      if (statsResponse.ok) {
        statsData = await statsResponse.json();
      } else {
        // Fallback to old method
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?page=1&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const usersData = await usersResponse.json();

        const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/questions?page=1&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const questionsData = await questionsResponse.json();

        statsData = {
          totalUsers: usersData.totalUsers || 0,
          totalQuestions: questionsData.totalQuestions || 0,
          totalQuizAttempts: 0,
          averageScore: 0,
        };
      }

      // Fetch additional data for enhanced dashboard
      try {
        // Get service statistics from questions API
        const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/questions?page=1&limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const questionsData = await questionsResponse.json();

        // Get class statistics
        const classesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const classesData = await classesResponse.json();

        // Calculate service stats from real question data
        const serviceCounts: { [key: string]: number } = {};
        questionsData.questions?.forEach((q: Question) => {
          serviceCounts[q.service] = (serviceCounts[q.service] || 0) + 1;
        });

        const services = Object.keys(serviceCounts);

        // Enhanced stats object with real data
        const enhancedStats: DashboardStats = {
          ...statsData,
          serviceStats: {
            totalServices: questionsData.services?.length || services.length,
            questionsPerService: serviceCounts,
          },
          classStats: {
            totalClasses: Array.isArray(classesData) ? classesData.length : 0,
            totalStudentsInClasses: Array.isArray(classesData) ? classesData.reduce((sum: number, cls: ClassData) =>
              sum + (cls.studentCount || 0), 0) : 0,
          },
        };

        setStats(enhancedStats);
      } catch (additionalDataError) {
        console.warn('Could not fetch additional dashboard data:', additionalDataError);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 mb-12 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-xl p-3">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
                <p className="text-slate-300 text-lg">Comprehensive overview of your AWS Quiz platform performance and management tools</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{stats?.totalUsers || 0} Users</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{stats?.totalQuestions || 0} Questions</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{stats?.serviceStats?.totalServices || 0} Services</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Avg Score: {stats?.averageScore || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Total Users Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Users
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">{stats?.totalUsers || 0}</div>
              <div className="text-slate-600 font-medium">Total Registered</div>
              <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>

          {/* Total Questions Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Questions
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">{stats?.totalQuestions || 0}</div>
              <div className="text-slate-600 font-medium">Total Available</div>
              <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>

          {/* Quiz Attempts Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Attempts
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">{stats?.totalQuizAttempts || 0}</div>
              <div className="text-slate-600 font-medium">Total Quizzes Taken</div>
              <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Score
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">{stats?.averageScore || 0}%</div>
              <div className="text-slate-600 font-medium">Average Performance</div>
              <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (stats?.averageScore || 0) >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    (stats?.averageScore || 0) >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${stats?.averageScore || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Service Analytics */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Service Popularity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600">Total Services Available</div>
                  <div className="text-2xl font-bold text-slate-900">{stats?.serviceStats?.totalServices || 0}</div>
                </div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600 mb-2">Most Played Service</div>
                <div className="text-lg font-bold text-slate-900">
                  {stats?.servicePopularity?.mostPopular || 'None'}
                  {stats?.servicePopularity?.mostPopular !== 'None' && (
                    <span className="text-sm font-normal text-slate-500 ml-2">
                      ({stats?.servicePopularity?.attempts} attempts)
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600 mb-2">Play Frequency</div>
                <div className="text-sm text-slate-600 space-y-1">
                  {stats?.servicePopularity?.breakdown && stats.servicePopularity.breakdown.length > 0 ? (
                    stats.servicePopularity.breakdown.slice(0, 3).map((item) => (
                      <div key={item.service} className="flex justify-between">
                        <span>{item.service}</span>
                        <span className="font-medium">{item.attempts} plays</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic">No quiz attempts yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Class Management */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Class Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600">Total Classes</div>
                  <div className="text-2xl font-bold text-slate-900">{stats?.classStats?.totalClasses || 0}</div>
                </div>
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600">Students in Classes</div>
                  <div className="text-2xl font-bold text-slate-900">{stats?.classStats?.totalStudentsInClasses || 0}</div>
                </div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="text-sm font-medium text-slate-600 mb-2">Quick Actions</div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push('/admin/classes')}
                    className="text-left px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium text-slate-700"
                  >
                    Manage Classes
                  </button>
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="text-left px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium text-slate-700"
                  >
                    View Students
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => router.push('/admin/questions')}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-6 rounded-xl font-semibold text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="text-lg mb-2">Add New Question</div>
              <div className="text-sm opacity-90">Create quiz content</div>
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-6 rounded-xl font-semibold text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="text-lg mb-2">Manage Users</div>
              <div className="text-sm opacity-90">View and organize students</div>
            </button>
            <button
              onClick={() => router.push('/admin/classes')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl font-semibold text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="text-lg mb-2">Class Management</div>
              <div className="text-sm opacity-90">Organize student groups</div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
