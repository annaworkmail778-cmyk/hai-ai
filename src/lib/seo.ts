import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { defaultLocale, localeMeta, localePath, locales, type Locale } from "@/i18n/config";

/** Canonical + hreflang alternates for a locale-relative path ("/work"). */
export function alternatesFor(path: string, locale: Locale): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeMeta[l].hreflang] = localePath(l, path);
  languages["x-default"] = localePath(defaultLocale, path);
  return { canonical: localePath(locale, path), languages };
}

function openGraphBase(locale: Locale) {
  return {
    type: "website" as const,
    siteName: brand.companyName,
    locale: localeMeta[locale].og,
    alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].og),
  };
}

/** Site-wide defaults, set once in the locale layout. */
export function baseMetadata(locale: Locale): Metadata {
  const title = `${brand.companyName} — ${brand.tagline[locale]}`;
  const description = brand.description[locale];
  return {
    metadataBase: new URL(brand.siteUrl),
    title: { default: title, template: `%s — ${brand.companyName}` },
    description,
    applicationName: brand.companyName,
    keywords: null,
    authors: [{ name: brand.companyName, url: brand.siteUrl }],
    creator: brand.companyName,
    publisher: brand.companyName,
    alternates: alternatesFor("/", locale),
    openGraph: { ...openGraphBase(locale), title, description, url: localePath(locale, "/") },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

/** Per-page metadata with localized title, description and alternates. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  type = "website",
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Use the title as-is (no "— Company" template). */
  absoluteTitle?: boolean;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} — ${brand.companyName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: alternatesFor(path, locale),
    openGraph: { ...openGraphBase(locale), type, title: fullTitle, description, url: localePath(locale, path) },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

/** Serialize JSON-LD safely for a <script> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
