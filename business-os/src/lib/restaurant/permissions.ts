/*
 * Role-based permissions for Restaurant OS (demo). Navigation and actions are both checked with `can()`,
 * so a waiter really cannot open food cost or finance. Production adds server-side checks (see the architecture doc §9).
 */
import type { RoleId } from "./types.ts";

export type Permission =
  | "overview.view" | "orders.view" | "orders.accept" | "orders.void" | "orders.remake" | "kds.use" | "floor.use" | "tables.manage"
  | "menu.availability" | "menu.price" | "inventory.view" | "inventory.adjust" | "purchasing.manage" | "costs.view" | "finance.view"
  | "settings.manage" | "automations.manage";

const ALL: Permission[] = ["overview.view", "orders.view", "orders.accept", "orders.void", "orders.remake", "kds.use", "floor.use", "tables.manage", "menu.availability", "menu.price", "inventory.view", "inventory.adjust", "purchasing.manage", "costs.view", "finance.view", "settings.manage", "automations.manage"];

export const ROLE_PERMISSIONS: Record<RoleId, Permission[]> = {
  owner: ALL,
  manager: ALL.filter((p) => p !== "settings.manage"),
  waiter: ["orders.view", "orders.accept", "floor.use", "tables.manage"],
  chef: ["orders.view", "orders.remake", "orders.void", "kds.use", "menu.availability", "inventory.view", "inventory.adjust", "costs.view"],
  cook: ["kds.use", "menu.availability"],
  bartender: ["kds.use", "menu.availability"],
  cashier: ["orders.view", "orders.accept", "floor.use", "tables.manage"],
  stock: ["inventory.view", "inventory.adjust", "purchasing.manage"],
};

export const can = (role: RoleId | undefined, p: Permission) => Boolean(role && ROLE_PERMISSIONS[role].includes(p));

/** Where each role lands after "signing in" (demo role picker). */
export const HOME_OF: Record<RoleId, string> = { owner: "/r/admin", manager: "/r/admin", waiter: "/r/floor", chef: "/r/kds", cook: "/r/kds", bartender: "/r/kds?station=bar", cashier: "/r/admin/orders", stock: "/r/admin/inventory" };
