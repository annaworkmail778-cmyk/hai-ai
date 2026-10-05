/**
 * BRAND CONFIGURATION — the single source of truth for company identity.
 *
 * Everything that names, describes or contacts the company is read from here:
 * navigation wordmark, footer, page titles, Open Graph images, favicons,
 * structured data (JSON-LD) and the contact page.
 *
 * The values below are TEMPORARY PLACEHOLDERS. Replace them when the final
 * identity is decided — no component needs to change.
 * See BRAND_REPLACEMENT_GUIDE.md for the full checklist.
 */

import type { Locale } from "@/i18n/config";

/** Company name as it appears in the wordmark, titles and legal lines. */
export const COMPANY_NAME = "YOUR COMPANY";

/** Brand tagline. English is the canonical source; translations below. */
export const TAGLINE = "Technology built around business.";

/** One-sentence description used for SEO and social previews. */
export const DESCRIPTION = "AI, automation and software systems for modern businesses.";

type Localized = Record<Locale, string>;

export type SocialLink = {
  /** Visible label, e.g. "LinkedIn". */
  label: string;
  /** Full URL. */
  href: string;
};

export type BrandLogo =
  /** Text wordmark rendered from `companyName` (current placeholder). */
  | { type: "wordmark" }
  /**
   * Final logo file placed in /public/brand/.
   * Use a single-colour SVG drawn in `currentColor` so it adapts to
   * dark and light sections automatically.
   */
  | { type: "svg"; src: string; width: number; height: number };

export const brand = {
  companyName: COMPANY_NAME,
  /** Registered legal name for the copyright line. */
  legalName: COMPANY_NAME,

  tagline: {
    en: TAGLINE,
    hy: "Տեխնոլոգիա՝ կառուցված բիզնեսի շուրջ։",
    ru: "Технологии, выстроенные вокруг бизнеса.",
  } satisfies Localized,

  description: {
    en: DESCRIPTION,
    hy: "AI, ավտոմատացում և ծրագրային համակարգեր ժամանակակից բիզնեսի համար։",
    ru: "AI, автоматизация и программные системы для современного бизнеса.",
  } satisfies Localized,

  logo: { type: "wordmark" } as BrandLogo,

  /**
   * The single accent colour (signal orange). Used sparingly: markers, focus
   * rings, the 3D model's light seam, diagrams and generated images.
   * Change it here; also update src/app/[lang]/icon.svg (a static file).
   */
  accent: "#ff5b14",

  /** PLACEHOLDER contact details — replace before launch. */
  email: "hello@example.com",
  phone: "+374 00 000 000",
  address: {
    street: "",
    city: { en: "Yerevan", hy: "Երևան", ru: "Ереван" } satisfies Localized,
    country: { en: "Armenia", hy: "Հայաստան", ru: "Армения" } satisfies Localized,
    /** IANA time zone used for the live clock in the footer. */
    timeZone: "Asia/Yerevan",
  },

  /** PLACEHOLDER social profiles — point these at the real accounts. */
  socialLinks: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Telegram", href: "https://telegram.org/" },
    { label: "Behance", href: "https://www.behance.net/" },
  ] satisfies SocialLink[],

  /**
   * Public site URL used for canonical links, sitemap and Open Graph.
   * Set NEXT_PUBLIC_SITE_URL in the deployment environment.
   */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com").replace(/\/$/, ""),
} as const;

export type Brand = typeof brand;
