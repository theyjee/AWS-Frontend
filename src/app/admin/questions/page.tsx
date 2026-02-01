'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Question } from '@/types/question';
import { Plus, Edit2, Trash2, Filter, Database } from 'lucide-react';

interface QuestionsResponse {
  questions: Question[];
  services: string[];
  totalQuestions: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface QuestionFormData {
  service: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuestionsManagement() {
  const [questionsData, setQuestionsData] = useState<QuestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [availableServices, setAvailableServices] = useState<{ name: string; questions: number }[]>([]);

  const [formData, setFormData] = useState<QuestionFormData>({
    service: '',
    question: '',
    choices: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const fetchServices = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const services: { name: string; questions: number }[] = await response.json();

      // Filter out 'all' and store services with question counts
      const serviceData = services.filter((service) => service.name !== 'all');

      setAvailableServices(serviceData);
    } catch (error) {
      console.error('Error fetching services:', error);
      setAvailableServices([]);
    }
  };

  const fetchQuestions = async (page = 1, service = 'all') => {
    try {
      const token = localStorage.getItem('adminToken');
      const serviceParam = service !== 'all' ? `&service=${service}` : '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/questions?page=${page}&limit=10${serviceParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestionsData(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchQuestions(currentPage, selectedService);
  }, [currentPage, selectedService]);

  const resetForm = () => {
    setFormData({
      service: '',
      question: '',
      choices: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  const handleAddQuestion = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchQuestions(currentPage, selectedService);
      } else {
        console.error('Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingQuestion(null);
        resetForm();
        fetchQuestions(currentPage, selectedService);
      } else {
        console.error('Failed to edit question');
      }
    } catch (error) {
      console.error('Error editing question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchQuestions(currentPage, selectedService);
      } else {
        console.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      service: question.service,
      question: question.question,
      choices: [...question.choices],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
    setShowEditModal(true);
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData({ ...formData, choices: newChoices });
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
                <Database className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Questions Management</h1>
                <p className="text-slate-300 text-lg">Manage and organize quiz questions across all AWS services</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{questionsData?.totalQuestions || 0} Total Questions</span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-sm font-medium">{questionsData?.services.length || 0} Services</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Question</span>
            </button>
          </div>
        </div>

        {/* Modern Service Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Questions</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setSelectedService('all');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedService === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>All Services</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                selectedService === 'all'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {questionsData?.totalQuestions || 0}
              </span>
            </button>
            {availableServices.map((service) => (
              <button
                key={service.name}
                onClick={() => {
                  setSelectedService(service.name);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedService === service.name
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{service.name}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  selectedService === service.name
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {service.questions}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Questions Database</h3>
                <p className="text-gray-600 mt-1">
                  {selectedService === 'all'
                    ? `Showing all ${questionsData?.totalQuestions || 0} questions`
                    : `Showing ${questionsData?.questions.length || 0} questions for ${selectedService}`
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
                    Service
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Correct Answer
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questionsData?.questions.map((question) => (
                  <tr key={question._id} className="hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                        {question.service}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm text-gray-900 max-w-md break-words font-medium leading-relaxed">
                        {question.question}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-200">
                        <span className="font-medium mr-1">{String.fromCharCode(65 + question.correctAnswer)}.</span>
                        {question.choices[question.correctAnswer]}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(question)}
                          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                          title="Edit question"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination */}
          {questionsData && questionsData.totalPages > 1 && (
            <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 font-medium">
                  Page {questionsData.currentPage} of {questionsData.totalPages}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!questionsData.hasPrevPage}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, questionsData.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(questionsData.totalPages - 4, questionsData.currentPage - 2)) + i;
                      if (pageNum > questionsData.totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            pageNum === questionsData.currentPage
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
                    disabled={!questionsData.hasNextPage}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Question Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Question</h3>
                <QuestionForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleAddQuestion}
                  onCancel={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  saving={saving}
                  handleChoiceChange={handleChoiceChange}
                  availableServices={availableServices}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Question Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Question</h3>
                <QuestionForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleEditQuestion}
                  onCancel={() => {
                    setShowEditModal(false);
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  saving={saving}
                  handleChoiceChange={handleChoiceChange}
                  availableServices={availableServices}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

interface QuestionFormProps {
  formData: QuestionFormData;
  setFormData: (data: QuestionFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  handleChoiceChange: (index: number, value: string) => void;
  availableServices: { name: string; questions: number }[];
}

function QuestionForm({ formData, setFormData, onSubmit, onCancel, saving, handleChoiceChange, availableServices }: QuestionFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Service</label>
          <input
            type="text"
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            placeholder="Enter AWS service name (e.g., EC2, S3, Lambda)"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          {availableServices.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Existing services:</p>
              <div className="flex flex-wrap gap-1">
                {availableServices.slice(0, 6).map((service) => (
                  <button
                    key={service.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, service: service.name })}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                  >
                    {service.name}
                  </button>
                ))}
                {availableServices.length > 6 && (
                  <span className="text-xs text-gray-400 px-2 py-1">
                    +{availableServices.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Question</label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Answer Choices</label>
          {formData.choices.map((choice, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={formData.correctAnswer === index}
                onChange={() => setFormData({ ...formData, correctAnswer: index })}
                className="mr-2"
              />
              <span className="mr-2 text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
              <input
                type="text"
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Explanation</label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
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
            {saving ? 'Saving...' : 'Save Question'}
          </button>
        </div>
      </div>
    </form>
  );
}
