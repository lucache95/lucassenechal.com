import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['@react-email/components', '@react-email/render'],
};

export default nextConfig;
