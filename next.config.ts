import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Initialize the PWA plugin
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  //Optional: Add offline fallback page
  // fallbacks: {
  //   document: '/offline',
  // }
});

const nextConfig: NextConfig = {
  /* your existing config options here */
  reactStrictMode: true,
};

// Export the config with PWA functionality
export default withPWA(nextConfig);