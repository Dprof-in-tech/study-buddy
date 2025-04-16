
// components/LandingPage.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Pricing from './Pricing';
import SubscriptionModal from './SubscriptionModal';
import AccessCodeVerification from './AccessCodeVerification';
import { checkSubscriptionStatus } from '@/lib/subscription';

export default function LandingPage() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | null>(null);
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [usageStats, setUsageStats] = useState({ notes: 0, questions: 0 });

  useEffect(() => {
    // Check subscription status on component mount
    const checkStatus = async () => {
      const status = await checkSubscriptionStatus();
      setIsSubscribed(status.isSubscribed);
      setUsageStats({
        notes: status.usageStats?.notes || 0,
        questions: status.usageStats?.questions || 0
      });
    };
    
    checkStatus();
  }, []);

  const handleSubscribe = (plan: 'basic' | 'pro') => {
    setSelectedPlan(plan);
    setShowSubscriptionModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowSubscriptionModal(false);
    setShowAccessCodeModal(true);
  };

  const handleAccessCodeSuccess = () => {
    setShowAccessCodeModal(false);
    setIsSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">myStudy Buddy</h1>
          </div>
          <div className="flex space-x-4 items-center">
            <Link href="/test" className="text-gray-700 hover:text-gray-900 font-medium">
              Try Demo
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-gray-900 font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium">
              Pricing
            </Link>
            {isSubscribed ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-black">
                Subscribed
              </span>
            ) : (
              <button
                onClick={() => handleSubscribe('basic')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 bg-white lg:max-w-2xl lg:w-full">
            <div className="pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
              <div className="px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Study like a Nigerian,</span>
                  <span className="block text-black">Excel globally</span>
                </h2>
                <p className="mt-6 text-xl text-gray-600 max-w-lg">
                  Generate comprehensive study notes in the familiar style of Nigerian lecturers while meeting international standards. Test your knowledge with questions that explain why answers are right or wrong.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  {isSubscribed ? (
                    <Link href="/study" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-green-700 focus:outline-none">
                      Go to Study Notes
                    </Link>
                  ) : (
                     <Link href="/test">
                    <button
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-green-700 focus:outline-none"
                    >
                      Try Free
                    </button>
                    </Link>
                  )}
                  <Link href="/#features" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none">
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full bg-gray-100 flex items-center justify-center">
            <img 
              src="/images/study-hero.png" 
              alt="myStudy Buddy Interface" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Nigerian+Study+Experience';
              }}
            />
          </div>
        </div>
      </div>

      {/* Unique Value Proposition */}
      <div className="bg-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Study materials tailored for Nigerian students, recognized globally
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our AI understands the unique teaching style of Nigerian lecturers and generates study notes that feel familiar while incorporating global best practices in education.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Nigerian Lecturing Style</h3>
                    <p className="mt-1 text-md text-gray-600">Notes formatted in the familiar style of Nigerian university lectures</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Global Standards</h3>
                    <p className="mt-1 text-md text-gray-600">Content meets international educational benchmarks</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Detailed Explanations</h3>
                    <p className="mt-1 text-md text-gray-600">Understand why answers are right or wrong, not just memorize facts</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-8 sm:p-10">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Sample Study Note</h4>
                    <p className="text-gray-700 mb-2">
                      <span className="font-bold">TOPIC:</span> Circuit Analysis in Electronic Engineering
                    </p>
                    <p className="text-gray-700 mb-1">
                      The analysis of electrical circuits involves the application of Kirchhoff&apos;s laws to determine voltage and current distributions. 
                    </p>
                    <p className="text-gray-700 font-bold mt-3 mb-1">
                      Key Definition:
                    </p>
                    <p className="text-gray-700 pl-3">
                      Kirchhoff&apos;s Current Law (KCL): &quot;The algebraic sum of all currents entering and leaving a node must equal zero.&quot;
                    </p>
                    <p className="text-gray-700 font-bold mt-3 mb-1">
                      Note to Students:
                    </p>
                    <p className="text-gray-700 pl-3 italic">
                      This will appear in your examination. Make sure you understand the application, not just the formula.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-black tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Everything you need to excel
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              myStudy Buddy is designed specifically for Nigerian students who want to understand concepts deeply, not just memorize for exams.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition">
                <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Nigerian-Style Study Notes</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Generate detailed study notes that mirror the style of Nigerian lecturers—complete with &quot;note to students&quot; sections, key definitions, and common exam topics.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition">
                <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Exam-Focused Questions</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Practice with questions that reflect both Nigerian exams and international standards, with customizable difficulty levels to match your needs.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition">
                <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">In-Depth Explanations</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Don&apos;t just learn what is correct—understand why it&apos;s correct and why other options are wrong, helping you develop critical thinking skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-black tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Learn smarter, not harder
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform adapts to how Nigerian students learn while preparing them for global opportunities
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white mx-auto">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Your Materials</h3>
                <p className="mt-2 text-base text-gray-600">
                  Paste your course outline, lecture notes, or textbook content into our system
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white mx-auto">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Generate Custom Materials</h3>
                <p className="mt-2 text-base text-gray-600">
                  Our AI creates Nigerian-style study notes and practice questions tailored to your content
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white mx-auto">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Test Your Knowledge</h3>
                <p className="mt-2 text-base text-gray-600">
                  Practice with interactive questions that provide detailed explanations for every answer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-white">
        <Pricing 
          onSubscribe={handleSubscribe} 
          isSubscribed={isSubscribed}
          usageStats={usageStats}
        />
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-black tracking-wide uppercase">Testimonials</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              What Nigerian students are saying
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex h-10 w-10 rounded-full bg-green-100 text-black items-center justify-center">
                    <span className="font-medium text-lg">A</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Adebayo O.</h3>
                  <p className="text-sm text-gray-500">Engineering Student, UNILAG</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;The notes format feels exactly like what my lecturers would hand out, but with clearer explanations. The exam questions actually helped me understand the &apos;why&apos; behind each concept.&quot;
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex h-10 w-10 rounded-full bg-green-100 text-black items-center justify-center">
                    <span className="font-medium text-lg">C</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Joy C.</h3>
                  <p className="text-sm text-gray-500">400L Mech Eng, UNN</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
              I&apos;m thoroughly impressed with this study tool! The intuitive design and comprehensive content have significantly boosted my understanding. Highly recommended for anyone seeking a reliable study resource.
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex h-10 w-10 rounded-full bg-green-100 text-black items-center justify-center">
                    <span className="font-medium text-lg">F</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Folake T.</h3>
                  <p className="text-sm text-gray-500">Computer Science, Covenant University</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;I improved my CGPA by using myStudy Buddy. The detailed explanations for wrong answers helped me identify misconceptions I didn&apos;t realize I had. Now I don&apos;t just pass - I excel!&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to study the Nigerian way?</span>
            <span className="block text-green-200">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            {isSubscribed ? (
              <div className="inline-flex rounded-md shadow">
                <Link href="/study" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-green-50">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="inline-flex rounded-md shadow">
                <button
                  onClick={() => handleSubscribe('basic')}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-green-50"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSubscriptionModal && (
        <SubscriptionModal
          plan={selectedPlan || 'basic'}
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {showAccessCodeModal && (
        <AccessCodeVerification
          onClose={() => setShowAccessCodeModal(false)}
          onSuccess={handleAccessCodeSuccess}
        />
      )}
    </div>
  );
}