/*
 * Restaurant OS business rules: costing, VAT, pricing, estimates, state machines.
 * Pure functions, shared by the reducer, the UI and the tests. Money = integer AMD.
 *
 * Costing formulas (documented in docs/RESTAURANT_OS_DATA_MODEL.md §6.1):
 *   unit cost        = ingredient cost per purchase unit / units per purchase unit
 *   line cost        = qty as served / yield × unit cost
 *   recipe cost      = Σ line costs (+ modifier deltas)
 *   net price        = price / (1 + VAT) when VAT-registered and prices include VAT, else price
 *   gross profit     = net price − recipe cost;  gross margin % = GP / net price;  food cost % = cost / net price
 */
import type { CartLine, Ingredient, MenuItem, Order, OrderStatus, RecipeLine, RestaurantState, Settings, StationId, Table, TableState, Ticket } from "./types.ts";

export const unitCost = (i: Ingredient) => i.cost / i.unitsPerPurchase;

export function linesCost(state: Pick<RestaurantState, "ingredients">, lines: RecipeLine[], costOf?: (ingredientId: string) => number) {
  let total = 0;
  const parts = lines.map((l) => {
    const ing = state.ingredients.find((x) => x.id === l.ingredientId);
    const uc = costOf ? costOf(l.ingredientId) : ing ? unitCost(ing) : 0;
    const gross = l.qty / (l.yieldPct || 1);
    const cost = gross * uc;
    total += cost;
    return { ...l, ingredient: ing, grossQty: gross, unitCost: uc, cost };
  });
  return { total, parts };
}

export const recipeOf = (state: Pick<RestaurantState, "recipes">, itemId: string) => state.recipes.find((r) => r.itemId === itemId);

/** Recipe cost of a menu item with selected modifiers (AMD, unrounded). */
export function itemCost(state: Pick<RestaurantState, "recipes" | "ingredients" | "items">, itemId: string, modifierIds: string[] = [], costOf?: (ingredientId: string) => number) {
  const r = recipeOf(state, itemId);
  const item = state.items.find((x) => x.id === itemId);
  let total = r ? linesCost(state, r.lines, costOf).total : 0;
  for (const m of modifiersOf(item, modifierIds)) if (m.recipe) total += linesCost(state, m.recipe, costOf).total;
  return total;
}

export const modifiersOf = (item: MenuItem | undefined, ids: string[]) => (item ? item.groups.flatMap((g) => g.options).filter((o) => ids.includes(o.id)) : []);

export function netOf(settings: Settings, gross: number) {
  const { registered, pricesIncludeVat, rate } = settings.vat;
  return registered && pricesIncludeVat ? gross / (1 + rate) : gross;
}

export function dishEconomics(state: RestaurantState, itemId: string, costOf?: (ingredientId: string) => number) {
  const item = state.items.find((x) => x.id === itemId)!;
  const cost = itemCost(state, itemId, [], costOf);
  const net = netOf(state.settings, item.price);
  const gp = net - cost;
  return { item, cost, net, gp, gm: net > 0 ? gp / net : 0, foodCostPct: net > 0 ? cost / net : 0 };
}

/** Validates modifier selection against group rules. Returns null when valid. */
export function modifierError(item: MenuItem, ids: string[]): string | null {
  for (const g of item.groups) {
    const n = g.options.filter((o) => ids.includes(o.id)).length;
    if (n < g.min) return `min:${g.id}`;
    if (n > g.max) return `max:${g.id}`;
  }
  const known = new Set(item.groups.flatMap((g) => g.options.map((o) => o.id)));
  if (ids.some((id) => !known.has(id))) return "unknown";
  return null;
}

/** Price of one cart line from the menu (client prices are never trusted). */
export function cartLinePrice(item: MenuItem, modifierIds: string[]) {
  return item.price + modifiersOf(item, modifierIds).reduce((s, m) => s + m.price, 0);
}

export function cartTotals(state: RestaurantState, lines: CartLine[], takeaway: boolean) {
  let subtotal = 0;
  for (const l of lines) {
    const item = state.items.find((x) => x.id === l.itemId);
    if (item) subtotal += cartLinePrice(item, l.modifierIds) * l.qty;
  }
  const fee = takeaway && subtotal > 0 ? state.settings.takeaway.serviceFee : 0;
  return { subtotal, fee, total: subtotal + fee, belowMinimum: takeaway && subtotal < state.settings.takeaway.minOrder };
}

