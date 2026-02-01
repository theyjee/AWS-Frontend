'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  Filter,
  Target,
  BookOpen
} from 'lucide-react';

interface UserRanking {
  _id: string;
  name: string;
  email: string;
  class?: string;
  totalQuizzes: number;
  averageScore: number;
  totalPointsEarned: number;
  ranking: number;
}

interface RankingsResponse {
  rankings: UserRanking[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  classes: string[];
  sortBy: string;
}

interface ClassOption {
  _id: string;
  classId: string;
  name: string;
}

export default function RankingsPage() {
  const [rankingsData, setRankingsData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [sortBy, setSortBy] = useState<string>('totalPoints');

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchRankings = async (page = 1, classFilter = 'all', sortFilter = 'totalPoints') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const classParam = classFilter !== 'all' ? `&class=${classFilter}` : '';
      const sortParam = `&sortBy=${sortFilter}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rankings?page=${page}&limit=15${classParam}${sortParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }

      const data = await response.json();
      setRankingsData(data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchRankings(currentPage, selectedClass, sortBy);
  }, [currentPage, selectedClass, sortBy]);

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="flex items-center justify-center w-6 h-6 bg-slate-200 text-slate-600 text-sm font-bold rounded-full">{position}</span>;
    }
  };

  const getRankingBadgeColor = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900';
    if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900';
    if (position === 3) return 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900';
    if (position <= 10) return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700';
    return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600';
  };

  const formatClassLabel = (userClass: string | null | undefined) => {
    if (!userClass) return 'No Class';
    return userClass.replace('class-', 'Class ').toUpperCase();
  };

  if (loading && !rankingsData) {
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
      <div className="p-6">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-xl p-3">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Student Rankings</h1>
                <p className="text-slate-300 text-lg">Leaderboard showcasing top performers across all classes</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{rankingsData?.totalUsers || 0} Total Students</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{rankingsData?.classes?.length || 0} Classes</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{selectedClass === 'all' ? 'Overall' : formatClassLabel(selectedClass)} Ranking</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">Top Performers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Rankings</h3>
          </div>
          <div className="space-y-4">
            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Filter</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
              >
                <option value="all">All Classes (Overall Ranking)</option>
                {classes.map((classItem) => (
                  <option key={classItem.classId} value={classItem.classId}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Sort Rankings By</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSortBy('totalPoints');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sortBy === 'totalPoints'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Total Points
                </button>
                <button
                  onClick={() => {
                    setSortBy('averageScore');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sortBy === 'averageScore'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Average Score
                </button>
                <button
                  onClick={() => {
                    setSortBy('totalQuizzes');
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sortBy === 'totalQuizzes'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Total Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Leaderboard</h3>
                <p className="text-gray-600 mt-1">
                  {selectedClass === 'all'
                    ? `Top performers across all classes • Sorted by ${
                        sortBy === 'totalPoints' ? 'Total Points' :
                        sortBy === 'averageScore' ? 'Average Score' : 'Total Quizzes'
                      } • Page ${rankingsData?.currentPage || 0} of ${rankingsData?.totalPages || 0}`
                    : `${formatClassLabel(selectedClass)} rankings • Sorted by ${
                        sortBy === 'totalPoints' ? 'Total Points' :
                        sortBy === 'averageScore' ? 'Average Score' : 'Total Quizzes'
                      } • Page ${rankingsData?.currentPage || 0} of ${rankingsData?.totalPages || 0}`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Quizzes
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankingsData?.rankings.map((student) => (
                  <tr key={student._id} className={`hover:bg-slate-50 transition-colors duration-200 ${
                    student.ranking <= 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''
                  }`}>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getRankingIcon(student.ranking)}
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getRankingBadgeColor(student.ranking)}`}>
                          #{student.ranking}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                            <span className="text-sm font-bold text-white">
                              {student.name ? student.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() : 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/admin/users/${student._id}`}
                            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 block"
                          >
                            {student.name || 'Unknown User'}
                          </Link>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {formatClassLabel(student.class)}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Target className={`h-4 w-4 ${
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
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{student.totalQuizzes}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        <span className="font-bold text-lg text-indigo-600">{student.totalPointsEarned}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination */}
          {rankingsData && rankingsData.totalPages > 1 && (
            <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 font-medium">
                  Page {rankingsData.currentPage} of {rankingsData.totalPages}
                  <span className="ml-2 text-slate-400">
                    ({rankingsData.totalUsers} total students)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!rankingsData.hasPrevPage}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, rankingsData.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(rankingsData.totalPages - 4, rankingsData.currentPage - 2)) + i;
                      if (pageNum > rankingsData.totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            pageNum === rankingsData.currentPage
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!rankingsData.hasNextPage}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
