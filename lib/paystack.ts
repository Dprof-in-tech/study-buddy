/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/paystack.ts
import { storeAccessCode } from './firebase';
import emailjs from 'emailjs-com';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_USER_ID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;

interface PaystackPaymentProps {
  email: string;
  amount: number; // in kobo (100 kobo = ₦1)
  plan: 'basic' | 'pro';
  metadata?: {
    [key: string]: string;
  };
}

interface PaystackResponse {
  success: boolean;
  message?: string;
  reference?: string;
}

// Function to send access code via email using EmailJS
const sendAccessCodeEmail = async (
  email: string, 
  accessCode: string, 
  plan: 'basic' | 'pro'
): Promise<boolean> => {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID) {
      console.log(`[Development Mode] Access code ${accessCode} would be sent to ${email} for ${plan} plan`);
      return true;
    }

    // Prepare template parameters for EmailJS
    const templateParams = {
      to_email: email,
      to_name: email.split('@')[0], // Simple name extraction from email
      access_code: accessCode,
      plan_name: plan === 'basic' ? 'Basic Plan' : 'Pro Plan',
      plan_price: plan === 'basic' ? '₦1,000/month' : '₦2,500/month',
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() // 7 days from now
    };
    
    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
    
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Initialize Paystack payment
export const initiatePaystackPayment = async (
  paymentProps: PaystackPaymentProps
): Promise<PaystackResponse> => {
  // Check if Paystack is available
  if (typeof window === 'undefined' || !window.PaystackPop) {
    await loadPaystackScript();
  }
  
  if (!PAYSTACK_PUBLIC_KEY) {
    console.error('Paystack public key is not defined');
    return { success: false, message: 'Payment integration not configured' };
  }
  
  return new Promise((resolve) => {
    try {
      // Generate a unique reference for this transaction
      const reference = 'STD_' + Math.floor(Math.random() * 1000000000) + 1;
      
      // Initialize Paystack with a regular function callback (not async)
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: paymentProps.email,
        amount: paymentProps.amount,
        currency: 'NGN',
        ref: reference,
        metadata: {
          plan: paymentProps.plan,
          ...paymentProps.metadata
        },
        // Fixed: Use regular function (not async) for Paystack callback
        callback: function(response: any) {
          // Handle async operations inside a regular function
          (async function() {
            try {
              // Generate access code
              const accessCode = await storeAccessCode(
                paymentProps.email,
                paymentProps.plan
              );
              
              // Send access code to user's email
              await sendAccessCodeEmail(
                paymentProps.email,
                accessCode,
                paymentProps.plan
              );
              
              resolve({
                success: true,
                reference: response.reference
              });
            } catch (error: any) {
              console.error('Error processing successful payment:', error);
              resolve({
                success: false,
                message: 'Payment was successful, but we could not generate your access code. Please contact support.'
              });
            }
          })();
        },
        onClose: function() {
          // This is called when the user closes the payment modal
          resolve({
            success: false,
            message: 'Payment window was closed'
          });
        }
      });
      
      // Open the payment modal
      handler.openIframe();
    } catch (error: any) {
      console.error('Paystack error:', error);
      resolve({
        success: false,
        message: error.message || 'An error occurred while initializing payment'
      });
    }
  });
};

// Load Paystack script dynamically
const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Skip if already loaded
    if (window.PaystackPop) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};

// Load EmailJS script dynamically if not already loaded
const loadEmailJSScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Skip if EmailJS is already loaded
    if (typeof emailjs !== 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize EmailJS with user ID
      if (EMAILJS_USER_ID) {
        emailjs.init(EMAILJS_USER_ID);
      }
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load EmailJS script'));
    document.body.appendChild(script);
  });
};

// Initialize EmailJS on module load if in browser
if (typeof window !== 'undefined') {
  loadEmailJSScript().catch(error => {
    console.error('Error loading EmailJS:', error);
  });
}

// Extend Window interface to include PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
}