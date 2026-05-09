import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // logo.dev CDN — campus logos
      { protocol: 'https', hostname: 'img.logo.dev' },
      // Generic fallback for any other external logo URLs stored in DB
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
