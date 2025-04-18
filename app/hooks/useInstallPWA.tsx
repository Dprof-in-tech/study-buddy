'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useInstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    
    // Store the install prompt for later use
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('PWA was installed');
    });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setInstallPrompt(null);
  };
  
  return { isInstalled, installPrompt, handleInstallClick };
}