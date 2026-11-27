"use client";
/* Restaurant OS demo session (client), bound to the shared kernel with its own API path and storage prefix ("rst:"). */
import { createDemoStore } from "../kernel/demo-store.tsx";
import { replay } from "./engine.ts";
import { can as canRole, type Permission } from "./permissions.ts";
import type { RestaurantEvent, RestaurantState, RStamped } from "./types.ts";

const store = createDemoStore<RestaurantState, RestaurantEvent>({
  apiBase: "/api/rsession",
  prefix: "rst",
  replay: (baseDate, events, epochAt) => replay(baseDate, events as RStamped[], epochAt),
  defaultActor: "s-lusine",
  splashClass: "bg-[#14110f]",
});

export const RestaurantProvider = store.Provider;

export function useR() {
  const ctx = store.useStore();
  const me = ctx.state.staff.find((x) => x.id === ctx.actor) ?? ctx.state.staff[1];
  const can = (p: Permission) => ctx.role === "presenter" || canRole(me.role, p);
  return { ...ctx, me, can };
}
