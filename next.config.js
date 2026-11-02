/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Must match the backend's PORT (see mkt-tracker-backend/server.js).
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
};

module.exports = nextConfig;
