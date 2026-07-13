"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./en";
import { hy } from "./hy";
import { ru } from "./ru";

export type Lang = "en" | "hy" | "ru";
export type Dict = typeof en;

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "hy", label: "Հայերեն", short: "ՀԱՅ" },
  { code: "ru", label: "Русский", short: "РУ" },
];

/** USD → local, approximate July 2026 rates. Base prices are authored in USD. */
const RATE: Record<Lang, number> = { en: 1, hy: 385, ru: 92 };

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge an override onto the English base. Arrays & primitives replace
 *  wholesale; override-only keys (e.g. the compare.tr map) are copied too. */
function merge<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return (override as T) ?? base;
  const out = { ...base } as Record<string, unknown>;
  const keys = new Set([...Object.keys(base as Record<string, unknown>), ...Object.keys(override)]);
  for (const key of keys) {
    const o = (override as Record<string, unknown>)[key];
    if (o === undefined) continue;
    const b = (base as Record<string, unknown>)[key];
    out[key] = isPlainObject(b) && isPlainObject(o) ? merge(b, o as DeepPartial<typeof b>) : o;
  }
  return out as T;
}

const DICTS: Record<Lang, Dict> = {
  en,
  hy: merge(en, hy),
  ru: merge(en, ru),
};

/** Format a USD base amount into the active language's currency. */
export function formatMoney(usd: number, lang: Lang, plus = false): string {
  const raw = usd * RATE[lang];
  const rounded = lang === "en" ? raw : lang === "hy" ? Math.round(raw / 100) * 100 : Math.round(raw / 10) * 10;
  const locale = lang === "ru" ? "ru-RU" : lang === "hy" ? "hy-AM" : "en-US";
  const num = rounded.toLocaleString(locale);
  const p = plus ? "+" : "";
  if (lang === "en") return `$${num}${p}`;
  if (lang === "hy") return `${num}${p} ֏`;
  return `${num}${p} ₽`;
}

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  money: (usd: number, plus?: boolean) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "hai_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Render "en" for SSR/first paint, then apply the saved language after mount
  // (avoids a hydration mismatch — this one-shot setState is intentional).
  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as Lang | null;
    if (saved === "en" || saved === "hy" || saved === "ru") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: DICTS[lang],
      money: (usd: number, plus = false) => formatMoney(usd, lang, plus),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
