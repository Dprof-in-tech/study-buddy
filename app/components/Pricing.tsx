// components/Pricing.tsx
'use client';

import { useState } from 'react';
import { CheckIcon } from 'lucide-react';

interface PricingProps {
  onSubscribe: (plan: 'basic' | 'pro', period: 'monthly' | 'yearly') => void;
  isSubscribed: boolean;
  usageStats: {
    notes: number;
    questions: number;
  };
}

export default function Pricing({ onSubscribe, isSubscribed, usageStats }: PricingProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const freeFeaturesLeft = {
    notes: Math.max(0, 2 - usageStats.notes),
    questions: Math.max(0, 1 - usageStats.questions)
  };

  // Price configuration
  const pricing = {
    basic: {
      monthly: 1000,
      yearly: 9600, // 1000 * 12 * 0.8 (20% discount)
    },
    pro: {
      monthly: 2500,
      yearly: 24000, // 2500 * 12 * 0.8 (20% discount)
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Pricing</h2>
        <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
          Plans for every student
        </p>
        <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
          Choose the plan that fits your study needs
        </p>
      </div>

      <div className="mt-12 flex justify-center">
        <div className="relative self-center bg-gray-100 rounded-lg p-0.5 flex">
          <button
            type="button"
            className={`relative py-2 px-6 border-gray-200 rounded-md shadow-sm text-sm font-medium whitespace-nowrap ${
              billingPeriod === 'monthly'
                ? 'bg-white border-transparent text-gray-900'
                : 'bg-transparent border-transparent text-gray-500'
            }`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`ml-0.5 relative py-2 px-6 border-gray-200 rounded-md shadow-sm text-sm font-medium whitespace-nowrap ${
              billingPeriod === 'yearly'
                ? 'bg-white border-transparent text-gray-900'
                : 'bg-transparent border-transparent text-gray-500'
            }`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly <span className="text-blue-500">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
        {/* Free Plan */}
        <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Free</h2>
            <p className="mt-4 text-sm text-gray-500">Try out the basic features with limited usage.</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">₦0</span>
              <span className="text-base font-medium text-gray-500">/{billingPeriod === 'monthly' ? 'mo' : 'year'}</span>
            </p>
            <button
              disabled
              className="mt-8 block w-full bg-gray-200 border border-gray-300 rounded-md py-2 text-sm font-semibold text-gray-400 text-center cursor-not-allowed"
            >
              Current Plan
            </button>
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>{freeFeaturesLeft.notes} of 2 notes remaining</p>
              <p>{freeFeaturesLeft.questions} of 1 question remaining</p>
            </div>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What&apos;s included</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">2 study note generations</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">1 exam question set</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Basic question formats</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Basic Plan */}
        <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Basic</h2>
            <p className="mt-4 text-sm text-gray-500">Everything you need for regular studying.</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">
                ₦{billingPeriod === 'monthly' ? pricing.basic.monthly.toLocaleString() : pricing.basic.yearly.toLocaleString()}
              </span>
              <span className="text-base font-medium text-gray-500">/{billingPeriod === 'monthly' ? 'mo' : 'year'}</span>
            </p>
            {billingPeriod === 'yearly' && (
              <p className="mt-2 text-sm text-gray-600">
                Save ₦{(pricing.basic.monthly * 12 - pricing.basic.yearly).toLocaleString()} per year
              </p>
            )}
            <button
              onClick={() => onSubscribe('basic', billingPeriod)}
              className="cursor-pointer mt-8 block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700"
            >
              {isSubscribed ? 'Manage Subscription' : 'Subscribe'}
            </button>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What&apos;s included</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Unlimited study notes</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Unlimited exam questions</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Advanced question formats</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Download options</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Email support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="border border-blue-500 rounded-lg shadow-sm divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Pro</h2>
            <p className="mt-4 text-sm text-gray-500">Advanced features for serious students.</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">
                ₦{billingPeriod === 'monthly' ? pricing.pro.monthly.toLocaleString() : pricing.pro.yearly.toLocaleString()}
              </span>
              <span className="text-base font-medium text-gray-500">/{billingPeriod === 'monthly' ? 'mo' : 'year'}</span>
            </p>
            {billingPeriod === 'yearly' && (
              <p className="mt-2 text-sm text-gray-600">
                Save ₦{(pricing.pro.monthly * 12 - pricing.pro.yearly).toLocaleString()} per year
              </p>
            )}
            <button
              onClick={() => onSubscribe('pro', billingPeriod)}
              className="cursor-pointer mt-8 block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700"
            >
              {isSubscribed ? 'Upgrade Plan' : 'Subscribe'}
            </button>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What&apos;s included</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Everything in Basic</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Priority generation</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Custom formatting options</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">API access</span>
              </li>
              <li className="flex space-x-3">
                <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Priority email support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}