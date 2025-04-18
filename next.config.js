/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  //disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // Specify the offline page
  fallbacks: {
    document: '/offline'
  }
});

const nextConfig = {
  /* your existing config options here */
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);