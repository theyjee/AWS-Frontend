'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { User } from '@/types/user';
import Link from 'next/link';
import { Users, Edit2, Settings, Filter } from 'lucide-react';

interface UsersResponse {
  users: User[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function UsersManagement() {
  const [classes, setClasses] = useState<{ _id: string; classId: string; name: string }[]>([]);
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsersData(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

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
      // Set empty array if API fails - no predefined classes
      setClasses([]);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    fetchClasses();
  }, [currentPage]);

  const handleClassChange = async (userId: string, newClassId: string | null) => {
    setUpdatingUser(userId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/class`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ class: newClassId }),
      });

      if (response.ok) {
        // Update the local state immediately instead of refetching
        if (usersData) {
          setUsersData({
            ...usersData,
            users: usersData.users.map(user =>
              user._id === userId
                ? { ...user, class: newClassId }
                : user
            )
          });
        }
      } else {
        console.error('Failed to update user class');
      }
    } catch (error) {
      console.error('Error updating user class:', error);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Filter users based on selected class
  const getFilteredUsers = () => {
    if (!usersData?.users) return [];
    if (selectedClassFilter === 'all') return usersData.users;

    if (selectedClassFilter === 'no-class') {
      return usersData.users.filter(user => !user.class);
    }

    return usersData.users.filter(user => {
      if (typeof user.class === 'string') {
        return user.class === selectedClassFilter;
      }
      return false;
    });
  };

  const getClassBadgeColor = (userClass: string | { _id?: string; name?: string } | null | undefined) => {
    if (!userClass) return 'bg-gray-100 text-gray-800';

    // Simple color rotation based on class ID
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800'
    ];

    // Use a simple hash of the class name or ID for consistent coloring
    let hash = 0;

    if (typeof userClass === 'string') {
      // userClass is an ObjectId string, find the class object
      const classObj = classes.find(c => c._id === userClass);
      if (classObj && classObj.name) {
        hash = classObj.name.charCodeAt(0);
      } else {
        hash = userClass.slice(-1).charCodeAt(0);
      }
    } else if (userClass._id && typeof userClass._id === 'string') {
      hash = userClass._id.slice(-1).charCodeAt(0);
    } else if (userClass.name && typeof userClass.name === 'string') {
      hash = userClass.name.charCodeAt(0);
    } else {
      // Fallback for any other case
      hash = Math.floor(Math.random() * 100);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const formatClassLabel = (userClass: string | { _id?: string; name?: string } | null | undefined) => {
    if (!userClass) return 'No Class';

    // If userClass is a string (class ID like 'class-1'), convert to display name
    if (typeof userClass === 'string') {
      return userClass.replace('class-', 'Class ').toUpperCase();
    }

    // If userClass is an object with name property
    if (userClass && userClass.name) return userClass.name;

    return 'Unknown Class';
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

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-xl p-3">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Users Management</h1>
                <p className="text-slate-300 text-lg">Manage user accounts and assign them to classes</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{usersData?.totalUsers || 0} Total Users</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{classes.length} Classes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Class Assignment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Filter Users</h3>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600 font-medium">
                Showing {getFilteredUsers().length} of {usersData?.totalUsers || 0} users
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Class:</label>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                >
                  <option value="all">All Classes</option>
                  <option value="no-class">No Class Assigned</option>
                  {classes.map((classItem) => (
                    <option key={classItem.classId} value={classItem.classId}>
                      {classItem.name || 'Unnamed Class'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">User Directory</h3>
                <p className="text-gray-600 mt-1">
                  {getFilteredUsers().length} {selectedClassFilter === 'all' ? 'total' : 'filtered'} users {selectedClassFilter === 'all' ? 'registered' : 'shown'}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredUsers().map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <Link
                        href={`/admin/users/${user._id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200"
                      >
                        {user.name || 'Unknown User'}
                      </Link>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {user.email}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getClassBadgeColor(user.class)}`}>
                        {formatClassLabel(user.class)}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Quizzes:</span>
                          <span className="text-indigo-600 font-semibold">{user.totalQuizzes}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Points:</span>
                          <span className="text-green-600 font-semibold">{user.totalPointsEarned}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Avg:</span>
                          <span className="text-blue-600 font-semibold">{user.averageScore}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <select
                          value={user.class || ''}
                          onChange={(e) => handleClassChange(user._id, e.target.value || null)}
                          disabled={updatingUser === user._id}
                          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 bg-white shadow-sm"
                        >
                          <option value="">No Class</option>
                          {classes && classes.length > 0 && classes.map((classItem) => (
                            <option key={classItem.classId} value={classItem.classId}>
                              {classItem.name || 'Unnamed Class'}
                            </option>
                          ))}
                          {(!classes || classes.length === 0) && (
                            <option disabled>No classes available</option>
                          )}
                        </select>
                        {updatingUser === user._id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        )}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {/* Could add view/edit functionality */}}
                            className="p-1.5 text-slate-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors duration-200"
                            title="View user details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 font-medium">
                  Page {usersData.currentPage} of {usersData.totalPages}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!usersData.hasPrevPage}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, usersData.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(usersData.totalPages - 4, usersData.currentPage - 2)) + i;
                      if (pageNum > usersData.totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            pageNum === usersData.currentPage
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
                    disabled={!usersData.hasNextPage}
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
