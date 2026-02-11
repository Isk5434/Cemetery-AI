import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure the base path matches the repo name if not a custom domain
  // basePath: '/Cemetery-AI', 
};

export default nextConfig;
