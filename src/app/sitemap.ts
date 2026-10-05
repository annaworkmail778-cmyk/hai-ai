import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
import { defaultLocale, localeMeta, localePath, locales } from "@/i18n/config";
import { getProjects } from "@/content/projects";

/** Every localized page, each listing its language alternates (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/work", priority: 0.9 },
    ...getProjects().map((p) => ({ path: `/work/${p.slug}`, priority: 0.8 })),
    { path: "/solutions", priority: 0.8 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
  ];

  return paths.flatMap(({ path, priority }) => {
    const languages: Record<string, string> = Object.fromEntries(
      locales.map((l) => [localeMeta[l].hreflang, `${brand.siteUrl}${localePath(l, path)}`]),
    );
    languages["x-default"] = `${brand.siteUrl}${localePath(defaultLocale, path)}`;
    return locales.map((locale) => ({
      url: `${brand.siteUrl}${localePath(locale, path)}`,
      priority,
      alternates: { languages },
    }));
  });
}
