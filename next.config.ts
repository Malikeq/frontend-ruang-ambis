import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint warnings/errors won't fail production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors won't fail builds (still shown as warnings)
    ignoreBuildErrors: true,
  },
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
