import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // API rewrites for proxying Frappe requests (avoids CORS issues)
  async rewrites() {
    return [
      {
        source: '/api/frappe/:path*',
        destination: `${process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
  // Headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
