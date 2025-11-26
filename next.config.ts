import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  // Optimize images
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },

  // Turbopack config (empty to silence webpack warning)
  turbopack: {},

  // API Proxy Rewrites
  async rewrites() {
    return [
      {
        source: '/api/subscribers/:path*',
        destination: 'http://10.66.0.2:8400/:path*',
      },
      {
        source: '/api/executives/:path*',
        destination: 'http://10.66.0.2:8250/:path*',
      },
      {
        source: '/api/multichannel/:path*',
        destination: 'http://10.66.0.2:8450/:path*',
      },
      {
        source: '/api/voice/:path*',
        destination: 'http://10.66.0.2:8500/:path*',
      },
    ];
  },
};

export default nextConfig;
