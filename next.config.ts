import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.bigbuy.eu' },
      { protocol: 'https', hostname: 'cdn.bigbuy.eu' },
      { protocol: 'https', hostname: 'images.ctfassets.net' },
      { protocol: 'https', hostname: 'assets.acana.com' },
      { protocol: 'https', hostname: '**.trixie.de' },
      { protocol: 'https', hostname: 'www.calibra.eu' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
