const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: tell Next.js that THIS directory is the project root,
  // silencing the "multiple lockfiles" warning from the monorepo structure.
  outputFileTracingRoot: path.join(__dirname),

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

module.exports = nextConfig;
