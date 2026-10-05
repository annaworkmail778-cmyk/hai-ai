import { NextResponse, type NextRequest } from "next/server";

/*
 * Locale routing. Every page lives under /hy, /ru or /en.
 * Requests without a locale prefix are redirected to the visitor's saved
 * language (NEXT_LOCALE cookie, set by the language switcher) or to the
 * default, Armenian.
 *
 * Kept self-contained (no shared imports) so it stays tiny at the edge of
 * the request pipeline. Keep these values in sync with src/i18n/config.ts.
 */
const LOCALES = ["hy", "ru", "en"];
const DEFAULT_LOCALE = "hy";
const COOKIE = "NEXT_LOCALE";

/** Routes of the previous website that are still served as-is. */
const LEGACY_PATHS = ["/creation"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const first = pathname.split("/")[1] ?? "";
  if (LOCALES.includes(first)) return NextResponse.next();
  if (LEGACY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();

  const saved = request.cookies.get(COOKIE)?.value;
  const locale = saved && LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Skip Next internals, API routes, generated icons and any file with an extension.
  matcher: ["/((?!_next|api|icon|apple-icon|.*\\..*).*)"],
};
