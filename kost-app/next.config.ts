import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for faster refresh
  reactStrictMode: true,
  
  // Reduce build time and improve performance
  swcMinify: true,
  
  // Optimize images
  images: {
    unoptimized: true, // Faster development
  },
  
  // Faster refresh
  experimental: {
    optimizePackageImports: ['@/app/components', '@/app/lib'],
  },
};

export default nextConfig;