/* ---------------- kitchen load and pickup estimates ---------------- */

/** Minutes of queued work per station: open (queued / in-progress) tickets × average prep. */
export function stationLoad(state: RestaurantState, now: number) {
  const out: Record<StationId, number> = { hot: 0, grill: 0, cold: 0, pastry: 0, bar: 0 };
  for (const t of state.tickets) {
    if (t.status !== "queued" && t.status !== "in_progress") continue;
    const order = state.orders.find((o) => o.id === t.orderId);
    const prep = Math.max(...t.lineIds.map((id) => state.items.find((i) => i.id === order?.lines.find((l) => l.id === id)?.itemId)?.prepMin ?? 5));
    const elapsed = t.startedAt ? (now - t.startedAt) / 60000 : 0;
    out[t.station] += Math.max(2, prep - elapsed);
  }
  return out;
}

/**
 * Earliest pickup = now + lead time + longest prep of the cart + queue factor (load of the busiest station used ÷ 3 cooks in parallel),
 * rounded up to the next slot. Purely rule-based, shown to the guest as an estimate.
 */
export function earliestPickup(state: RestaurantState, lines: CartLine[], now: number) {
  const { leadMin, slotMin } = state.settings.takeaway;
  const items = lines.map((l) => state.items.find((i) => i.id === l.itemId)).filter(Boolean) as MenuItem[];
  const prep = items.length ? Math.max(...items.map((i) => i.prepMin)) : 0;
  const load = stationLoad(state, now);
  const queue = items.length ? Math.max(...items.map((i) => load[i.station])) / 3 : 0;
  const minutes = leadMin + prep + Math.round(queue);
  const slot = slotMin * 60000;
  return { minutes, at: Math.ceil((now + minutes * 60000) / slot) * slot, prep, queue: Math.round(queue) };
}

/* ---------------- state machines ---------------- */

export const ORDER_NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  submitted: ["accepted", "rejected", "cancelled"],
  accepted: ["preparing", "ready", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "picked_up", "preparing", "cancelled"],
  served: ["completed", "preparing", "ready"],
  picked_up: ["completed"],
};
export const canMove = (from: OrderStatus, to: OrderStatus) => (ORDER_NEXT[from] ?? []).includes(to);
export const OPEN_ORDER: OrderStatus[] = ["submitted", "accepted", "preparing", "ready", "served"];
export const COMMITTED: OrderStatus[] = ["accepted", "preparing", "ready", "served", "picked_up", "completed"];

/**
 * Kitchen-derived status: preparing/ready come from the tickets, so the guest can never be told
 * "ready" before every station has finished.
 */
export function derivedKitchenStatus(tickets: Ticket[]): "accepted" | "preparing" | "ready" {
  const active = tickets.filter((t) => t.status !== "voided");
  if (active.length && active.every((t) => t.status === "ready" || t.status === "bumped")) return "ready";
  if (active.some((t) => t.status !== "queued")) return "preparing";
  return "accepted";
}

export function ticketAge(t: Ticket, now: number) {
  return Math.max(0, (((t.readyAt ?? now) - t.firedAt) / 60000));
}

export function tableState(state: RestaurantState, table: Table, now: number): TableState {
  if (state.cleaning.includes(table.id)) return "cleaning";
  const s = state.sessions.find((x) => x.tableId === table.id && x.status === "open");
  if (!s) {
    const res = state.reservations.find((r) => r.tableId === table.id && r.at - now < 90 * 60000 && r.at - now > -20 * 60000);
    return res ? "reserved" : "available";
  }
  if (s.billRequested || state.requests.some((r) => r.tableId === table.id && r.kind === "bill" && r.status !== "done")) return "bill";
  const orders = state.orders.filter((o) => o.sessionId === s.id && !["rejected", "cancelled"].includes(o.status));
  if (!orders.length) return "seated";
  if (orders.some((o) => o.status === "submitted")) return "ordering";
  if (orders.some((o) => ["accepted", "preparing", "ready"].includes(o.status))) return "waiting_food";
  return "eating";
}

export const orderCode = (n: number) => `S-${String(n).padStart(4, "0")}`;
