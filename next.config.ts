import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.zoodrop.de' },
      { protocol: 'https', hostname: 'media.zooplus.com' },
    ],
  },
};

export default nextConfig;
