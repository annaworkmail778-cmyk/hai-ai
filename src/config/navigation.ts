import type { Dictionary } from "@/i18n/types";

type NavKey = keyof Dictionary["nav"];

/** Primary navigation. Paths are locale-relative (prefixed at render time). */
export const navItems = [
  { key: "work", href: "/work" },
  { key: "solutions", href: "/solutions" },
  { key: "process", href: "/#process" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ key: NavKey; href: string }>;

/** Order of capabilities across the site (keys of dictionary.capabilities.items). */
export const capabilityOrder = [
  "ai-systems",
  "automation",
  "custom-software",
  "business-applications",
  "web-experiences",
  "sales-systems",
  "internal-tools",
] as const;

export type CapabilityId = (typeof capabilityOrder)[number];
