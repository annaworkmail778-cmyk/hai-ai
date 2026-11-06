import type { Dictionary } from "@/i18n/types";

type NavKey = keyof Dictionary["nav"];

/** Primary navigation. Paths are locale-relative (prefixed at render time). */
export const navItems = [
  { key: "work", href: "/work" },
  { key: "solutions", href: "/solutions" },
  { key: "pricing", href: "/pricing" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ key: NavKey; href: string }>;

/**
 * The five Riseup products, in display order (keys of dictionary.capabilities.items
 * and dictionary.solutions.items). Prices live in src/config/pricing.ts.
 */
export const capabilityOrder = ["ai-admin", "orders", "real-estate", "marketing", "websites"] as const;

export type CapabilityId = (typeof capabilityOrder)[number];
