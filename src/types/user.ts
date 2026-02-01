export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  name: string;
  profileImage?: string;
  class?: string | null;
  totalQuizzes: number;
  totalCorrect: number;
  totalPointsEarned: number;
  averagePoints: number;
  averageScore: number;
  lastQuizDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizResult {
  _id: string;
  userId: User;
  firebaseUid: string;
  service?: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  totalPoints: number;
  maxPossiblePoints: number;
  pointsPerQuestion: number;
  timeTaken: number;
  answers: QuizAnswer[];
  completedAt: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeTaken: number;
}

export interface UserStats {
  totalQuizzes: number;
  totalCorrect: number;
  totalPointsEarned: number;
  averagePoints: number;
  averageScore: number;
  lastQuizDate?: string;
}
