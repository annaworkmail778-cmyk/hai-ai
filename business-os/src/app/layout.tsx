import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Armenian, Noto_Serif_Armenian } from "next/font/google";
import { VerticalProvider } from "@/components/shared/vertical-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const arm = Noto_Sans_Armenian({ subsets: ["armenian"], variable: "--font-arm", display: "swap" });
const serif = Cormorant_Garamond({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], variable: "--font-serif-latin", display: "swap" });
const serifArm = Noto_Serif_Armenian({ subsets: ["armenian"], weight: ["400", "500", "600"], variable: "--font-serif-arm", display: "swap" });

export const metadata: Metadata = {
  title: { default: "RISEUP Hotel OS · Demo", template: "%s · RISEUP Hotel OS" },
  description: "Interactive Hotel OS demonstration by RISEUP. Fictional hotel, demo data only.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#121212" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" className={`${inter.variable} ${arm.variable} ${serif.variable} ${serifArm.variable}`}>
      <body>
        <VerticalProvider>{children}</VerticalProvider>
      </body>
    </html>
  );
}
