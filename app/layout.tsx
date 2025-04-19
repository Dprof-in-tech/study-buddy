import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'myStudy Buddy - AI Powered Engineering Study Tool',
  description: 'Generate study questions from your engineering materials and test your knowledge',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyStudy Buddy',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' }
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        {children}
        <footer className="py-4 bg-black">
          <div className="container mx-auto px-4 py-2">
            <p className="text-center text-sm">
              <span style={{ color: '#ffffff' }}>Powered by: </span>
              <span style={{ color: '#ffffff' }}>Grok by xAI, </span>
              <span style={{ color: '#4285F4' }}>Gemini from Google, </span>
              <span style={{ color: '#10a37f' }}>ChatGPT by OpenAI, </span>
              <span style={{ color: '#f59e0b' }}>Claude by Anthropic</span>
            </p>
          </div>
          <p className="text-base text-gray-400 text-center">
              &copy; 2025 myStudy Buddy. All rights reserved.
            </p>
        </footer>
      </body>
    </html>
  );
}
