/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';

export default function StudyInterface({ questions, resetApp } : {questions : any, resetApp: any}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    let interval: any;
    if (timerActive && !completed) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, completed]);

  const formatTime = (seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (option: any) => {
    if (answered) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (!selectedOption || answered) return;
    
    setAnswered(true);
    setShowExplanation(true);
    
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
      setShowExplanation(false);
      setAnswered(false);
    } else {
      setCompleted(true);
      setTimerActive(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption('');
    setShowExplanation(false);
    setAnswered(false);
    setScore(0);
    setCompleted(false);
    setTimer(0);
    setTimerActive(true);
  };

  if (!currentQuestion) {
    return (
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">No questions available</h2>
        <button
          onClick={resetApp}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Start Over
        </button>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    let feedback;
    
    if (percentage >= 90) {
      feedback = "Excellent! You've mastered this material.";
    } else if (percentage >= 70) {
      feedback = "Good job! You have a solid understanding of the material.";
    } else if (percentage >= 50) {
      feedback = "You're making progress! Consider reviewing the material again.";
    } else {
      feedback = "This material needs more review. Don't give up!";
    }
    
    return (
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md text-black">
        <h2 className="text-2xl font-bold mb-4 text-center">Quiz Completed!</h2>
        
        <div className="mb-6 text-center">
          <div className="text-5xl font-bold mb-2">{percentage}%</div>
          <p className="text-lg">
            You scored {score} out of {questions.length}
          </p>
          <p className="text-sm text-gray-900 mt-1">
            Time taken: {formatTime(timer)}
          </p>
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg">{feedback}</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={restartQuiz}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry Quiz
          </button>
          <button
            onClick={resetApp}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            New Material
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md text-black">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-900">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className="text-sm font-medium text-gray-900">
          Time: {formatTime(timer)}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {currentQuestion.question}
        </h2>
        
        <div className="space-y-2 mt-4">
          {currentQuestion.options.map((option: any, index: any) => (
            <div
              key={index}
              onClick={() => handleOptionSelect(option)}
              className={`p-3 rounded-md cursor-pointer border ${
                selectedOption === option
                  ? answered
                    ? option === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : 'bg-blue-100 border-blue-500'
                  : answered && option === currentQuestion.correctAnswer
                    ? 'bg-green-100 border-green-500'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start">
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {showExplanation && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-2">Explanation:</h3>
          <p>{currentQuestion.explanation}</p>
        </div>
      )}
      
      <div className="flex space-x-4">
        {!answered ? (
          <button
            onClick={checkAnswer}
            disabled={!selectedOption}
            className={`flex-1 py-2 px-4 rounded-md ${
              !selectedOption
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
          </button>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-900">
            Score: {score}/{currentQuestionIndex + (answered ? 1 : 0)}
          </div>
          <button
            onClick={resetApp}
            className="text-sm text-gray-900 hover:text-gray-900"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}