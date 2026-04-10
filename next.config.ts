import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for faster refresh
  reactStrictMode: true,
  
  // Optimize images for Vercel
  images: {
    unoptimized: false, // Let Vercel optimize images
  },
  
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['@/app/components', '@/app/lib'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
