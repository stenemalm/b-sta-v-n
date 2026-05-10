import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.zoodrop.de' },
    ],
  },
};

export default nextConfig;
