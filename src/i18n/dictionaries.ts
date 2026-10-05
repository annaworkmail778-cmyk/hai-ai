import "server-only";

import en from "@/locales/en.json";
import hy from "@/locales/hy.json";
import ru from "@/locales/ru.json";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

export type { Dictionary };

/**
 * The English dictionary defines the shape every language must follow.
 * If a key is missing in hy.json or ru.json, TypeScript fails the build here.
 */
const dictionaries: Record<Locale, Dictionary> = { hy, ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
