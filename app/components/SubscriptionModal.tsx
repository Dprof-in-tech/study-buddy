/* eslint-disable @typescript-eslint/no-explicit-any */
// components/SubscriptionModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { initiatePaystackPayment } from '@/lib/paystack';

interface SubscriptionModalProps {
  plan: 'basic' | 'pro';
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubscriptionModal({ plan, onClose, onSuccess }: SubscriptionModalProps) {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const planDetails = {
    basic: {
      name: 'Basic Plan',
      price: 1000,
      features: ['Unlimited study notes', 'Unlimited exam questions', 'Advanced question formats', 'Download options']
    },
    pro: {
      name: 'Pro Plan',
      price: 2500,
      features: ['Everything in Basic', 'Priority generation', 'Custom formatting options', 'API access', 'Priority support']
    }
  };

  const selectedPlan = planDetails[plan];

  useEffect(() => {
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    setError('');
    console.log("Starting payment process");

    try {
      const paymentResult = await initiatePaystackPayment({
        email,
        amount: selectedPlan.price * 100, // Paystack requires amount in kobo
        plan: plan,
        metadata: {
          plan_name: selectedPlan.name,
          customer_email: email
        }
      });
      console.log("Payment result:", paymentResult);

      if (paymentResult.success) {
        console.log("Payment successful, calling onSuccess");
        onSuccess();
      } else {
        console.log("Payment failed:", paymentResult.message);
        setError(paymentResult.message || 'Payment failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
    } finally {
      setIsProcessing(false);
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
                  Subscribe to {selectedPlan.name}
                </h3>
                <button
                  onClick={onClose}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-medium">Price:</span>
                    <span className="text-gray-900 font-medium">₦{selectedPlan.price.toLocaleString()}/month</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium mt-2 mb-1">Includes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block text-black w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="your@email.com"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      We&apos;ll send your access code to this email
                    </p>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm rounded">
                      {error}
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
                      disabled={isProcessing}
                      className={`inline-flex cursor-pointer justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {isProcessing ? 'Processing...' : 'Pay with Paystack'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}