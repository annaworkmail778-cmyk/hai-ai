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
    formatDetection: { telephone: false, email: false, address: false },
  };
}

/**
 * The generated share card of a locale (app/[lang]/opengraph-image.tsx).
 * Pages that set their own `openGraph` replace the inherited one, so they
 * reference the card explicitly. A route with its own opengraph-image file
 * (case studies) still wins over this config value.
 */
function shareImage(locale: Locale) {
  return {
    url: localePath(locale, "/opengraph-image"),
    width: 1200,
    height: 630,
    alt: `${brand.companyName} — ${brand.tagline[locale]}`,
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
  ownImage = false,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Use the title as-is (no "— Company" template). */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  /** The route has its own opengraph-image file; don't reference the locale card. */
  ownImage?: boolean;
}): Metadata {
  // Omit the key entirely when the route has its own image file: even an
  // `images: undefined` entry would replace the file-based image.
  const images = ownImage ? {} : { images: [shareImage(locale)] };
  const fullTitle = absoluteTitle ? title : `${title} — ${brand.companyName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: alternatesFor(path, locale),
    openGraph: {
      ...openGraphBase(locale),
      type,
      title: fullTitle,
      description,
      url: localePath(locale, path),
      ...images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, ...images },
  };
}

/** Serialize JSON-LD safely for a <script> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
