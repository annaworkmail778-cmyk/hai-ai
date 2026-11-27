import type { Metadata, Viewport } from "next";
import { DemoProvider } from "@/lib/client/demo-store";
// Fonts are self-hosted (public/fonts + fonts.css) instead of next/font/google: Google can answer some
// networks with /l/font?kit=… URLs that Turbopack's font loader cannot resolve, which broke `next build`.
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RISEUP Hotel OS · Demo", template: "%s · RISEUP Hotel OS" },
  description: "Interactive Hotel OS demonstration by RISEUP. Fictional hotel, demo data only.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#121212" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy">
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
