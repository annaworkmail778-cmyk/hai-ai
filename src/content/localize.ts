import type { Locale } from "@/i18n/config";
import type { LocalizedText, Project, ProjectContent } from "./types";

/** Pick the text for a locale, falling back to English. */
export function localize(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en;
}

/** A project's content in the requested language (English fallback). */
export function projectContent(project: Project, locale: Locale): ProjectContent {
  return project.content[locale] ?? project.content.en;
}
