import type { NextConfig } from "next";

// Posts and pages deleted in the 2026-10 content cut. Bing still lists them
// as 404 warnings. Each one goes to the nearest live page; a removed post
// with no clear match (e.g. best-free-typing-games) is left as a 404.
const removedPages: Record<string, string> = {
  "/what-is-a-good-typing-speed": "/blog/good-typing-speed",
  "/how-many-wpm-should-you-type": "/blog/good-typing-speed",
  "/average-typing-speed-statistics": "/blog/good-typing-speed",
  "/blog/how-many-words-per-minute": "/blog/good-typing-speed",
  "/blog/average-typing-speed": "/blog/good-typing-speed",
  "/blog/typing-speed-for-work": "/blog/data-entry-typing-test",
  "/blog/touch-typing-guide": "/blog/touch-typing-for-beginners",
  "/blog/how-to-learn-touch-typing-as-an-adult": "/blog/touch-typing-for-beginners",
  "/blog/typing-accuracy-test": "/blog/improve-typing-accuracy",
  "/blog/best-keyboards-for-fast-typing": "/blog/mechanical-vs-membrane-keyboards",
  "/blog/type-numbers-and-symbols-without-looking": "/number-row-typing-test",
  "/blog/typing-practice": "/typing-practice",
  "/blog/typing-speed-test": "/",
  "/blog/free-typing-test": "/",
  "/blog/5-minute-typing-test": "/5-minute-typing-test",
  "/blog/3-minute-typing-test-vs-5-minute-typing-test": "/3-minute-typing-test",
  "/blog/one-minute-typing-test": "/1-minute-typing-test",
};

const nextConfig: NextConfig = {
  output: "standalone",
  // The standalone bundle only copies the files it can trace; the account database's migrations are read at run time.
  outputFileTracingIncludes: { "/api/**": ["./drizzle/**/*"] },
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        // The site answered on both hosts; the canonical is the bare domain.
        source: "/:path*",
        has: [{ type: "host", value: "www.freetyper.com" }],
        destination: "https://freetyper.com/:path*",
        permanent: true,
      },
      {
        // Home owns the speed-test keyword; collapse the duplicate slug.
        source: "/typing-speed-test",
        destination: "/",
        permanent: true,
      },
      {
        // People also try /typing-test; the home page is that test.
        source: "/typing-test",
        destination: "/",
        permanent: true,
      },
      ...Object.entries(removedPages).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
