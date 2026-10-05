/**
 * Locale configuration. Armenian is the default language.
 * To add a language: add its code here, create src/locales/<code>.json,
 * and add translations to brand.ts and project content files.
 */
export const locales = ["hy", "ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "hy";

/** Cookie that remembers the visitor's language choice (read by src/proxy.ts). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeMeta: Record<
  Locale,
  {
    /** Short label in the switcher. */
    short: string;
    /** Native language name (used for aria-labels). */
    native: string;
    /** BCP 47 tag for hreflang and <html lang>. */
    hreflang: string;
    /** Open Graph locale. */
    og: string;
    /** Intl formatting locale. */
    intl: string;
  }
> = {
  hy: { short: "HY", native: "Հայերեն", hreflang: "hy", og: "hy_AM", intl: "hy-AM" },
  ru: { short: "RU", native: "Русский", hreflang: "ru", og: "ru_RU", intl: "ru-RU" },
  en: { short: "EN", native: "English", hreflang: "en", og: "en_US", intl: "en-US" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/**
 * Build a locale-prefixed href.
 * localePath("hy", "/work") -> "/hy/work", localePath("en", "/") -> "/en"
 */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  if (clean.startsWith("/#")) return `/${locale}${clean.slice(1)}`;
  return `/${locale}${clean}`;
}

/** Replace the locale segment of a pathname (used by the language switcher). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }
  return localePath(target, pathname);
}
