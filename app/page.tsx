/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import components with no SSR to avoid hydration issues
const FileUpload = dynamic(() => import('../app/components/FileUpload'), { ssr: false });
const QuestionGenerator = dynamic(() => import('../app/components/QuestionGenerator'), { ssr: false });
const StudyInterface = dynamic(() => import('../app/components/StudyInterface'), { ssr: false });

export default function Home() {
  const [extractedText, setExtractedText] = useState('');
  const [questions, setQuestions]: any[] = useState([]);
  const [currentStep, setCurrentStep] = useState('input'); // input, generate, study
  const [isLoading, setIsLoading] = useState(false);
  const [aiModel, setAiModel] = useState('openai'); // openai, claude, grok

  // Check localStorage for saved state on component mount
  useEffect(() => {
    // Check if we have extracted text saved
    const savedText = localStorage.getItem('studyBuddyText');
    if (savedText) {
      setExtractedText(savedText);
      
      // Check if we have questions saved
      const savedQuestions = localStorage.getItem('studyBuddyQuestions');
      if (savedQuestions) {
        try {
          const parsedQuestions = JSON.parse(savedQuestions);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
            setCurrentStep('study');
          } else {
            setCurrentStep('generate');
          }
        } catch (e) {
          console.error('Error parsing saved questions', e);
          setCurrentStep('generate');
        }
      } else {
        setCurrentStep('generate');
      }
    }
  }, []);

  const handleTextExtracted = (text: any) => {
    setExtractedText(text);
    // Save to localStorage for persistence
    localStorage.setItem('studyBuddyText', text);
    setCurrentStep('generate');
  };

  const handleQuestionsGenerated = (generatedQuestions: any) => {
    setQuestions(generatedQuestions);
    setCurrentStep('study');
  };

  const resetApp = () => {
    setExtractedText('');
    setQuestions([]);
    setCurrentStep('input');
    // Clear localStorage
    localStorage.removeItem('studyBuddyText');
    localStorage.removeItem('studyBuddyQuestions');
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2 text-black">Study Buddy</h1>
      <p className="text-gray-800 mb-8 text-center max-w-xl">
        Upload your study materials or paste text, generate questions, and test your knowledge - all in your browser.
      </p>

      {currentStep === 'input' && (
        <FileUpload 
          onTextExtracted={handleTextExtracted} 
          setIsLoading={setIsLoading}
        />
      )}

      {currentStep === 'generate' && (
        <QuestionGenerator 
          text={extractedText} 
          onQuestionsGenerated={handleQuestionsGenerated}
          setIsLoading={setIsLoading}
          aiModel={aiModel}
          setAiModel={setAiModel}
        />
      )}

      {currentStep === 'study' && (
        <StudyInterface 
          questions={questions} 
          resetApp={resetApp}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-black">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-black rounded-full mb-4"></div>
              <p className="text-lg">Processing...</p>
            </div>
          </div>
        </div>
      )}


      <div>
        <Link href='/study'>
        <button className='bg-black h-[52px] w-[445px] mx-auto text-white text-center rounded-md cursor-pointer my-8'>
          Generate Study Notes
        </button>
        </Link>
      </div>
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>Study Buddy - Client-side Engineering Study Tool</p>
        <p className="mt-1">Your data stays in your browser and is never sent to our servers.</p>
      </footer>
    </main>
  );
}