'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
  ArrowLeft,
  Award,
  Target,
  Activity,
  User,
  ChevronRight
} from 'lucide-react';

interface ClassDetails {
  class: {
    _id: string;
    classId: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  statistics: {
    totalStudents: number;
    totalQuizzes: number;
    averageClassScore: number;
    serviceStats: {
      [service: string]: {
        totalStudents: number;
        totalQuizzes: number;
        averageScore: number;
      };
    };
  };
  students: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    totalQuizzes: number;
    averageScore: number;
    createdAt: string;
    serviceStats: {
      [service: string]: {
        totalQuizzes: number;
        averageScore: number;
        bestScore: number;
      };
    };
  }>;
}

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes/${classId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch class details');
        }

        const data = await response.json();
        setClassDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const getServiceColor = (serviceName: string) => {
    if (!serviceName || serviceName.length === 0) {
      return 'gray';
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
          <div className="text-red-600 text-xl mb-4">Error loading class details</div>
          <p className="text-gray-600">{error}</p>
          <div className="mt-6">
            <Link
              href="/admin/classes"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              ← Back to Classes
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!classDetails) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-gray-600 text-xl mb-4">Class not found</div>
          <div className="mt-6">
            <Link
              href="/admin/classes"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              ← Back to Classes
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
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Link
                    href="/admin/classes"
                    className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Classes</span>
                  </Link>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{classDetails.class.name}</span>
                </div>
                <h1 className="text-3xl font-bold mb-1">{classDetails.class.name}</h1>
                <p className="text-slate-300 text-lg">{classDetails.class.description || 'Class description not available'}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{classDetails.statistics.totalStudents} Students</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{classDetails.statistics.totalQuizzes} Quizzes</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{classDetails.statistics.averageClassScore}% Avg Score</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Class Performance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-3">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{classDetails.statistics.totalStudents}</div>
                <div className="text-sm text-slate-600 font-medium">Students</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl p-3">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{classDetails.statistics.totalQuizzes}</div>
                <div className="text-sm text-slate-600 font-medium">Total Quizzes</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl p-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{classDetails.statistics.averageClassScore}%</div>
                <div className="text-sm text-slate-600 font-medium">Class Average</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${
                classDetails.statistics.averageClassScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                classDetails.statistics.averageClassScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`} style={{ width: `${classDetails.statistics.averageClassScore}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-3">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">
                  {Object.keys(classDetails.statistics.serviceStats).length}
                </div>
                <div className="text-sm text-slate-600 font-medium">Services Practiced</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full" style={{ width: '100%' }}></div>
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
            {Object.entries(classDetails.statistics.serviceStats).map(([service, stats]) => (
              <div key={service} className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`bg-gradient-to-br from-${getServiceColor(service)}-100 to-${getServiceColor(service)}-200 rounded-xl p-3`}>
                      <Target className={`h-5 w-5 text-${getServiceColor(service)}-600`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{service}</h3>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border bg-${getServiceColor(service)}-50 text-${getServiceColor(service)}-700 border-${getServiceColor(service)}-200`}>
                    <Users className="h-3 w-3 mr-1" />
                    {stats.totalStudents} students
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Total Quizzes</span>
                    <span className="text-lg font-bold text-slate-900">{stats.totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Average Score</span>
                    <span className={`text-lg font-bold ${
                      stats.averageScore >= 80 ? 'text-green-600' :
                      stats.averageScore >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {stats.averageScore}%
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

        {/* Modern Students Directory */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <User className="h-6 w-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-900">Students in {classDetails.class.name}</h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
              {classDetails.students.length} enrolled
            </span>
          </div>
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Quizzes Taken
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Services Count
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classDetails.students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                              <span className="text-sm font-bold text-white">
                                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {student.email}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">{student.totalQuizzes}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Award className={`h-4 w-4 ${
                            student.averageScore >= 80 ? 'text-green-600' :
                            student.averageScore >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`} />
                          <span className={`font-bold text-lg ${
                            student.averageScore >= 80 ? 'text-green-600' :
                            student.averageScore >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {student.averageScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                            Object.keys(student.serviceStats).length > 0
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            <Target className="h-3 w-3 mr-1" />
                            {Object.keys(student.serviceStats).length}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/users/${student._id}`}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
                        >
                          <User className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {classDetails.students.length === 0 && (
            <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-16 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-full p-6">
                  <Users className="h-12 w-12 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No Students Enrolled Yet</h3>
                  <p className="text-slate-500 max-w-md">Students can be assigned to this class from the Users management page. Start by assigning students to begin tracking their performance.</p>
                </div>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
