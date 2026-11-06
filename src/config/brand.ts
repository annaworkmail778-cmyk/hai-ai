/**
 * BRAND CONFIGURATION — the single source of truth for company identity.
 *
 * Everything that names, describes or contacts the company is read from here:
 * navigation wordmark, footer, page titles, Open Graph images, favicons,
 * structured data (JSON-LD) and the contact page.
 *
 * Change values here — no component needs to change.
 * See BRAND_REPLACEMENT_GUIDE.md for the full checklist.
 */

import type { Locale } from "@/i18n/config";

/** Company name as it appears in the wordmark, titles and legal lines. */
export const COMPANY_NAME = "Riseup";

/** Brand tagline. English is the canonical source; translations below. */
export const TAGLINE = "AI tools that help small businesses grow.";

/** One-sentence description used for SEO and social previews. */
export const DESCRIPTION = "AI administrators, online booking, order systems, marketing and websites for businesses in Armenia.";

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
    hy: "AI գործիքներ, որոնք օգնում են փոքր բիզնեսին աճել։",
    ru: "AI-инструменты, которые помогают малому бизнесу расти.",
  } satisfies Localized,

  description: {
    en: DESCRIPTION,
    hy: "AI ադմինիստրատոր, առցանց ամրագրում, պատվերների համակարգ, մարքեթինգ և կայքեր Հայաստանի բիզնեսների համար։",
    ru: "AI-администратор, онлайн-запись, система заказов, маркетинг и сайты для бизнеса в Армении.",
  } satisfies Localized,

  logo: { type: "wordmark" } as BrandLogo,

  /**
   * The single accent colour (signal orange). Used sparingly: markers, focus
   * rings, the 3D model's light seam, diagrams and generated images.
   * Change it here; also update src/app/[lang]/icon.svg (a static file).
   */
  accent: "#ff5b14",

  email: "riseup.group.2026@gmail.com",
  /** Leave empty to hide the phone everywhere. Format: "+374 77 200 433". */
  phone: "" as string,
  address: {
    street: "",
    city: { en: "Yerevan", hy: "Երևան", ru: "Ереван" } satisfies Localized,
    country: { en: "Armenia", hy: "Հայաստան", ru: "Армения" } satisfies Localized,
    /** IANA time zone used for the live clock in the footer. */
    timeZone: "Asia/Yerevan",
  },

  /**
   * Social profiles. Empty until the real accounts exist; the footer and
   * contact page hide the list while it is empty. Example:
   *   { label: "Instagram", href: "https://www.instagram.com/riseup.am" }
   */
  socialLinks: [] as SocialLink[],

  /**
   * Public site URL used for canonical links, sitemap and Open Graph.
   * Set NEXT_PUBLIC_SITE_URL in the deployment environment.
   */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com").replace(/\/$/, ""),
} as const;

export type Brand = typeof brand;
