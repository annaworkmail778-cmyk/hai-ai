import { locales, localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { NotFoundView, type NotFoundMessages } from "@/components/sections/NotFoundView";

/**
 * Localized 404. `not-found` receives no params, so the strings for every
 * locale are passed down and the view picks one from the current URL.
 */
export default function NotFound() {
  const messages = Object.fromEntries(
    locales.map((locale) => {
      const t = getDictionary(locale).notFound;
      return [locale, { ...t, homeHref: localePath(locale, "/"), workHref: localePath(locale, "/work") }];
    }),
  ) as Record<Locale, NotFoundMessages>;
  return <NotFoundView messages={messages} />;
}
