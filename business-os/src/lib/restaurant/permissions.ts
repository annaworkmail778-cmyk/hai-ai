/*
 * Role-based permissions for Restaurant OS (demo). Navigation and actions are both checked with `can()`,
 * and the reducer re-checks the sensitive ones (payment recording, ticket reopen, purchase approval).
 * Production: the same matrix is enforced server-side on every API call (see docs/RESTAURANT_OS_SECURITY_REQUIREMENTS.md).
 */
import type { RoleId } from "./types.ts";

export type Permission =
  | "overview.view" | "orders.view" | "orders.accept" | "orders.void" | "orders.remake" | "kds.use" | "kds.reopen" | "floor.use" | "tables.manage" | "tables.transfer" | "floor.edit"
  | "bill.manage" | "payment.record" | "reservations.manage" | "inbox.use" | "inbox.settings" | "reviews.reply" | "crm.view" | "team.view" | "team.manage"
  | "menu.availability" | "menu.price" | "inventory.view" | "inventory.adjust" | "purchasing.manage" | "purchasing.approve" | "costs.view" | "finance.view"
  | "assistant.use" | "settings.manage" | "automations.manage";

const ALL: Permission[] = ["overview.view", "orders.view", "orders.accept", "orders.void", "orders.remake", "kds.use", "kds.reopen", "floor.use", "tables.manage", "tables.transfer", "floor.edit", "bill.manage", "payment.record", "reservations.manage", "inbox.use", "inbox.settings", "reviews.reply", "crm.view", "team.view", "team.manage", "menu.availability", "menu.price", "inventory.view", "inventory.adjust", "purchasing.manage", "purchasing.approve", "costs.view", "finance.view", "assistant.use", "settings.manage", "automations.manage"];

export const ROLE_PERMISSIONS: Record<RoleId, Permission[]> = {
  owner: ALL,
  manager: ALL.filter((p) => p !== "settings.manage"),
  host: ["floor.use", "tables.manage", "reservations.manage", "inbox.use", "crm.view", "team.view"],
  waiter: ["orders.view", "orders.accept", "floor.use", "tables.manage", "tables.transfer", "bill.manage", "team.view"],
  chef: ["orders.view", "orders.remake", "orders.void", "kds.use", "kds.reopen", "menu.availability", "inventory.view", "inventory.adjust", "costs.view", "team.view"],
  cook: ["kds.use", "menu.availability", "team.view"],
  bartender: ["kds.use", "menu.availability", "team.view"],
  cashier: ["orders.view", "orders.accept", "floor.use", "tables.manage", "bill.manage", "payment.record", "team.view"],
  stock: ["inventory.view", "inventory.adjust", "purchasing.manage", "team.view"],
};

export const can = (role: RoleId | undefined, p: Permission) => Boolean(role && ROLE_PERMISSIONS[role].includes(p));

/** Where each role lands after "signing in" (demo role picker). */
export const HOME_OF: Record<RoleId, string> = { owner: "/r/admin", manager: "/r/admin", host: "/r/host", waiter: "/r/floor", chef: "/r/kds", cook: "/r/kds", bartender: "/r/kds?station=bar", cashier: "/r/floor", stock: "/r/admin/inventory" };
