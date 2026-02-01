'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import InteractiveQuestionCard from './InteractiveQuestionCard';
import { ServiceSelectionHeader } from './ServiceSelectionHeader';
import { Question } from '@/types/question';
import { User, QuizAnswer } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

interface QuizAppProps {
  userData?: User | null;
}

export default function QuizApp({}: QuizAppProps = {}) {
  const { user, getIdToken } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [savingResults, setSavingResults] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showServiceSelection, setShowServiceSelection] = useState(true);
  const [showMainOptions, setShowMainOptions] = useState(true); // New state for main options screen
  const [isFullExam, setIsFullExam] = useState(false); // Track if full exam mode
  const [questionLimit, setQuestionLimit] = useState<number | undefined>(undefined); // Track question limit
  const [services, setServices] = useState<{name: string; questions: number; color?: string; icon?: string; description?: string}[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // Default to list view
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<{questionId: string, selectedAnswer: number, isCorrect: boolean} | null>(null);
  const [autoAdvanceMode, setAutoAdvanceMode] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const isManualFetchRef = useRef(false); // Track manual fetches to prevent useEffect interference
  const [sessionId, setSessionId] = useState<string>(''); // Track quiz session for auto-save

  const fetchQuestions = async (service?: string, limit?: number, isManual = false) => {
    try {
      if (isManual) {
        isManualFetchRef.current = true;
      }
      
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/questions`;
      const params = new URLSearchParams();
      
      if (service && service !== 'all') {
        params.append('service', service);
      }
      
      // Always append limit if provided, even for 'all' service
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
      
      if (isManual) {
        // Reset the ref after a short delay to allow state updates to settle
        setTimeout(() => {
          isManualFetchRef.current = false;
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (isManual) {
        isManualFetchRef.current = false;
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();

      // Filter out "all" service since we have a dedicated Full AWS Prep Exam button
      const filteredServices = data.filter((service: {name: string; questions: number}) => service.name !== 'all');

      // Add metadata for display
      const servicesWithMetadata = filteredServices.map((service: {name: string; questions: number}) => ({
        ...service,
        color: getServiceColor(service.name),
        icon: getServiceIcon(service.name),
        description: getServiceDescription(service.name)
      }));

      setServices(servicesWithMetadata);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
      setError('Failed to load services');
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const getServiceColor = (serviceName: string) => {
    if (!serviceName || serviceName.length === 0) {
      return 'gray'; // Default color for missing service
    }

    const palette = ['slate', 'emerald', 'amber', 'rose', 'cyan', 'violet', 'fuchsia', 'lime', 'sky'];
    let hash = 0;
    for (let i = 0; i < serviceName.length; i++) {
      hash = (hash << 5) - hash + serviceName.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % palette.length;
    return palette[idx];
  };


  const getServiceIcon = (serviceName: string) => {
    // Return modern SVG icons based on service
    const icons: Record<string, string> = {
      EC2: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"></path></svg>`,
      S3: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path></svg>`,
      VPC: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      Lambda: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`,
      DynamoDB: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`,
      RDS: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path></svg>`,
      CloudFront: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"></path></svg>`,
      Route53: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path></svg>`,
      IAM: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>`,
      CloudWatch: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`
    };
    return icons[serviceName] || `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7l-7 7-7-7m14 18l-7-7-7 7"></path></svg>`;
  };

  const getServiceDescription = (serviceName: string) => {
    return `${serviceName}`;
  };

  useEffect(() => {
    fetchServices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array since fetchServices is memoized

  useEffect(() => {
    // Skip if this is a manual fetch (like full exam) or if service is 'all'
    if (isManualFetchRef.current || !selectedService || isFullExam || selectedService === 'all') {
      return;
    }
    // Only auto-fetch for specific services, not for full exam (which is handled explicitly)
    fetchQuestions(selectedService, questionLimit);
  }, [selectedService, isFullExam, questionLimit]);

  useEffect(() => {
    if (questions.length > 0 && !quizStartTime) {
      setQuizStartTime(Date.now());
      // Generate a unique session ID for this quiz
      const newSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      setSessionId(newSessionId);
      setIsFinalized(false);
    }
  }, [questions, quizStartTime]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId && user && quizResults.length > 0 && !isFinalized) {
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/quiz-progress/${sessionId}/finalize`,
          new Blob([JSON.stringify({})], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, user, quizResults.length, isFinalized]);

  // Auto-save function to save individual question progress
  const autoSaveQuestionProgress = async (
    questionId: string,
    questionIndex: number,
    selectedAnswer: number,
    isCorrect: boolean
  ) => {
    if (!user || !sessionId || isFinalized) {
      return;
    }

    try {
      const token = await getIdToken();

      // NEXT_PUBLIC_API_URL already includes /api, so just append the route
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          service: selectedService || 'all',
          questionId,
          questionIndex,
          selectedAnswer,
          isCorrect
        }),
      });

      if (!response.ok) {
        console.error('Failed to auto-save question progress');
      } else {
        console.log('[QuizApp] Auto-save successful');
      }
    } catch (error) {
      console.error('Error auto-saving question progress:', error);
    }
  };

  const handleAnswerSelected = (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
    // Find the question index
    const questionIndex = questions.findIndex(q => q._id === questionId);

    // Auto-save the answer immediately
    autoSaveQuestionProgress(questionId, questionIndex, selectedAnswer, isCorrect);

    if (autoAdvanceMode) {
      // Auto-advance mode: immediately submit and move to next question
      const result: QuizResult = {
        questionId,
        selectedAnswer,
        isCorrect
      };

      setQuizResults(prev => {
        const existing = prev.find(r => r.questionId === questionId);
        if (existing) {
          return prev.map(r => r.questionId === questionId ? result : r);
        }
        return [...prev, result];
      });

      setAnsweredQuestions(prev => new Set([...prev, questionId]));

      // Move to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
        }, 5000); // 5 second delay to show the answer feedback
      }
    } else {
      // Default mode: show submit button
      setPendingAnswer({ questionId, selectedAnswer, isCorrect });
      setShowSubmitButton(true);
    }
  };

  const handleSubmitAnswer = () => {
    if (!pendingAnswer) return;

    // Find the question index
    const questionIndex = questions.findIndex(q => q._id === pendingAnswer.questionId);

    // Auto-save the answer immediately
    autoSaveQuestionProgress(
      pendingAnswer.questionId,
      questionIndex,
      pendingAnswer.selectedAnswer,
      pendingAnswer.isCorrect
    );

    const result: QuizResult = {
      questionId: pendingAnswer.questionId,
      selectedAnswer: pendingAnswer.selectedAnswer,
      isCorrect: pendingAnswer.isCorrect
    };

    setQuizResults(prev => {
      const existing = prev.find(r => r.questionId === pendingAnswer!.questionId);
      if (existing) {
        return prev.map(r => r.questionId === pendingAnswer!.questionId ? result : r);
      }
      return [...prev, result];
    });

    setAnsweredQuestions(prev => new Set([...prev, pendingAnswer!.questionId]));
    setShowSubmitButton(false);
    setPendingAnswer(null);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const correctAnswers = quizResults.filter(r => r.isCorrect).length;
  const totalAnswered = quizResults.length;
  const pointsPerQuestion = 5;
  const totalPoints = correctAnswers * pointsPerQuestion;
  const maxPossiblePoints = questions.length * pointsPerQuestion;
  const scorePercentage = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  const handleShowResults = async () => {
    if (!user || !quizStartTime) return;

    setSavingResults(true);

    try {
      const timeTaken = Math.round((Date.now() - quizStartTime) / 1000); // in seconds
      const correctAnswers = quizResults.filter(r => r.isCorrect).length;
      const totalQuestions = questions.length; // Always use total questions for final results
      const pointsPerQuestion = 5;
      const totalPoints = correctAnswers * pointsPerQuestion;
      const maxPossiblePoints = totalQuestions * pointsPerQuestion;
      const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

      const answers: QuizAnswer[] = quizResults.map(result => ({
        questionId: result.questionId,
        selectedAnswer: result.selectedAnswer,
        isCorrect: result.isCorrect,
        timeTaken: 0 // You could track individual question times if needed
      }));

      const quizResultPayload = {
        sessionId,
        service: selectedService || 'all', // Track which service was practiced
        totalQuestions,
        correctAnswers,
        score: scorePercentage, // Keep percentage for backward compatibility
        totalPoints,
        maxPossiblePoints,
        pointsPerQuestion,
        timeTaken,
        answers,
        isPartial: false // Always false since we only save complete quizzes now
      };

      // Get Firebase auth token
      const token = await getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizResultPayload),
      });

      if (!response.ok) {
        console.error('Failed to save quiz results');
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    } finally {
      setSavingResults(false);
      setShowResults(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizResults([]);
    setShowResults(false);
    setQuizStartTime(Date.now());
  };

  const handleServiceSelect = (service: string) => {
    setIsFullExam(false);
    setQuestionLimit(undefined); // Reset to default (20)
    setSelectedService(service);
    setShowServiceSelection(false);
    setShowMainOptions(false);
  };

  const handleFullExamSelect = async () => {
    // Set ref first to prevent any useEffect from running
    isManualFetchRef.current = true;
    
    setIsFullExam(true);
    setQuestionLimit(65);
    setShowServiceSelection(false);
    setShowMainOptions(false);
    
    // Fetch questions with isManual flag to prevent useEffect from interfering
    await fetchQuestions('all', 65, true);
    
    // Set selectedService after fetch completes
    setSelectedService('all');
  };

  const handleChooseServiceSelect = () => {
    setShowMainOptions(false);
    setShowServiceSelection(true);
  };

  const handleProfileSelect = () => {
    router.push('/profile');
  };

  const finalizeCurrentSession = async () => {
    if (!sessionId || !user || isFinalized) return;
    setIsFinalized(true);
    try {
      const token = await getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz-progress/${sessionId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.error('Failed to finalize quiz session');
      }
    } catch (error) {
      console.error('Error finalizing quiz session:', error);
    }
  };

  const handleBackToServices = async () => {
    await finalizeCurrentSession();
    setIsFinalized(false);
    setSessionId('');
    setSelectedService(null);
    setShowServiceSelection(true);
    setShowMainOptions(true);
    setIsFullExam(false);
    setQuestionLimit(undefined);
    setQuestions([]);
    setQuizResults([]);
    setShowResults(false);
    setQuizStartTime(null);
    setCurrentQuestionIndex(0);
    setAnsweredQuestions(new Set());
    setShowSubmitButton(false);
    setPendingAnswer(null);
    setAutoAdvanceMode(false);
  };


  if (servicesLoading && !selectedService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading services...</p>
        </div>
      </div>
    );
  }

  if (loading && selectedService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading {selectedService} questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading questions</div>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Make sure the backend server is running on port 3001
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionAnswered = currentQuestion ? answeredQuestions.has(currentQuestion._id) : false;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle Button */}
      <ThemeToggle />

      {/* Conditional Background Based on Theme */}
      {theme === 'dark' ? (
        /* Dark Mode Background */
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-3000"></div>

          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-purple-900/40 to-slate-900/80"></div>

          {/* Animated mesh pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              animation: 'backgroundShift 20s ease-in-out infinite'
            }}></div>
          </div>

          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-3000"></div>
        </div>
      ) : (
        /* Light Mode Background */
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Animated Grid Pattern - Full Screen */}
          <AnimatedGridPattern
            numSquares={80}
            maxOpacity={0.3}
            duration={3}
            className={cn(
              "absolute inset-0 h-full w-full fill-blue-500/20 stroke-blue-500/20",
            )}
          />

          {/* Subtle gradient orbs for light mode */}
          <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-200/30 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200/20 rounded-full filter blur-3xl"></div>
        </div>
      )}

      {/* Add custom animations to global CSS */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        @keyframes backgroundShift {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, 30px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto pt-6 sm:pt-8 pb-8 px-4 sm:px-6 lg:px-8">

        {/* Main Options Screen */}
        {showMainOptions && (
          <div className="mb-8 pt-12">
            <div className="text-center mb-12">
              <h1 className={cn(
                "text-4xl md:text-5xl font-bold mb-4",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                AWS Practice Platform
              </h1>
              <p className={cn(
                "text-lg md:text-xl",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              )}>
                Pick an option
              </p>
            </div>

            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
              {/* First Row: Two Main Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full AWS Prep Exam Option */}
                <button
                  onClick={handleFullExamSelect}
                  className={cn(
                  "group relative rounded-2xl p-8 text-left transition-all duration-300 overflow-hidden",
                  "hover:scale-[1.02] hover:shadow-2xl",
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-purple-600/20 via-purple-500/30 to-blue-600/20 border border-purple-400/50 hover:border-purple-300/70 hover:shadow-purple-500/30'
                    : 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-blue-500/20'
                )}
              >
                {/* Background decoration */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10'
                    : 'bg-gradient-to-br from-blue-100/50 to-purple-100/50'
                )} />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      theme === 'dark'
                        ? 'bg-purple-500/30 text-purple-200'
                        : 'bg-blue-500 text-white'
                    )}>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className={cn(
                      "text-2xl font-bold whitespace-nowrap",
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      Full AWS Prep Exam
                    </h2>
                  </div>
                  <p className={cn(
                    "text-base mb-4",
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    65 questions randomly selected from all AWS services. Perfect for comprehensive exam preparation.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-semibold",
                      theme === 'dark'
                        ? 'bg-purple-500/30 text-purple-200'
                        : 'bg-blue-100 text-blue-700'
                    )}>
                      65 Questions
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-semibold",
                      theme === 'dark'
                        ? 'bg-purple-500/30 text-purple-200'
                        : 'bg-blue-100 text-blue-700'
                    )}>
                      All Services
                    </span>
                  </div>
                </div>
                
                {/* Arrow icon */}
                <div className={cn(
                  "absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  theme === 'dark' ? 'text-purple-300' : 'text-blue-600'
                )}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>

              {/* Choose a Service Option */}
              <button
                onClick={handleChooseServiceSelect}
                className={cn(
                  "group relative rounded-2xl p-8 text-left transition-all duration-300 overflow-hidden",
                  "hover:scale-[1.02] hover:shadow-2xl",
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-600/20 via-blue-500/30 to-indigo-600/20 border border-blue-400/50 hover:border-blue-300/70 hover:shadow-blue-500/30'
                    : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-indigo-500/20'
                )}
              >
                {/* Background decoration */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10'
                    : 'bg-gradient-to-br from-indigo-100/50 to-blue-100/50'
                )} />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      theme === 'dark'
                        ? 'bg-blue-500/30 text-blue-200'
                        : 'bg-indigo-500 text-white'
                    )}>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l-7 7-7-7m14 18l-7-7-7 7" />
                      </svg>
                    </div>
                    <h2 className={cn(
                      "text-2xl font-bold",
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      Choose a Service
                    </h2>
                  </div>
                  <p className={cn(
                    "text-base mb-4",
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    Practice with questions from a specific AWS service. Focus on areas you want to improve.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-semibold",
                      theme === 'dark'
                        ? 'bg-blue-500/30 text-blue-200'
                        : 'bg-indigo-100 text-indigo-700'
                    )}>
                      20 Questions
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-semibold",
                      theme === 'dark'
                        ? 'bg-blue-500/30 text-blue-200'
                        : 'bg-indigo-100 text-indigo-700'
                    )}>
                      Service-Specific
                    </span>
                  </div>
                </div>
                
                {/* Arrow icon */}
                <div className={cn(
                  "absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  theme === 'dark' ? 'text-blue-300' : 'text-indigo-600'
                )}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
              </div>

              {/* Second Row: Profile Option (Centered) */}
              <div className="flex justify-center">
                <button
                  onClick={handleProfileSelect}
                  className={cn(
                    "group relative rounded-2xl p-8 text-left transition-all duration-300 overflow-hidden w-full max-w-md",
                    "hover:scale-[1.02] hover:shadow-2xl",
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-green-600/20 via-emerald-500/30 to-teal-600/20 border border-green-400/50 hover:border-green-300/70 hover:shadow-green-500/30'
                      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 hover:border-green-400 hover:shadow-green-500/20'
                  )}
                >
                  {/* Background decoration */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10'
                      : 'bg-gradient-to-br from-green-100/50 to-teal-100/50'
                  )} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center",
                        theme === 'dark'
                          ? 'bg-green-500/30 text-green-200'
                          : 'bg-green-500 text-white'
                      )}>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h2 className={cn(
                        "text-2xl font-bold",
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        Profile
                      </h2>
                    </div>
                    <p className={cn(
                      "text-base mb-4",
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      View your statistics, quiz history, and track your progress over time.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-semibold",
                        theme === 'dark'
                          ? 'bg-green-500/30 text-green-200'
                          : 'bg-green-100 text-green-700'
                      )}>
                        Your Stats
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-semibold",
                        theme === 'dark'
                          ? 'bg-green-500/30 text-green-200'
                          : 'bg-green-100 text-green-700'
                      )}>
                        Progress
                      </span>
                    </div>
                  </div>
                  
                  {/* Arrow icon */}
                  <div className={cn(
                    "absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    theme === 'dark' ? 'text-green-300' : 'text-green-600'
                  )}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Selection Screen */}
        {showServiceSelection && !showMainOptions && (
          <div className="mb-8 pt-0">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowServiceSelection(false);
                  setShowMainOptions(true);
                }}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  theme === 'dark'
                    ? 'text-gray-200 hover:text-white hover:bg-white/10 border border-white/20'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300'
                )}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Options
              </button>
            </div>
            <ServiceSelectionHeader />

            <div className="text-center">
              {/* View Toggle */}
              <div className="flex justify-center mt-0 mb-2">
                <div className={cn(
                  "rounded-lg p-1 flex border",
                  theme === 'dark'
                    ? 'bg-white/10 backdrop-blur-sm border-white/20'
                    : 'bg-gray-100 border-gray-200'
                )}>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-200 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      List View
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      viewMode === 'grid'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-200 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Grid View
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {servicesLoading ? (
              <div className="text-center py-12">
                <div className={cn(
                  "animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4",
                  theme === 'dark' ? 'border-purple-400' : 'border-blue-600'
                )}></div>
                <p className={cn(
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                )}>Loading services...</p>
              </div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="space-y-4 max-w-4xl mx-auto">
                {services.map((service, index) => (
                  <div
                    key={service.name}
                    className={cn(
                      "rounded-xl border transition-all duration-300 group cursor-pointer overflow-hidden service-list-item relative",
                      theme === 'dark'
                        ? 'bg-white/10 backdrop-blur-md border-white/20 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20'
                        : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10'
                    )}
                    onClick={() => handleServiceSelect(service.name)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-6">
                      {/* Service Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={cn(
                            "text-xl font-bold transition-colors duration-200 truncate",
                            theme === 'dark'
                              ? 'text-white group-hover:text-purple-300'
                              : 'text-gray-900 group-hover:text-blue-600'
                          )}>
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-3 ml-4">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg className={cn(
                                "w-6 h-6",
                                theme === 'dark' ? 'text-purple-300' : 'text-blue-600'
                              )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <p className={cn(
                          "mt-1 text-sm",
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        )}>
                          Practice questions for {service.name} service
                        </p>
                      </div>
                    </div>

                    {/* Hover gradient overlay */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-purple-500/0 to-purple-500/20'
                        : 'bg-gradient-to-r from-blue-50/0 to-blue-50'
                    )} />
                  </div>
                ))}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                  <button
                    key={service.name}
                    onClick={() => handleServiceSelect(service.name)}
                    className={cn(
                      "rounded-xl transition-all duration-200 p-6 text-center border group min-h-[120px] flex flex-col justify-center relative overflow-hidden",
                      theme === 'dark'
                        ? 'bg-white/10 backdrop-blur-md hover:shadow-2xl hover:shadow-purple-500/20 border-white/20 hover:border-purple-400/50'
                        : 'bg-white hover:shadow-xl hover:shadow-blue-500/10 border-gray-200 hover:border-blue-400'
                    )}
                  >
                    <h3 className={cn(
                      "text-lg md:text-xl font-bold mb-2 leading-tight break-words hyphens-auto max-h-16 overflow-hidden",
                      theme === 'dark'
                        ? 'text-white group-hover:text-purple-300'
                        : 'text-gray-900 group-hover:text-blue-600'
                    )}>
                      {service.name}
                    </h3>

                    {/* Grid hover effect */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-500/0 to-purple-500/20'
                        : 'bg-gradient-to-br from-blue-50/0 to-blue-50'
                    )} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quiz Header */}
        {!showServiceSelection && !showMainOptions && selectedService && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pt-12 sm:pt-8">
            <div className="flex items-center gap-4 self-start">
              <button
                onClick={handleBackToServices}
                className={cn(
                  "inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors self-start",
                  theme === 'dark'
                    ? 'border-white/20 text-gray-200 bg-white/10 hover:bg-white/20 hover:text-white'
                    : 'border-gray-300 text-gray-800 bg-white hover:bg-gray-50'
                )}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Options
              </button>
              
              {/* Auto-Advance Toggle */}
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors",
                theme === 'dark'
                  ? 'border-white/20 bg-white/10'
                  : 'border-gray-300 bg-white'
              )}>
                <span className={cn(
                  "text-xs font-medium",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  Auto-Advance:
                </span>
                <button
                  onClick={() => setAutoAdvanceMode(!autoAdvanceMode)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                    autoAdvanceMode
                      ? theme === 'dark' ? 'bg-blue-600 focus:ring-blue-500' : 'bg-blue-600 focus:ring-blue-500'
                      : theme === 'dark' ? 'bg-gray-600 focus:ring-gray-500' : 'bg-gray-300 focus:ring-gray-400'
                  )}
                  aria-label="Toggle auto-advance mode"
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      autoAdvanceMode ? 'translate-x-5' : 'translate-x-1'
                    )}
                  />
                </button>
                <span className={cn(
                  "text-xs font-medium min-w-[3rem]",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  {autoAdvanceMode ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                theme === 'dark'
                  ? 'bg-blue-500/30 text-blue-200'
                  : 'bg-blue-100 text-blue-800'
              )}>
                {totalAnswered}/{questions.length} Answered
              </span>
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                theme === 'dark'
                  ? 'bg-blue-500/30 text-blue-200'
                  : 'bg-blue-100 text-blue-800'
              )}>
                {isFullExam ? 'Full AWS Prep Exam' : (selectedService === 'all' ? 'Complete Review' : selectedService)}
              </span>
            </div>
          </div>
        )}

        {!showResults ? (
          <div className="space-y-6">
            {currentQuestion && (
              <InteractiveQuestionCard
                key={currentQuestion._id}
                question={currentQuestion}
                index={currentQuestionIndex}
                onAnswerSelected={handleAnswerSelected}
                isAnswered={currentQuestionAnswered}
              />
            )}

            {/* Submit Button */}
            {showSubmitButton && (
              <div className="fixed bottom-8 right-8">
                <button
                  onClick={handleSubmitAnswer}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg"
                >
                  Submit Answer
                </button>
              </div>
            )}

            {/* Next Question Button - Hidden in auto-advance mode */}
            {!autoAdvanceMode && currentQuestionAnswered && currentQuestionIndex < questions.length - 1 && (
              <div className="fixed bottom-8 right-8">
                <button
                  onClick={handleNextQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg flex items-center gap-2"
                >
                  Next Question
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Show Results Button - Only when ALL questions are answered */}
            {questions.length > 0 && totalAnswered === questions.length && (
              <div className="text-center mt-8">
                <button
                  onClick={handleShowResults}
                  disabled={savingResults}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  {savingResults ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving Results...
                    </>
                  ) : (
                    'Show Final Results'
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                Quiz Complete!
              </h2>
              <p className="text-xl text-gray-600">
                {isFullExam ? 'Full AWS Prep Exam' : (selectedService === 'all' ? 'Complete Review' : selectedService)} Performance Summary
              </p>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                  scorePercentage >= 80 ? 'bg-green-100 text-green-800' :
                  scorePercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {scorePercentage >= 80 ? '🏆 Excellent!' :
                   scorePercentage >= 60 ? '👍 Good Job!' :
                   '📚 Keep Studying!'}
                </div>
                <div className="text-6xl font-bold text-gray-900 mb-2">{scorePercentage}%</div>
                <div className="text-lg text-gray-600">Overall Accuracy</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    scorePercentage >= 80 ? 'bg-green-500' :
                    scorePercentage >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-blue-600">{totalAnswered}</div>
                <div className="text-sm text-gray-600 font-medium">Total Questions</div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600 font-medium">Correct</div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                <div className="text-sm text-gray-600 font-medium">Points Earned</div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-orange-600">{Math.round(totalPoints/totalAnswered * 10) / 10}</div>
                <div className="text-sm text-gray-600 font-medium">Avg Points/Q</div>
              </div>
            </div>

            {/* Points Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Points Breakdown</h3>
                <span className="text-sm text-gray-500">{pointsPerQuestion} pts per question</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">
                  {totalPoints} <span className="text-gray-500 text-lg">/ {maxPossiblePoints}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Potential: {maxPossiblePoints - totalPoints} more points</div>
                  <div className="text-xs text-gray-500">with perfect accuracy</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestartQuiz}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Take Quiz Again
                </div>
              </button>

              <button
                onClick={handleBackToServices}
                className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Choose Different Service
                </div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
