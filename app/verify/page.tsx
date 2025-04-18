'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyAccessCode } from '@/lib/subscription';

export default function VerifyPage() {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      // Clean up the code format (remove spaces, convert to uppercase)
      const cleanCode = accessCode.trim().toUpperCase();
      
      // Call the API to verify the code
      const result = await verifyAccessCode(cleanCode);
      
      if (result.success) {
        setSuccess(true);
        
        // Redirect to the study page after a brief delay to show success message
        setTimeout(() => {
          router.push('/study');
        }, 2000);
      } else {
        setError(result.message || 'Invalid access code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while verifying your code. Please try again.');
      console.error('Access code verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">myStudy Buddy</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verify Access Code
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the access code you received after payment to activate your subscription
            </p>
          </div>

          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Access code verified!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your subscription has been activated successfully. Redirecting you to the study page...</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="access-code" className="block text-sm font-medium text-gray-700">
                  Access Code
                </label>
                <div className="mt-1">
                  <input
                    id="access-code"
                    name="access-code"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Enter your access code (e.g., ABCD-1234-EFGH)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isVerifying || !accessCode.trim()}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    isVerifying || !accessCode.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800 focus:outline-none'
                  }`}
                >
                  {isVerifying ? 'Verifying...' : 'Verify Access Code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-black hover:text-gray-500">
              Return to Home Page
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} myStudy Buddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}