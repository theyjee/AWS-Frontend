'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { Plus, Edit2, Trash2, GraduationCap, Users as UsersIcon } from 'lucide-react';

interface Class {
  _id: string;
  classId: string;
  name: string;
  description: string;
  totalStudents: number;
  studentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ClassesManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    classNumber: '',
    description: ''
  });

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const resetForm = () => {
    setFormData({
      classNumber: '',
      description: ''
    });
  };

  const handleAddClass = async () => {
    if (!formData.classNumber || isNaN(parseInt(formData.classNumber))) {
      alert('Please enter a valid class number');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const classNumber = parseInt(formData.classNumber);
      const payload = {
        classNumber: classNumber,
        description: formData.description
      };

      console.log('Sending class creation request:', payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Class created successfully:', result);
        setShowAddModal(false);
        resetForm();
        fetchClasses();
        alert(`Class ${classNumber} created successfully!`);
      } else {
        const error = await response.json();
        console.error('Class creation failed:', error);
        alert(`Failed to create Class ${classNumber}: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error adding class:', error);
      alert(`Network error: Failed to create Class ${formData.classNumber}. Please check your connection and try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClass = async () => {
    if (!editingClass) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes/${editingClass._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingClass(null);
        resetForm();
        fetchClasses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to edit class');
      }
    } catch (error) {
      console.error('Error editing class:', error);
      alert('Failed to edit class');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async (classItem: Class) => {
    const confirmMessage = classItem.studentCount && classItem.studentCount > 0
      ? `This class has ${classItem.studentCount} student(s) assigned. Deleting it will unassign all students. Are you sure?`
      : 'Are you sure you want to delete this class?';

    if (!confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes/${classItem._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchClasses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    }
  };

  const openEditModal = (classItem: Class) => {
    setEditingClass(classItem);
    // Extract class number from name (e.g., "CLASS 1" -> "1")
    const classNumber = classItem.name.replace(/^(CLASS|Class)\s+/i, '');
    setFormData({
      classNumber: classNumber,
      description: classItem.description
    });
    setShowEditModal(true);
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
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Classes Management</h1>
                <p className="text-slate-300 text-lg">Manage AWS training classes and student cohorts</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{classes.length} Total Classes</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)} Students</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Class</span>
            </button>
          </div>
        </div>

        {/* Classes Table */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Class Directory</h3>
                <p className="text-gray-600 mt-1">
                  {classes.length} total classes available for student enrollment
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.map((classItem) => (
                  <tr key={classItem._id} className="hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-2">
                          <GraduationCap className="h-5 w-5 text-indigo-600" />
                        </div>
                        <Link
                          href={`/admin/classes/${classItem.classId}`}
                          className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200"
                        >
                          {classItem.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm text-gray-600 max-w-xs truncate font-medium">
                        {classItem.description || 'No description available'}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <UsersIcon className="h-4 w-4 text-slate-400" />
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                          (classItem.studentCount || 0) > 0
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {classItem.studentCount || 0} students
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(classItem)}
                          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                          title="Edit class"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(classItem)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete class"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {classes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-full p-4">
                          <GraduationCap className="h-12 w-12 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-600 mb-1">No Classes Yet</h3>
                          <p className="text-slate-500">Create your first class to get started with student management.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Class Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Class</h3>
                <ClassForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleAddClass}
                  onCancel={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  saving={saving}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Class Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Class</h3>
                <ClassForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleEditClass}
                  onCancel={() => {
                    setShowEditModal(false);
                    setEditingClass(null);
                    resetForm();
                  }}
                  saving={saving}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

interface ClassFormProps {
  formData: { classNumber: string; description: string };
  setFormData: (data: { classNumber: string; description: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
}

function ClassForm({ formData, setFormData, onSubmit, onCancel, saving }: ClassFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Number</label>
          <input
            type="number"
            min="1"
            value={formData.classNumber}
            onChange={(e) => setFormData({ ...formData, classNumber: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., 1, 2, 3..."
            required
          />
          <p className="mt-1 text-sm text-gray-500">This will create Class X where X is the number you enter</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Optional description for this class..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Class'}
          </button>
        </div>
      </div>
    </form>
  );
}
