import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        // Home owns the speed-test keyword; collapse the duplicate slug.
        source: "/typing-speed-test",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
