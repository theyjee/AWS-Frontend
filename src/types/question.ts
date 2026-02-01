export interface Question {
  _id: string;
  service: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  createdAt: string;
}
