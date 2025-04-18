'use client';

import React from 'react';

export default function OfflineContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">You are offline</h1>
      <p className="mb-4">Please check your internet connection and try again.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}