import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // swagger-ui-react still uses legacy lifecycles; Strict Mode logs noisy dev-only warnings.
  reactStrictMode: false,
  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
