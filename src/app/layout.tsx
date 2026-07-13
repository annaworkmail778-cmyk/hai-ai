import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAI_AI Systems — Smarter Business Starts with AI",
  description:
    "We build intelligent AI agents and automation systems that save time, reduce costs, and help businesses grow faster.",
  keywords: [
    "AI automation",
    "AI agents",
    "chatbots",
    "workflow automation",
    "CRM integration",
    "business automation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} h-full scroll-smooth`}>
      <body className="min-h-full antialiased bg-page">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
