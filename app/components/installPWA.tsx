'use client';

import React from 'react';
import { useInstallPWA } from '../hooks/useInstallPWA';

const InstallPWA: React.FC = () => {
  const { isInstalled, installPrompt, handleInstallClick } = useInstallPWA();
  
  if (isInstalled) return null;
  
  return installPrompt ? (
    <button 
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
    >
      Install App
    </button>
  ) : null;
};

export default InstallPWA;