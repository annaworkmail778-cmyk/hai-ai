"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { contest } from "@/config/contest";

const KEY = "riseup-contest-banner-closed";

/**
 * Small fixed banner that announces the giveaway on every page (except the giveaway page).
 * Rendered only in the browser, so it can hide itself after the giveaway without a rebuild,
 * and it remembers when a visitor closes it.
 */
export function ContestBanner({ href, text, short, until, cta, close }: { href: string; text: string; short: string; until: string; cta: string; close: string }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const closed = (() => {
      try {
        return window.localStorage.getItem(KEY) === "1";
      } catch {
        return false;
      }
    })();
    const live = Date.now() < Date.parse(contest.hideAfter);
    if (!live || closed) return;
    // Appear once the visitor starts scrolling, so the first screen and its buttons stay clear.
    const onScroll = () => {
      if (window.scrollY > 500) {
        setShow(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show || pathname?.endsWith("/contest")) return null;

  const dismiss = () => {
    setShow(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-(--z-nav) flex justify-center sm:inset-x-auto sm:right-5 sm:bottom-5 sm:left-auto">
      <div className="flex w-full items-center sm:w-auto sm:max-w-[calc(100vw-2.5rem)] gap-3 rounded-full border border-white/10 bg-black/90 py-2 pr-2 pl-5 text-small text-paper shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur-md">
        <span aria-hidden="true" className="size-2 shrink-0 animate-pulse rounded-full bg-signal" />
        <p className="min-w-0 flex-1 leading-snug" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <span className="font-medium sm:hidden">{short}</span>
          <span className="hidden font-medium sm:inline">{text}</span> <span className="hidden text-mute sm:inline">· {until}</span>
        </p>
        <Link href={href} aria-label={cta} className="flex shrink-0 items-center gap-2 rounded-full bg-signal px-3 py-2 font-medium text-black transition-opacity hover:opacity-85 sm:px-4">
          <span className="hidden sm:inline">{cta}</span>
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
        <button type="button" onClick={dismiss} aria-label={close} className="flex size-8 shrink-0 items-center justify-center rounded-full text-mute transition-colors hover:text-paper">
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
