import { salonDemo } from "./salon";
import { shopDemo } from "./shop";
import { realEstateDemo } from "./realestate";
import { marketingDemo } from "./marketing";
import { webDemo } from "./web";
import type { DemoDefinition } from "./types";

/** Every interactive demo, by id — one per Riseup product. Reference these ids from project files (`demo`). */
export const demos = {
  salon: salonDemo,
  shop: shopDemo,
  realestate: realEstateDemo,
  marketing: marketingDemo,
  web: webDemo,
} satisfies Record<string, DemoDefinition>;

export type DemoId = keyof typeof demos;
