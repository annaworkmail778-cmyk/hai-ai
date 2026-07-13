import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows a second dev server (e.g. a preview session) to run in parallel:
  // each distDir has its own dev-server lock.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
