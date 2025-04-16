

// pages/index.tsx
'use client';

import LandingPage from "./components/LandingPage";
import { useEffect } from "react";
import { getCurrentUser } from "@/lib/firebase";

export default function Home() {
  useEffect(() => {
    // Initialize anonymous authentication on page load
    const initAuth = async () => {
      try {
        await getCurrentUser();
      } catch (error) {
        console.error('Error initializing authentication:', error);
      }
    };
    
    initAuth();
  }, []);

  return <LandingPage />;
}