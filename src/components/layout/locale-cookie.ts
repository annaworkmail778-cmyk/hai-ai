"use client";

import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

/** Persist the visitor's language for one year (read by src/proxy.ts). */
export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
