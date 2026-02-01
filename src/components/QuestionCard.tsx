import React from 'react';
import { Question } from '@/types/question';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export default function QuestionCard({ question, index }: QuestionCardProps) {

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Question {index + 1}
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded">
            {question.service}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg text-gray-700 mb-4">{question.question}</p>

        <div className="space-y-2 mb-6">
          {question.choices.map((choice, choiceIndex) => (
            <div
              key={choiceIndex}
              className={`p-3 rounded-md border ${
                choiceIndex === question.correctAnswer
                  ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + choiceIndex)}.
              </span>
              {choice}
              {choiceIndex === question.correctAnswer && (
                <span className="ml-2 text-green-600 font-bold">✓ Correct Answer</span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Explanation</h3>
          <p className="text-blue-800 leading-relaxed">{question.explanation}</p>
        </div>
      </div>
    </div>
  );
}
