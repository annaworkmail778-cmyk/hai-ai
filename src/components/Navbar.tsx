"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LogoMark from "./LogoMark";
import LanguageSwitcher from "./LanguageSwitcher";

const links = [
  { href: "#about", key: "about" },
  { href: "#services", key: "services" },
  { href: "#how-it-works", key: "how" },
  { href: "#results", key: "results" },
  { href: "#pricing", key: "pricing" },
  { href: "#faq", key: "faq" },
] as const;

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 transition-all duration-300 ${
          scrolled ? "glass-deep" : "glass"
        }`}
        aria-label="Main navigation"
      >
        <a href="#hero" className="flex items-center" aria-label="HAI_AI Systems — back to top">
          <LogoMark priority className="h-12 w-auto" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-4 py-2.5 font-display text-sm font-medium text-cocoa-500 transition-colors duration-200 hover:bg-white/70 hover:text-cocoa-700"
              >
                {t.nav[link.key]}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <a href="#contact" className="btn btn-primary hidden !px-6 !py-3 text-sm lg:inline-flex">
            {t.nav.getStarted}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-cocoa-600 transition-colors duration-200 hover:bg-white/70 lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* scroll progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="mx-auto mt-1.5 h-[3px] max-w-6xl origin-left rounded-full bg-rosegold"
        aria-hidden="true"
      />

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="glass-deep mx-auto mt-3 max-w-6xl rounded-4xl bg-white/95 p-4 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3.5 font-display text-base font-medium text-cocoa-600 transition-colors duration-200 hover:bg-white/80"
                  >
                    {t.nav[link.key]}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a href="#contact" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                  {t.nav.getStarted}
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
