import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-email/components', '@react-email/render', 'google-ads-api'],
  async redirects() {
    return [
      {
        source: '/call',
        destination: 'https://cal.com/lucas-senechal/ai-discovery',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
