"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { navItems } from "@/config/navigation";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { pad2 } from "@/i18n/format";
import { gsap } from "@/components/motion/gsap";
import { getLenis } from "@/components/motion/scroll-store";
import { media } from "@/config/motion";
import { Wordmark } from "./Wordmark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ButtonLink } from "@/components/ui/Button";

function lockScroll(lock: boolean) {
  const lenis = getLenis();
  if (lock) {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  } else {
    lenis?.start();
    document.documentElement.style.overflow = "";
  }
}

/** Full-screen menu for small screens. Modal dialog with focus trap. */
export function MobileMenu({
  open,
  onClose,
  locale,
  labels,
  email,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  labels: Dictionary["nav"];
  email: string;
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const firstRender = useRef(true);

  // Close when the route changes (a link inside the menu was followed).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname && open) onClose();
    lastPath.current = pathname;
  }, [pathname, open, onClose]);

  // Open / close choreography.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const items = panel.querySelectorAll<HTMLElement>("[data-menu-item]");
    const reduce = window.matchMedia(media.reducedMotion).matches;

    if (firstRender.current) {
      firstRender.current = false;
      gsap.set(panel, { autoAlpha: 0 });
      return;
    }

    if (open) {
      returnFocus.current = document.activeElement as HTMLElement;
      lockScroll(true);
      if (reduce) {
        gsap.set(panel, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
      } else {
        gsap
          .timeline()
          .set(panel, { autoAlpha: 1 })
          .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" })
          .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 }, "-=0.35");
      }
      closeRef.current?.focus();
    } else {
      lockScroll(false);
      if (reduce) {
        gsap.set(panel, { autoAlpha: 0 });
      } else {
        gsap.to(panel, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.6,
          ease: "expo.inOut",
          onComplete: () => {
            gsap.set(panel, { autoAlpha: 0 });
          },
        });
      }
      returnFocus.current?.focus?.();
    }
  }, [open]);

  // Escape + focus trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Never leave the page locked if the component unmounts while open.
  useEffect(() => () => lockScroll(false), []);

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={labels.menu}
      data-theme="dark"
      className="invisible fixed inset-0 z-(--z-menu) flex flex-col bg-bg text-fg lg:hidden"
    >
      <div className="shell flex h-(--nav-h) shrink-0 items-center justify-between">
        <Link href={localePath(locale, "/")} onClick={onClose} aria-label={labels.home} className="-m-2 p-2">
          <Wordmark />
        </Link>
        <button ref={closeRef} type="button" onClick={onClose} className="label -mr-2 flex items-center gap-3 p-2">
          <span>{labels.close}</span>
          <span aria-hidden="true" className="relative block size-4">
            <span className="absolute top-1/2 left-0 block h-px w-4 rotate-45 bg-current" />
            <span className="absolute top-1/2 left-0 block h-px w-4 -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      <nav aria-label={labels.primary} className="shell flex flex-1 flex-col justify-center">
        <ul className="border-t border-rule">
          {navItems.map((item, i) => {
            const href = localePath(locale, item.href);
            return (
              <li key={item.key} className="overflow-hidden border-b border-rule">
                <Link
                  href={href}
                  onClick={onClose}
                  data-menu-item
                  className="flex items-baseline justify-between py-4 text-display-m font-medium"
                >
                  <span>{labels[item.key]}</span>
                  <span className="label text-fg-mute">{pad2(i + 1)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shell flex shrink-0 flex-col gap-6 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-4">
          <LanguageSwitcher locale={locale} label={labels.language} size="lg" />
          <a href={`mailto:${email}`} className="text-small text-fg-mute">
            {email}
          </a>
        </div>
        <ButtonLink href={localePath(locale, "/contact")} onClick={onClose} className="w-full" magnetic={false}>
          {labels.cta}
        </ButtonLink>
      </div>
    </div>
  );
}
