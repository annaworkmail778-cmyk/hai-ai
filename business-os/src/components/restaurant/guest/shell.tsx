"use client";
/* Summit Table guest site chrome: header with language switch, footer with demo notice, scroll-reveal helper. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { LANGS, t } from "@/lib/restaurant/i18n";
import type { Lang } from "@/lib/restaurant/types";

export const money = (n: number) => `${Math.round(n).toLocaleString("en-US").replace(/,/g, " ")} ֏`;

/** Adds `is-in` to `.rt-reveal` / `.rt-clip` children when they scroll into view. */
export function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".rt-reveal, .rt-clip");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
  return ref;
}

export const RESERVE: Record<Lang, string> = { hy: "Ամրագրել սեղան", ru: "Забронировать", en: "Book a table" };

export function LangSwitch({ lang }: { lang: Lang }) {
  const path = usePathname() ?? `/restaurant/${lang}`;
  return (
    <div className="flex rounded-full border border-[var(--rt-line)] p-0.5 text-[12px] font-semibold">
      {LANGS.map((l) => (
        <Link key={l} href={path.replace(/^\/restaurant\/(hy|ru|en)/, `/restaurant/${l}`) + (typeof window !== "undefined" ? window.location.search : "")} className={cn("rounded-full px-2.5 py-1 uppercase", l === lang ? "bg-[var(--rt-text)] text-[var(--rt-bg)]" : "text-[var(--rt-muted)]")} aria-current={l === lang ? "true" : undefined}>
          {l === "hy" ? "Հայ" : l}
        </Link>
      ))}
    </div>
  );
}

export function GuestShell({ lang, children, overlay }: { lang: Lang; children: ReactNode; overlay?: boolean }) {
  const { state, setRole } = useR();
  useEffect(() => { setRole("guest"); document.documentElement.lang = lang; }, [setRole, lang]);
  const b = state.brand;
  return (
    <div className="rt" data-theme={b.theme === "family" ? "family" : "fine"}>
      <header className={cn("z-30 flex h-16 items-center gap-3 px-4 sm:px-8", overlay ? "absolute inset-x-0 top-0" : "sticky top-0 border-b border-[var(--rt-line)] bg-[color-mix(in_srgb,var(--rt-bg)_88%,transparent)] backdrop-blur")}>
        <Link href={`/restaurant/${lang}`} className="rt-serif text-[22px] leading-none tracking-tight">{b.name}</Link>
        <nav className="ml-auto hidden items-center gap-6 text-[14px] text-[var(--rt-muted)] md:flex">
          <Link href={`/restaurant/${lang}/menu`} className="hover:text-[var(--rt-text)]">{t("menu", lang)}</Link>
          <Link href={`/restaurant/${lang}/menu?mode=takeaway`} className="hover:text-[var(--rt-text)]">{t("takeaway", lang)}</Link>
          <Link href={`/restaurant/${lang}/reserve`} className="hover:text-[var(--rt-text)]">{RESERVE[lang]}</Link>
          <a href={`/restaurant/${lang}#visit`} className="hover:text-[var(--rt-text)]">{t("visit", lang)}</a>
        </nav>
        <Link href={`/restaurant/${lang}/reserve`} className="ml-auto rounded-full border border-[var(--rt-line)] px-3 py-1.5 text-[12.5px] md:hidden">{RESERVE[lang]}</Link>
        <div className="md:ml-4"><LangSwitch lang={lang} /></div>
      </header>
      {children}
      <footer className="border-t border-[var(--rt-line)] px-5 py-10 text-[13px] text-[var(--rt-faint)] sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><span className="rt-serif text-[18px] text-[var(--rt-text)]">{b.name}</span> · {b.city[lang]}</div>
          <div className="flex items-center gap-2"><Icon name="info" size={14} />{t("demoNotice", lang)}</div>
          <div>{t("poweredBy", lang)}</div>
        </div>
      </footer>
    </div>
  );
}
