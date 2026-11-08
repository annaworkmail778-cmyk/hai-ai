import type { CapabilityId } from "./navigation";

/**
 * PRICES — the single place to change what Riseup charges.
 *
 * Amounts are in Armenian dram (AMD). Plan names, descriptions and feature
 * lists are translated in src/locales/*.json → pricing.plans.<id>.
 *
 *   setup    one-time payment for building and launching (0 = none)
 *   monthly  monthly fee for hosting, AI usage, support and changes (0 = none;
 *            with setup > 0 this is a one-time job, e.g. a video)
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
  "ai-video",
  "landing",
  "website",
  "shop",
  "premium-3d",
] as const;

export type PlanId = (typeof planOrder)[number];

export const plans: Record<PlanId, Plan> = {
  "admin-start": { id: "admin-start", product: "ai-admin", setup: 45_000, monthly: 15_000 },
  "admin-pro": { id: "admin-pro", product: "ai-admin", setup: 90_000, monthly: 25_000, popular: true },
  orders: { id: "orders", product: "orders", setup: 70_000, monthly: 20_000, from: true },
  "real-estate": { id: "real-estate", product: "real-estate", setup: 140_000, monthly: 25_000, from: true },
  "marketing-local": { id: "marketing-local", product: "marketing", setup: 0, monthly: 20_000 },
  "marketing-full": { id: "marketing-full", product: "marketing", setup: 0, monthly: 45_000 },
  "ai-video": { id: "ai-video", product: "marketing", setup: 25_000, monthly: 0, from: true },
  landing: { id: "landing", product: "websites", setup: 80_000, monthly: 8_000, from: true },
  website: { id: "website", product: "websites", setup: 150_000, monthly: 12_000, from: true },
  shop: { id: "shop", product: "websites", setup: 150_000, monthly: 12_000, from: true },
  "premium-3d": { id: "premium-3d", product: "websites", setup: 250_000, monthly: 15_000, from: true },
};

export function plansFor(product: CapabilityId): Plan[] {
  return planOrder.map((id) => plans[id]).filter((p) => p.product === product);
}

/** "120 000 ֏" — grouped with a thin space, dram sign after the number. */
export function formatAmd(amount: number) {
  return `${amount.toLocaleString("en-US").replace(/,/g, " ")} ֏`;
}
