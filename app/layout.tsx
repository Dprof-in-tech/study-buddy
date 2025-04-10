import React from "react";
import type { Metadata } from "next";
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
  title: 'Study Buddy - Engineering Study Tool',
  description: 'Generate study questions from your engineering materials and test your knowledge',
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
        <footer className="py-4 bg-white">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm">
              <span style={{ color: '#000000' }}>Powered by: </span>
              <span style={{ color: '#000000' }}>Grok by xAI, </span>
              <span style={{ color: '#4285F4' }}>Gemini from Google, </span>
              <span style={{ color: '#10a37f' }}>ChatGPT by OpenAI, </span>
              <span style={{ color: '#f59e0b' }}>Claude by Anthropic</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
