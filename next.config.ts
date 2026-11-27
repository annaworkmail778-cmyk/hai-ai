import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/*
 * Stable QR-code links for the RISEUP Hotel OS demo (separate app in business-os/).
 * Printed cards point to riseup-group.com/go/h-a (presenter A) and /go/h-b (presenter B);
 * these redirect to the current demo deployment, so cards survive a URL change.
 * Safety: only these fixed paths exist, the destination comes from a server env var
 * (https origin only, no path), redirects are temporary (307), and nothing is added
 * when BUSINESS_OS_DEMO_URL is unset. Runs before src/proxy.ts (Next.js execution order).
 */
const DEMO_URL = process.env.BUSINESS_OS_DEMO_URL?.trim().replace(/\/$/, "");
const DEMO_SESSIONS = ["a", "b"];
const demoRedirects = () =>
  DEMO_URL && /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(DEMO_URL)
    ? DEMO_SESSIONS.map((s) => ({ source: `/go/h-${s}`, destination: `${DEMO_URL}/s/${s}/hotel`, permanent: false }))
    : [];

const nextConfig: NextConfig = {
  // Allows a second dev server (e.g. a preview session) to run in parallel:
  // each distDir has its own dev-server lock.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return demoRedirects();
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
