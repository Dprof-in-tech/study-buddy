/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AccessCodeVerification.tsx
'use client';

import { useState, useEffect } from 'react';
import { XIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { verifyAccessCode } from '@/lib/subscription';

interface AccessCodeVerificationProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AccessCodeVerification({ onClose, onSuccess }: AccessCodeVerificationProps) {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode) {
      setError('Please enter your access code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const verificationResult = await verifyAccessCode(accessCode);

      if (verificationResult.success) {
        setIsSuccess(true);
        // Wait a moment to show success message before closing
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(verificationResult.message || 'Invalid access code. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Enter Access Code
                </h3>
                <button
                  onClick={onClose}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              {isSuccess ? (
                <div className="mt-6 mb-6 flex flex-col items-center">
                  <CheckCircle className="h-12 w-12 text-black mb-4" />
                  <h3 className="text-xl font-medium text-gray-900">Subscription Activated!</h3>
                  <p className="mt-2 text-gray-600">
                    Your subscription has been successfully activated. Enjoy all the premium features!
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Please enter the access code that was sent to your email after payment.
                  </p>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
                        Access Code
                      </label>
                      <input
                        type="text"
                        id="accessCode"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className="mt-1 block text-black w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter your access code"
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 rounded-md flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={onClose}
                        className="bg-white cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifying}
                        className={`inline-flex cursor-pointer justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                          isVerifying ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {isVerifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}