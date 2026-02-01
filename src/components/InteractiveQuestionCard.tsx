import React, { useState } from 'react';
import { Question } from '@/types/question';

interface InteractiveQuestionCardProps {
  question: Question;
  index: number;
  onAnswerSelected?: (questionId: string, selectedAnswer: number, isCorrect: boolean) => void;
  isAnswered?: boolean;
}

export default function InteractiveQuestionCard({
  question,
  index,
  onAnswerSelected,
  isAnswered
}: InteractiveQuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);


  const handleAnswerSelect = (choiceIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(choiceIndex);

    const isCorrect = choiceIndex === question.correctAnswer;
    if (onAnswerSelected) {
      onAnswerSelected(question._id, choiceIndex, isCorrect);
    }
  };

  const getChoiceClassName = (choiceIndex: number) => {
    if (!isAnswered) {
      if (selectedAnswer === choiceIndex) {
        return 'relative p-4 rounded-xl border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-blue-400/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200';
      }
      return 'relative p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md transform hover:scale-[1.01]';
    }

    if (choiceIndex === question.correctAnswer) {
      return 'relative p-4 rounded-xl border-2 border-green-400 bg-gradient-to-r from-green-50 to-green-100 text-green-900 shadow-lg transform scale-[1.02]';
    }

    if (selectedAnswer === choiceIndex && choiceIndex !== question.correctAnswer) {
      return 'relative p-4 rounded-xl border-2 border-red-400 bg-gradient-to-r from-red-50 to-red-100 text-red-900 shadow-md';
    }

    return 'relative p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 opacity-60';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 backdrop-blur-sm relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg shadow-lg">
              {index + 1}
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
              Question
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-full shadow-md">
              {question.service}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-10">
          <p className="text-2xl text-gray-800 mb-8 leading-relaxed font-medium tracking-wide">{question.question}</p>

          {/* Answer Choices */}
          <div className="space-y-4 mb-8">
            {question.choices.map((choice, choiceIndex) => (
              <div
                key={choiceIndex}
                className={getChoiceClassName(choiceIndex)}
                onClick={() => handleAnswerSelect(choiceIndex)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 text-sm font-bold text-gray-700 shadow-sm">
                    {String.fromCharCode(65 + choiceIndex)}
                  </div>
                  <span className="flex-1 text-lg leading-relaxed">{choice}</span>
                  {isAnswered && choiceIndex === question.correctAnswer && (
                    <span className="flex items-center gap-2 text-green-700 font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Correct
                    </span>
                  )}
                  {isAnswered && selectedAnswer === choiceIndex && choiceIndex !== question.correctAnswer && (
                    <span className="flex items-center gap-2 text-red-700 font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Your choice
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Explanation</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">{question.explanation}</p>

              {selectedAnswer === question.correctAnswer ? (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">Correct!</div>
                    <div className="text-green-700">Well done! You got it right.</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-red-800">Incorrect</div>
                    <div className="text-red-700">
                      The correct answer is <span className="font-semibold">{String.fromCharCode(65 + question.correctAnswer)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
