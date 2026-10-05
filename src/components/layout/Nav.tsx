"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { navItems } from "@/config/navigation";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/cn";
import { Wordmark } from "./Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { ButtonLink } from "@/components/ui/Button";
import { scrollToTarget } from "@/components/motion/scroll-store";

type NavTheme = "dark" | "light";

/**
 * Sticky navigation. Transparent at the top; once scrolled it takes a subtle
 * translucent background matched to the section beneath it. Sections declare
 * `data-nav-theme="dark|light"` (and optionally `data-nav-solid="false"`).
 */
export function Nav({
  locale,
  labels,
  email,
}: {
  locale: Locale;
  labels: Dictionary["nav"];
  email: string;
}) {
  const pathname = usePathname() || `/${locale}`;
  const navRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<NavTheme>("dark");
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const detect = () => {
      frame = 0;
      const nav = navRef.current;
      if (!nav) return;
      const y = nav.offsetHeight / 2;
      const stack = document.elementsFromPoint(window.innerWidth / 2, y);
      let nextTheme: NavTheme = "dark";
      let allowsBg = true;
      for (const el of stack) {
        if (nav.contains(el)) continue;
        const section = el.closest<HTMLElement>("[data-nav-theme]");
        if (section) {
          nextTheme = section.dataset.navTheme === "light" ? "light" : "dark";
          allowsBg = section.dataset.navSolid !== "false";
          break;
        }
      }
      setTheme(nextTheme);
      setSolid(allowsBg && window.scrollY > 24);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(detect);
    };
    detect();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Sections can change theme mid-scroll (pinned transitions) or load late.
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-nav-theme"] });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [pathname]);

  const home = localePath(locale, "/");

  const onAnchorClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      // Smooth in-page scroll when the anchor target is on the current page.
      const [path, hash] = href.split("#");
      if (hash && (path === pathname || path === "")) {
        const el = document.getElementById(hash);
        if (el) {
          e.preventDefault();
          scrollToTarget(el);
          history.replaceState(null, "", `#${hash}`);
        }
      }
    },
    [pathname],
  );

  return (
    <>
      <header
        ref={navRef}
        data-site-nav
        data-theme={theme}
        className="fixed inset-x-0 top-0 z-(--z-nav) h-(--nav-h) text-fg transition-colors duration-(--dur-ui)"
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 border-b border-rule bg-bg/75 backdrop-blur-md transition-opacity duration-(--dur-ui)",
            solid ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="shell relative flex h-full items-center justify-between gap-6">
          <Link href={home} aria-label={labels.home} className="relative -m-2 p-2">
            <Wordmark />
          </Link>

          <nav aria-label={labels.primary} className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {navItems.map((item) => {
                const href = localePath(locale, item.href);
                const active = !item.href.includes("#") && pathname.startsWith(href);
                return (
                  <li key={item.key}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={(e) => onAnchorClick(e, href)}
                      className="group relative inline-flex items-center gap-2 py-2 text-small"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1 bg-signal transition-[opacity,scale] duration-(--dur-ui)",
                          active ? "opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                        )}
                      />
                      <span className={cn("transition-colors", active ? "text-fg" : "text-fg/80 group-hover:text-fg")}>
                        {labels[item.key]}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-7 lg:flex">
            <LanguageSwitcher locale={locale} label={labels.language} />
            <ButtonLink href={localePath(locale, "/contact")} size="md" variant="outline" arrow="up-right">
              {labels.cta}
            </ButtonLink>
          </div>

          <button
            type="button"
            className="label -mr-2 flex items-center gap-3 p-2 text-fg lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span>{labels.menu}</span>
            <span aria-hidden="true" className="flex flex-col gap-[5px]">
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-5 bg-current" />
            </span>
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        locale={locale}
        labels={labels}
        email={email}
        pathname={pathname}
      />
    </>
  );
}
