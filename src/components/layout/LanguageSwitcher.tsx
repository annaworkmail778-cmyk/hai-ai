"use client";

import Link from "next/link";
import { Fragment, useEffect } from "react";
import { usePathname } from "next/navigation";
import { locales, localeMeta, switchLocalePath, type Locale } from "@/i18n/config";
import { rememberLocale } from "./locale-cookie";
import { cn } from "@/lib/cn";

/** HY / RU / EN — keeps the current page, remembers the choice. */
export function LanguageSwitcher({
  locale,
  label,
  className,
  size = "sm",
}: {
  locale: Locale;
  label: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  const pathname = usePathname() || `/${locale}`;

  return (
    <nav aria-label={label} className={cn("flex items-center", className)}>
      <ul className={cn("flex items-center", size === "lg" ? "gap-4" : "gap-2")}>
        {locales.map((code, i) => {
          const active = code === locale;
          return (
            <Fragment key={code}>
              {i > 0 && (
                <li aria-hidden="true" className="text-fg-mute/50 select-none">
                  /
                </li>
              )}
              <li>
                <Link
                  href={switchLocalePath(pathname, code)}
                  hrefLang={localeMeta[code].hreflang}
                  lang={localeMeta[code].hreflang}
                  aria-label={localeMeta[code].native}
                  aria-current={active ? "true" : undefined}
                  prefetch={false}
                  onClick={() => rememberLocale(code)}
                  className={cn(
                    "label inline-block py-2 transition-colors duration-(--dur-micro)",
                    size === "lg" && "text-small",
                    active ? "text-fg" : "text-fg-mute hover:text-fg",
                  )}
                >
                  {localeMeta[code].short}
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
}

/** Keeps the locale cookie in sync with the language being viewed. */
export function LocaleSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    rememberLocale(locale);
  }, [locale]);
  return null;
}
