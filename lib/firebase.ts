/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';

// Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
   measurementId: "G-WFPRHHH6PP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Anonymous authentication to track user without requiring sign-up
export const authenticateAnonymously = async (): Promise<User> => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error: any) {
    console.error('Authentication error:', error);
    throw new Error('Failed to authenticate: ' + error.message);
  }
};

// Get current user or authenticate if none exists
export const getCurrentUser = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        // No user - attempt anonymous auth
        authenticateAnonymously()
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

// Access code functions
interface AccessCode {
  code: string;
  email: string;
  plan: 'basic' | 'pro';
  isUsed: boolean;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  usedAt?: Timestamp;
  userId?: string;
}

// Generate a unique access code
export const generateAccessCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let result = '';
  const charactersLength = characters.length;
  
  // Generate a 12-character code
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      result += '-'; // Add hyphen every 4 characters for readability
    }
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

// Store a new access code in Firebase
export const storeAccessCode = async (
  email: string,
  plan: 'basic' | 'pro'
): Promise<string> => {
  const code = generateAccessCode();
  
  // Create a new access code document
  const accessCodesRef = collection(db, 'accessCodes');
  const now = Timestamp.now();
  
  // Access codes expire in 7 days
  const expiresAt = new Timestamp(
    now.seconds + 7 * 24 * 60 * 60,
    now.nanoseconds
  );
  
  const accessCodeData: AccessCode = {
    code,
    email,
    plan,
    isUsed: false,
    createdAt: now,
    expiresAt
  };
  
  try {
    await setDoc(doc(accessCodesRef, code), accessCodeData);
    return code;
  } catch (error: any) {
    console.error('Error storing access code:', error);
    throw new Error('Failed to generate access code: ' + error.message);
  }
};

// Verify an access code
export const verifyAccessCode = async (
  code: string
): Promise<{ success: boolean; message?: string; plan?: 'basic' | 'pro' }> => {
  try {
    // Clean up the code format
    const cleanCode = code.trim().toUpperCase();
    
    // Get the access code document
    const accessCodeRef = doc(db, 'accessCodes', cleanCode);
    const accessCodeSnap = await getDoc(accessCodeRef);
    
    if (!accessCodeSnap.exists()) {
      return { success: false, message: 'Invalid access code' };
    }
    
    const accessCodeData = accessCodeSnap.data() as AccessCode;
    
    // Check if code is already used
    if (accessCodeData.isUsed) {
      return { success: false, message: 'Access code has already been used' };
    }
    
    // Check if code is expired
    const now = Timestamp.now();
    if (now.toMillis() > accessCodeData.expiresAt.toMillis()) {
      return { success: false, message: 'Access code has expired' };
    }
    
    // Get current user
    const user = await getCurrentUser();
    
    // Mark the code as used
    await updateDoc(accessCodeRef, {
      isUsed: true,
      usedAt: now,
      userId: user.uid
    });
    
    // Update user's subscription
    await setUserSubscription(user.uid, accessCodeData.plan);
    
    return { 
      success: true, 
      plan: accessCodeData.plan
    };
  } catch (error: any) {
    console.error('Error verifying access code:', error);
    return { success: false, message: 'Error verifying access code: ' + error.message };
  }
};

// Subscription management
interface Subscription {
  userId: string;
  plan: 'basic' | 'pro';
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'expired' | 'cancelled';
}

// Set a user's subscription
export const setUserSubscription = async (
  userId: string,
  plan: 'basic' | 'pro'
): Promise<void> => {
  const now = Timestamp.now();
  
  // Subscription lasts for 30 days
  const endDate = new Timestamp(
    now.seconds + 30 * 24 * 60 * 60,
    now.nanoseconds
  );
  
  const subscriptionData: Subscription = {
    userId,
    plan,
    startDate: now,
    endDate,
    status: 'active'
  };
  
  // Check if user already has a subscription
  const subscriptionsRef = collection(db, 'subscriptions');
  const q = query(subscriptionsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Update existing subscription
    const subscriptionDoc = querySnapshot.docs[0];
    await updateDoc(subscriptionDoc.ref, { ...subscriptionData });
  } else {
    // Create new subscription
    await setDoc(doc(subscriptionsRef), subscriptionData);
  }
};

// Check if a user has an active subscription
export const checkUserSubscription = async (
  userId: string
): Promise<{ isSubscribed: boolean; plan?: 'basic' | 'pro'; expiryDate?: Date }> => {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef, 
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { isSubscribed: false };
    }
    
    const subscriptionData = querySnapshot.docs[0].data() as Subscription;
    const now = Timestamp.now();
    
    // Check if subscription has expired
    if (now.toMillis() > subscriptionData.endDate.toMillis()) {
      // Update subscription status to expired
      await updateDoc(querySnapshot.docs[0].ref, { status: 'expired' });
      return { isSubscribed: false };
    }
    
    return {
      isSubscribed: true,
      plan: subscriptionData.plan,
      expiryDate: subscriptionData.endDate.toDate()
    };
  } catch (error: any) {
    console.error('Error checking subscription:', error);
    return { isSubscribed: false };
  }
};

// Usage tracking
interface UsageStats {
  userId: string;
  notes: number;
  questions: number;
  lastUpdated: Timestamp;
}

// Get user usage stats
export const getUserUsageStats = async (
  userId: string
): Promise<{ notes: number; questions: number }> => {
  try {
    const statsRef = doc(db, 'usageStats', userId);
    const statsSnap = await getDoc(statsRef);
    
    if (!statsSnap.exists()) {
      return { notes: 0, questions: 0 };
    }
    
    const stats = statsSnap.data() as UsageStats;
    return {
      notes: stats.notes || 0,
      questions: stats.questions || 0
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return { notes: 0, questions: 0 };
  }
};

// Increment usage stats
export const incrementUsage = async (
  userId: string,
  type: 'notes' | 'questions',
  count: number = 1
): Promise<void> => {
  try {
    const statsRef = doc(db, 'usageStats', userId);
    const statsSnap = await getDoc(statsRef);
    
    if (!statsSnap.exists()) {
      // Create new stats document
      await setDoc(statsRef, {
        userId,
        notes: type === 'notes' ? count : 0,
        questions: type === 'questions' ? count : 0,
        lastUpdated: Timestamp.now()
      });
    } else {
      // Update existing stats
      const stats = statsSnap.data() as UsageStats;
      await updateDoc(statsRef, {
        [type]: (stats[type] || 0) + count,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating usage stats:', error);
  }
};

export { db, auth };