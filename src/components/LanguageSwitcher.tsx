"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { LANGS, useI18n } from "@/lib/i18n";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.langLabel}
        className="flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 font-display text-sm font-semibold text-cocoa-600 transition-colors duration-200 hover:bg-white/70"
      >
        <Globe className="h-4 w-4 text-rosegold-500" aria-hidden="true" />
        {current.short}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t.langLabel}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="glass-deep absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-3xl bg-white/95 p-1.5 shadow-lift"
          >
            {LANGS.map((l) => {
              const active = l.code === lang;
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLang(l.code);
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left font-display text-sm font-medium transition-colors duration-200 ${
                      active ? "bg-blush-100 text-cocoa-700" : "text-cocoa-500 hover:bg-white/80"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-8 text-xs font-bold text-rosegold-500">{l.short}</span>
                      {l.label}
                    </span>
                    {active && <Check className="h-4 w-4 text-cocoa-500" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
