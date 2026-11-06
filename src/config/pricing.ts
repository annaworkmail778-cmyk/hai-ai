import type { CapabilityId } from "./navigation";

/**
 * PRICES — the single place to change what Riseup charges.
 *
 * Amounts are in Armenian dram (AMD). Plan names, descriptions and feature
 * lists are translated in src/locales/*.json → pricing.plans.<id>.
 *
 *   setup    one-time payment for building and launching (0 = none)
 *   monthly  monthly fee for hosting, AI usage, support and changes (0 = none)
 *   from     true shows "from" before the price (final price depends on scope)
 *   popular  highlights the plan as the recommended one
 */
export type Plan = {
  id: PlanId;
  product: CapabilityId;
  setup: number;
  monthly: number;
  from?: boolean;
  popular?: boolean;
};

export const planOrder = [
  "admin-start",
  "admin-pro",
  "orders",
  "real-estate",
  "marketing-local",
  "marketing-full",
  "landing",
  "website",
] as const;

export type PlanId = (typeof planOrder)[number];

export const plans: Record<PlanId, Plan> = {
  "admin-start": { id: "admin-start", product: "ai-admin", setup: 60_000, monthly: 20_000 },
  "admin-pro": { id: "admin-pro", product: "ai-admin", setup: 120_000, monthly: 35_000, popular: true },
  orders: { id: "orders", product: "orders", setup: 90_000, monthly: 25_000, from: true },
  "real-estate": { id: "real-estate", product: "real-estate", setup: 180_000, monthly: 35_000, from: true },
  "marketing-local": { id: "marketing-local", product: "marketing", setup: 0, monthly: 25_000 },
  "marketing-full": { id: "marketing-full", product: "marketing", setup: 0, monthly: 60_000 },
  landing: { id: "landing", product: "websites", setup: 120_000, monthly: 10_000, from: true },
  website: { id: "website", product: "websites", setup: 210_000, monthly: 18_000, from: true },
};

export function plansFor(product: CapabilityId): Plan[] {
  return planOrder.map((id) => plans[id]).filter((p) => p.product === product);
}

/** "120 000 ֏" — grouped with a thin space, dram sign after the number. */
export function formatAmd(amount: number) {
  return `${amount.toLocaleString("en-US").replace(/,/g, " ")} ֏`;
}
