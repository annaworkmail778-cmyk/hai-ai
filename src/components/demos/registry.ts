import { leadDemo } from "./lead";
import { bookingDemo } from "./booking";
import { realEstateDemo } from "./realestate";
import { supportDemo } from "./support";
import { opsDemo } from "./ops";
import { webDemo } from "./web";
import type { DemoDefinition } from "./types";

/** Every interactive demo, by id. Reference these ids from project files (`demo`). */
export const demos = {
  lead: leadDemo,
  booking: bookingDemo,
  realestate: realEstateDemo,
  support: supportDemo,
  ops: opsDemo,
  web: webDemo,
} satisfies Record<string, DemoDefinition>;

export type DemoId = keyof typeof demos;
