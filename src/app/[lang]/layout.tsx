import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Noto_Sans_Armenian } from "next/font/google";
import "@/styles/site.css";

import { brand } from "@/config/brand";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import { baseMetadata } from "@/lib/seo";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { LocaleSync } from "@/components/layout/LanguageSwitcher";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/cursor/CustomCursor";

/* Latin + Cyrillic display/body face. */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

/* Technical labels. */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});

/* Armenian script — per-glyph fallback after Geist in the font stack. */
const armenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  variable: "--font-armenian",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return baseMetadata(lang);
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <div
      lang={lang}
      data-theme="dark"
      className={cn("site", geist.variable, geistMono.variable, armenian.variable)}
      style={{ "--color-signal": brand.accent } as CSSProperties}
    >
      <a
        href="#main"
        className="label fixed top-3 left-3 z-(--z-skip) -translate-y-24 bg-signal px-4 py-3 text-black transition-transform focus-visible:translate-y-0"
      >
        {dict.common.skipToContent}
      </a>
      <LocaleSync locale={lang} />
      <SmoothScroll />
      <Nav locale={lang} labels={dict.nav} email={brand.email} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer locale={lang} dict={dict} />
      <CustomCursor viewLabel={dict.common.view} />
    </div>
  );
}
