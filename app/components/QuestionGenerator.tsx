/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { 
  generateWithOpenAI, 
  generateWithClaude, 
  generateWithGrok,
  generateDemoQuestions 
} from '@/lib/aiService';

export default function QuestionGenerator({ 
  text, 
  onQuestionsGenerated, 
  setIsLoading,
  aiModel,
  setAiModel
} : {
    text : any, 
    onQuestionsGenerated : any, 
    setIsLoading : any,
    aiModel : any,
    setAiModel : any
}) {
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(text.length > 500 ? `${text.substring(0, 500)}...` : text);
  const [useDemo, setUseDemo] = useState(false);

  const handleGenerate = async () => {
    if (!text || text.trim() === '') {
      setError('No text content to generate questions from');
      return;
    }

    if (useDemo) {
      // Use demo questions for testing without API
      const demoQuestions = generateDemoQuestions();
      localStorage.setItem('studyBuddyQuestions', JSON.stringify(demoQuestions));
      onQuestionsGenerated(demoQuestions);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      let questions;

      switch (aiModel) {
        case 'openai':
          questions = await generateWithOpenAI(text, numQuestions, difficulty);
          break;
        case 'claude':
          questions = await generateWithClaude(text, numQuestions, difficulty);
          break;
        case 'grok':
          questions = await generateWithGrok(text, numQuestions, difficulty);
          break;
        default:
          throw new Error('Invalid AI model selected');
      }

      // Store questions in local storage for persistence
      localStorage.setItem('studyBuddyQuestions', JSON.stringify(questions));
      
      onQuestionsGenerated(questions);
    } catch (err: any) {
      console.error('Question generation error:', err);
      setError(err.message || 'Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold mb-4">Generate Study Questions</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Preview
        </label>
        <div className="p-3 bg-gray-50 rounded-md max-h-60 overflow-y-auto text-sm">
          {preview}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Total characters: {text.length}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions
          </label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {[3, 5, 10, 15, 20].map((num) => (
              <option key={num} value={num}>
                {num} questions
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Model
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => setAiModel('openai')}
            className={`flex-1 py-2 px-4 rounded-md ${
              aiModel === 'openai'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            OpenAI
          </button>
          <button
            onClick={() => setAiModel('claude')}
            className={`flex-1 py-2 px-4 rounded-md ${
              aiModel === 'claude'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Claude
          </button>
          <button
            onClick={() => setAiModel('grok')}
            className={`flex-1 py-2 px-4 rounded-md ${
              aiModel === 'grok'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Grok
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="p-3 bg-yellow-50 rounded-md">
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={useDemo}
                onChange={(e) => setUseDemo(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Use demo questions (no API call)</span>
            </label>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleGenerate}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Generate Questions
      </button>
    </div>
  );
}