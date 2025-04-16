/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/subscription.ts

import { getCurrentUser, checkUserSubscription, 
        verifyAccessCode as verifyCode,
        getUserUsageStats,
        incrementUsage } from "./firebase";

  
  // Interface for subscription status
  interface SubscriptionStatus {
    isSubscribed: boolean;
    plan?: 'basic' | 'pro';
    expiryDate?: Date;
    usageStats?: {
      notes: number;
      questions: number;
    };
  }
  
  // Check the user's subscription status
  export const checkSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
    try {
      // First check local storage for cached status
      const cachedStatusStr = localStorage.getItem('subscription_status');
      const cachedExpiry = localStorage.getItem('subscription_expiry');
      
      if (cachedStatusStr && cachedExpiry) {
        const cachedStatus = JSON.parse(cachedStatusStr);
        const expiryTime = new Date(cachedExpiry);
        
        // If cached data is still valid (not expired)
        if (expiryTime > new Date()) {
          // Get latest usage stats
          const cachedUsageStr = localStorage.getItem('usage_stats');
          const usageStats = cachedUsageStr ? JSON.parse(cachedUsageStr) : { notes: 0, questions: 0 };
          
          return {
            ...cachedStatus,
            usageStats
          };
        }
      }
      
      // Get current user
      const user = await getCurrentUser();
      
      // Check subscription in Firebase
      const subscriptionStatus = await checkUserSubscription(user.uid);
      
      // Get usage stats
      const usageStats = await getUserUsageStats(user.uid);
      
      // Cache the results
      if (subscriptionStatus.isSubscribed && subscriptionStatus.expiryDate) {
        localStorage.setItem('subscription_status', JSON.stringify({
          isSubscribed: true,
          plan: subscriptionStatus.plan
        }));
        localStorage.setItem('subscription_expiry', subscriptionStatus.expiryDate.toISOString());
      } else {
        // If not subscribed, clear any existing cached subscription
        localStorage.removeItem('subscription_status');
        localStorage.removeItem('subscription_expiry');
      }
      
      // Cache usage stats
      localStorage.setItem('usage_stats', JSON.stringify(usageStats));
      
      return {
        ...subscriptionStatus,
        usageStats
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      
      // Fall back to local storage if available
      const cachedStatusStr = localStorage.getItem('subscription_status');
      const cachedUsageStr = localStorage.getItem('usage_stats');
      
      if (cachedStatusStr) {
        const cachedStatus = JSON.parse(cachedStatusStr);
        const usageStats = cachedUsageStr ? JSON.parse(cachedUsageStr) : { notes: 0, questions: 0 };
        
        return {
          ...cachedStatus,
          usageStats
        };
      }
      
      // Default to not subscribed if all else fails
      return { 
        isSubscribed: false,
        usageStats: { notes: 0, questions: 0 } 
      };
    }
  };
  
  // Verify an access code
  export const verifyAccessCode = async (
    code: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await verifyCode(code);
      
      if (result.success) {
        // Clear cache to force refresh
        localStorage.removeItem('subscription_status');
        localStorage.removeItem('subscription_expiry');
        
        // Update subscription status immediately
        localStorage.setItem('subscription_status', JSON.stringify({
          isSubscribed: true,
          plan: result.plan
        }));
        
        // Set expiry to 30 days from now (matches Firebase logic)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        localStorage.setItem('subscription_expiry', expiryDate.toISOString());
      }
      
      return result;
    } catch (error: any) {
      console.error('Error verifying access code:', error);
      return { 
        success: false, 
        message: error.message || 'Error verifying access code'
      };
    }
  };
  
  // Check if user can use a feature based on their subscription
  export const canUseFeature = async (
    feature: 'notes' | 'questions'
  ): Promise<{ 
    canUse: boolean; 
    message?: string;
    usageLeft?: number;
  }> => {
    try {
      const status = await checkSubscriptionStatus();
      
      // If user is subscribed, they can use all features
      if (status.isSubscribed) {
        return { canUse: true };
      }
      
      // Handle free tier
      if (feature === 'notes') {
        const notesUsed = status.usageStats?.notes || 0;
        const notesLimit = 2;
        
        if (notesUsed < notesLimit) {
          return { 
            canUse: true,
            usageLeft: notesLimit - notesUsed
          };
        } else {
          return {
            canUse: false,
            message: `You've reached your free limit of ${notesLimit} study notes. Subscribe to create unlimited notes.`
          };
        }
      } else if (feature === 'questions') {
        const questionsUsed = status.usageStats?.questions || 0;
        const questionsLimit = 1;
        
        if (questionsUsed < questionsLimit) {
          return {
            canUse: true,
            usageLeft: questionsLimit - questionsUsed
          };
        } else {
          return {
            canUse: false,
            message: `You've reached your free limit of ${questionsLimit} question sets. Subscribe to create unlimited questions.`
          };
        }
      }
      
      // Default deny for unknown features
      return {
        canUse: false,
        message: 'Subscription required to use this feature'
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      
      // Default to allowing in case of errors, to avoid blocking users
      return { canUse: true };
    }
  };
  
  // Increment usage count
  export const trackUsage = async (
    feature: 'notes' | 'questions'
  ): Promise<void> => {
    try {
      // Get current user
      const user = await getCurrentUser();
      
      // Increment usage in Firebase
      await incrementUsage(user.uid, feature);
      
      // Update local cache
      const cachedUsageStr = localStorage.getItem('usage_stats');
      const usageStats = cachedUsageStr ? JSON.parse(cachedUsageStr) : { notes: 0, questions: 0 };
      
      usageStats[feature] += 1;
      localStorage.setItem('usage_stats', JSON.stringify(usageStats));
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };