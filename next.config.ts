import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'railway.com',
        pathname: '/button.svg'
      }
    ]
  }
};

export default nextConfig;
