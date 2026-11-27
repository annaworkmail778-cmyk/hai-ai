/* Restaurant OS domain tests (Summit Table demo). */
import assert from "node:assert/strict";
import test from "node:test";
import { apply, baseState, onHand, replay } from "../src/lib/restaurant/engine.ts";
import * as A from "../src/lib/restaurant/analytics.ts";
import { can } from "../src/lib/restaurant/permissions.ts";
import { dishEconomics, earliestPickup, itemCost, tableState } from "../src/lib/restaurant/rules.ts";
import type { RestaurantEvent, RestaurantState, RStamped } from "../src/lib/restaurant/types.ts";

const BASE = "2026-11-27";
const E = Date.parse("2026-11-27T16:15:00Z");
let n = 0;
const ev = (e: RestaurantEvent, by = "s-lusine", at = E + ++n * 1000): RStamped => ({ ...e, id: `t${n}`, at, by } as RStamped);
const fresh = () => baseState(BASE, E);
const run = (s: RestaurantState, e: RestaurantEvent, by?: string) => { const x = ev(e, by); apply(s, x); return x; };
const T7 = "h2v4"; // token of table T7 (free in the seed)
const qr = (s: RestaurantState, lines: { itemId: string; qty: number; modifierIds: string[]; note: string }[]) => {
  const x = run(s, { type: "order.submit", channel: "qr", orderType: "dine_in", tableToken: T7, note: "", lines }, "guest");
  return s.orders.find((o) => o.id === `o-${x.id}`);
};
const L = (itemId: string, qty = 1, modifierIds: string[] = [], note = "") => ({ itemId, qty, modifierIds, note });
const tickets = (s: RestaurantState, orderId: string) => s.tickets.filter((t) => t.orderId === orderId);

test("seed is deterministic and the history is shared read-only between replays", () => {
  const a = replay(BASE, [], E), b = replay(BASE, [], E);
  assert.deepEqual({ ...a, history: null }, { ...b, history: null });
  assert.equal(a.history, b.history);
  assert.ok(Object.isFrozen(a.history.orders));
  assert.ok(a.history.orders.length > 1500);
});

test("replay is fast enough for a phone (memoised seed)", () => {
  replay(BASE, [], E);
  const t = performance.now();
  for (let i = 0; i < 10; i++) replay(BASE, [ev({ type: "notices.read" })], E);
  assert.ok((performance.now() - t) / 10 < 40);
});

test("QR order: correct table, menu prices only, waiting until a staff member accepts", () => {
  const s = fresh();
  const o = qr(s, [{ ...L("khorovats", 2, ["large"]), price: 1 } as never]);
  assert.ok(o);
  assert.equal(o!.tableId, "T7");
  assert.equal(o!.status, "submitted");
  assert.equal(o!.subtotal, (8900 + 6900) * 2);
  assert.equal(tickets(s, o!.id).length, 0);
  run(s, { type: "order.accept", orderId: o!.id }, "s-ani");
  assert.equal(o!.status, "accepted");
});

test("sold-out items, unknown items and invalid quantities are rejected", () => {
  const s = fresh();
  run(s, { type: "menu.availability", itemId: "salmon", available: false });
  assert.equal(qr(s, [L("salmon")]), undefined);
  assert.equal(qr(s, [L("nope")]), undefined);
  assert.equal(qr(s, [L("salad", 0)]), undefined);
  assert.equal(qr(s, [L("salad", 99)]), undefined);
});

test("modifier rules are enforced (required group, max, unknown option)", () => {
  const s = fresh();
  assert.equal(qr(s, [L("ribeye")]), undefined, "doneness required");
  assert.equal(qr(s, [L("ribeye", 1, ["rare", "well"])]), undefined, "max 1");
  assert.equal(qr(s, [L("salad", 1, ["bacon"])]), undefined, "unknown option");
  assert.ok(qr(s, [L("ribeye", 1, ["medium"])]));
});

test("unknown QR token and closed area are rejected", () => {
  const s = fresh();
  const before = s.orders.length;
  run(s, { type: "order.submit", channel: "qr", orderType: "dine_in", tableToken: "zzzz", note: "", lines: [L("salad")] }, "guest");
  run(s, { type: "order.submit", channel: "qr", orderType: "dine_in", tableId: "E1", note: "", lines: [L("salad")] }, "guest");
  assert.equal(s.orders.length, before);
});

test("waiter-entered orders are auto-accepted by a visible rule; the rule can be switched off", () => {
  const s = fresh();
  const x = run(s, { type: "order.submit", channel: "waiter", orderType: "dine_in", tableId: "T7", note: "", lines: [L("salad")] }, "s-ani");
  const o = s.orders.find((y) => y.id === `o-${x.id}`)!;
  assert.equal(o.status, "accepted");
  assert.match(o.history[1].note ?? "", /կանոն/);
  run(s, { type: "settings.update", patch: { autoAccept: { waiter: false, qr: false, website: false } } });
  const y = run(s, { type: "order.submit", channel: "waiter", orderType: "dine_in", tableId: "T7", note: "", lines: [L("salad")] }, "s-ani");
  assert.equal(s.orders.find((z) => z.id === `o-${y.id}`)!.status, "submitted");
});

test("takeaway requires contact details and the minimum order; fee from settings", () => {
  const s = fresh();
  const before = s.orders.length;
  run(s, { type: "order.submit", channel: "website", orderType: "takeaway", note: "", lines: [L("khorovats")] }, "guest");
  run(s, { type: "order.submit", channel: "website", orderType: "takeaway", contact: { name: "A", phone: "+374 00 111 222" }, note: "", lines: [L("water")] }, "guest");
  assert.equal(s.orders.length, before);
  const x = run(s, { type: "order.submit", channel: "website", orderType: "takeaway", contact: { name: "A", phone: "+374 00 111 222" }, note: "", lines: [L("khorovats")] }, "guest");
  const o = s.orders.find((y) => y.id === `o-${x.id}`)!;
  assert.equal(o.total, 8900 + s.settings.takeaway.serviceFee);
});

test("acceptance routes one ticket per station", () => {
  const s = fresh();
  const o = qr(s, [L("khorovats"), L("salad"), L("areni"), L("cake")])!;
  run(s, { type: "order.accept", orderId: o.id });
  assert.deepEqual(tickets(s, o.id).map((t) => t.station).sort(), ["bar", "cold", "grill", "pastry"]);
});

test("order status is derived from the kitchen: preparing on first start, ready only when every station is ready", () => {
  const s = fresh();
  const o = qr(s, [L("khorovats"), L("areni")])!;
  run(s, { type: "order.accept", orderId: o.id });
  const [bar, grill] = ["bar", "grill"].map((st) => tickets(s, o.id).find((t) => t.station === st)!);
  run(s, { type: "ticket.ready", ticketId: bar.id }, "s-tigran");
  assert.equal(o.status, "preparing");
  run(s, { type: "ticket.start", ticketId: grill.id }, "s-hayk");
  assert.equal(o.status, "preparing");
  run(s, { type: "ticket.ready", ticketId: grill.id }, "s-hayk");
  assert.equal(o.status, "ready");
  run(s, { type: "order.serve", orderId: o.id }, "s-ani");
  assert.equal(o.status, "served");
});

test("serve requires ready; takeaway pickup completes the order", () => {
  const s = fresh();
  const o = qr(s, [L("salad")])!;
  run(s, { type: "order.accept", orderId: o.id });
  run(s, { type: "order.serve", orderId: o.id });
  assert.equal(o.status, "accepted");
  const ta = s.orders.find((x) => x.type === "takeaway" && x.status === "ready")!;
  run(s, { type: "order.pickup", orderId: ta.id }, "s-ruzan");
  assert.equal(ta.status, "completed");
  assert.ok(ta.closedAt);
});

test("guests can cancel only before acceptance; staff can cancel later", () => {
  const s = fresh();
  const o = qr(s, [L("salad")])!;
  run(s, { type: "order.accept", orderId: o.id });
  run(s, { type: "order.cancel", orderId: o.id, reason: "x" }, "guest");
  assert.equal(o.status, "accepted");
  run(s, { type: "order.cancel", orderId: o.id, reason: "Հյուրը հրաժարվեց" }, "s-lusine");
  assert.equal(o.status, "cancelled");
});

test("stock is consumed once per line at acceptance, even if events repeat", () => {
  const s0 = fresh();
  const before = onHand(s0, "pork");
  const submit = ev({ type: "order.submit", channel: "qr", orderType: "dine_in", tableToken: T7, note: "", lines: [L("khorovats")] }, "guest");
  const accept = ev({ type: "order.accept", orderId: `o-${submit.id}` });
  const s = replay(BASE, [submit, accept, accept, { ...accept, id: "other" }], E);
  const used = 180 / 0.72;
  assert.ok(Math.abs(before - onHand(s, "pork") - used) < 1e-6);
});

test("modifier recipes change consumption (large portion, oat milk replaces milk)", () => {
  const s = fresh();
  const p0 = onHand(s, "pork"), m0 = onHand(s, "milk"), oat0 = onHand(s, "oatmilk");
  const o = qr(s, [L("khorovats", 1, ["large"]), L("cappuccino", 1, ["oat"])])!;
  run(s, { type: "order.accept", orderId: o.id });
  assert.ok(Math.abs(p0 - onHand(s, "pork") - 2 * (180 / 0.72)) < 1e-6);
  assert.ok(Math.abs(m0 - onHand(s, "milk")) < 1e-6);
  assert.ok(Math.abs(oat0 - onHand(s, "oatmilk") - 150) < 1e-6);
});

test("cancel before cooking reverses stock; after cooking it is waste (never both)", () => {
  const s = fresh();
  const p0 = onHand(s, "pork");
  const a = qr(s, [L("khorovats")])!; run(s, { type: "order.accept", orderId: a.id });
  run(s, { type: "order.cancel", orderId: a.id, reason: "Սխալ սեղան" });
  assert.ok(Math.abs(onHand(s, "pork") - p0) < 1e-6);
  const b = qr(s, [L("khorovats")])!; run(s, { type: "order.accept", orderId: b.id });
  run(s, { type: "ticket.start", ticketId: tickets(s, b.id)[0].id }, "s-hayk");
  run(s, { type: "order.cancel", orderId: b.id, reason: "Հյուրը գնաց" });
  assert.ok(p0 - onHand(s, "pork") > 200);
  const keys = s.moves.filter((m) => m.ref === b.lines[0].id).map((m) => m.kind);
  assert.ok(keys.includes("waste") && !keys.includes("reverse"));
  run(s, { type: "order.voidLine", orderId: b.id, lineId: b.lines[0].id, reason: "again" });
  assert.equal(s.moves.filter((m) => m.ref === b.lines[0].id && m.kind === "waste").length, s.recipes.find((r) => r.itemId === "khorovats")!.lines.length);
});

test("voiding a line before cooking reverses its stock and recalculates the total", () => {
  const s = fresh();
  const o = qr(s, [L("salad"), L("khorovats")])!; run(s, { type: "order.accept", orderId: o.id });
  const p0 = onHand(s, "pork");
  const kh = o.lines.find((l) => l.itemId === "khorovats")!;
  run(s, { type: "order.voidLine", orderId: o.id, lineId: kh.id, reason: "Սխալ է մուտքագրվել" });
  assert.equal(o.total, 3800);
  assert.ok(onHand(s, "pork") - p0 > 200);
  assert.equal(tickets(s, o.id).find((t) => t.station === "grill")!.status, "voided");
});

test("remake: rush ticket, original written off, consumed again, not charged", () => {
  const s = fresh();
  const o = qr(s, [L("ribeye", 1, ["rare"])])!; run(s, { type: "order.accept", orderId: o.id });
  run(s, { type: "ticket.ready", ticketId: tickets(s, o.id)[0].id }); run(s, { type: "order.serve", orderId: o.id });
  const r0 = onHand(s, "ribeye");
  run(s, { type: "order.remake", orderId: o.id, lineId: o.lines[0].id, reason: "Սխալ եփվածություն" }, "s-gor");
  const t = tickets(s, o.id).find((x) => x.remake)!;
  assert.ok(t.rush);
  assert.equal(o.status, "preparing");
  assert.equal(o.total, 16500);
  assert.ok(Math.abs(r0 - onHand(s, "ribeye") - 300 / 0.85) < 1e-6);
  assert.ok(s.moves.some((m) => m.kind === "waste" && m.ref === o.lines[0].id && (m.lost ?? 0) > 0));
});

test("recipe cost follows the documented formula (yield) — khorovats by hand", () => {
  const s = fresh();
  const u = (id: string) => { const i = s.ingredients.find((x) => x.id === id)!; return i.cost / i.unitsPerPurchase; };
  const hand = (180 / 0.72) * u("pork") + (150 / 0.75) * u("chicken") + (80 / 0.85) * u("tomato") + (60 / 0.8) * u("pepper") + (80 / 0.75) * u("eggplant") + (40 / 0.9) * u("onion") + 1 * u("lavash") + (10 / 0.8) * u("herbs");
  assert.ok(Math.abs(itemCost(s, "khorovats") - hand) < 1e-6);
  const e = dishEconomics(s, "khorovats");
  assert.ok(Math.abs(e.net - 8900 / 1.2) < 1e-6);
  assert.ok(Math.abs(e.gm - (e.net - hand) / e.net) < 1e-9);
});

test("VAT mode changes net price and margin consistently", () => {
  const s = fresh();
  const a = dishEconomics(s, "salad");
  run(s, { type: "settings.update", patch: { vat: { registered: false, pricesIncludeVat: true, rate: 0.2 } } });
  const b = dishEconomics(s, "salad");
  assert.equal(b.net, 3800);
  assert.ok(b.gm > a.gm);
});

test("Scenario C: ingredient price change recalculates every affected recipe, nothing else", () => {
  const s = fresh();
  const kh0 = dishEconomics(s, "khorovats"), salad0 = dishEconomics(s, "salad");
  run(s, { type: "ingredient.price", ingredientId: "pork", cost: 4100, source: "invoice" }, "s-vahe");
  const kh1 = dishEconomics(s, "khorovats");
  assert.ok(Math.abs(kh1.cost - kh0.cost - (180 / 0.72) * 0.7) < 1e-6);
  assert.ok(kh1.gm < kh0.gm);
  assert.equal(dishEconomics(s, "salad").cost, salad0.cost);
  assert.ok(s.notices.some((x) => x.text.includes("Խոզի վիզ")));
});

test("history keeps its cost snapshot after a price change; new orders use the new price", () => {
  const s = fresh();
  const r = A.periodDays(s, "28d");
  const before = A.summary(s, r).cost;
  run(s, { type: "ingredient.price", ingredientId: "pork", cost: 9000, source: "manual" });
  assert.equal(A.summary(s, r).cost, before);
  const o = qr(s, [L("khorovats")])!; run(s, { type: "order.accept", orderId: o.id });
  const live = A.liveFacts(s).find((f) => f.at === o.createdAt)!;
  assert.ok(Math.abs(live.cost - itemCost(s, "khorovats")) < 1e-6);
});

test("recipe quantity edit bumps the version and changes the cost", () => {
  const s = fresh();
  const c0 = itemCost(s, "khorovats");
  run(s, { type: "recipe.qty", itemId: "khorovats", ingredientId: "pork", qty: 160 });
  assert.ok(itemCost(s, "khorovats") < c0);
  assert.equal(s.recipes.find((r) => r.itemId === "khorovats")!.version, 2);
});

test("purchase order: partial receipt updates stock and price, then completes", () => {
  const s = fresh();
  run(s, { type: "po.create", supplierId: "sp-fish", lines: [{ ingredientId: "salmon", qty: 6 }, { ingredientId: "pork", qty: 3 }] }, "s-vahe");
  const po = s.pos[0];
  assert.equal(po.lines.length, 1, "lines of other suppliers are dropped");
  run(s, { type: "po.receive", poId: po.id, lines: [{ ingredientId: "salmon", qty: 3, cost: 11200 }] });
  assert.equal(po.status, "draft", "must be sent first");
  run(s, { type: "po.send", poId: po.id });
  const q0 = onHand(s, "salmon");
  run(s, { type: "po.receive", poId: po.id, lines: [{ ingredientId: "salmon", qty: 3, cost: 11200 }] });
  assert.equal(po.status, "partial");
  assert.equal(onHand(s, "salmon") - q0, 3000);
  assert.equal(s.ingredients.find((i) => i.id === "salmon")!.cost, 11200);
  run(s, { type: "po.receive", poId: po.id, lines: [{ ingredientId: "salmon", qty: 3, cost: 11200 }] });
  assert.equal(po.status, "received");
  assert.ok(s.outbox.every((o) => o.state === "simulated"));
});

test("waste log: cannot exceed stock on hand, counted in analytics", () => {
  const s = fresh();
  const r = { from: s.baseDate, to: s.baseDate };
  const w0 = A.summary(s, r).waste.cost;
  run(s, { type: "stock.waste", ingredientId: "greens", qty: 999999, reason: "x" });
  run(s, { type: "stock.waste", ingredientId: "greens", qty: 200, reason: "Ժամկետանց" });
  assert.ok(Math.abs(A.summary(s, r).waste.cost - w0 - 200 * 2.6) < 1e-6);
});

test("low-stock alert fires once when crossing the minimum", () => {
  const s = fresh();
  const ing = s.ingredients.find((i) => i.id === "pork")!;
  run(s, { type: "stock.waste", ingredientId: "pork", qty: onHand(s, "pork") - ing.minLevel + 10, reason: "test" });
  run(s, { type: "stock.waste", ingredientId: "pork", qty: 100, reason: "test" });
  run(s, { type: "stock.waste", ingredientId: "pork", qty: 100, reason: "test" });
  assert.equal(s.notices.filter((x) => x.id === "low-pork").length, 1);
});

test("table close is blocked while the kitchen works; closing completes served orders", () => {
  const s = fresh();
  const o = qr(s, [L("salad")])!; run(s, { type: "order.accept", orderId: o.id });
  run(s, { type: "table.close", tableId: "T7" });
  assert.ok(s.sessions.some((x) => x.tableId === "T7" && x.status === "open"));
  run(s, { type: "ticket.ready", ticketId: tickets(s, o.id)[0].id }); run(s, { type: "order.serve", orderId: o.id });
  run(s, { type: "table.close", tableId: "T7" }, "s-ruzan");
  assert.equal(o.status, "completed");
  assert.ok(s.cleaning.includes("T7"));
  assert.equal(tableState(s, s.tables.find((t) => t.id === "T7")!, E), "cleaning");
});

test("table states follow the service", () => {
  const s = fresh();
  const t7 = s.tables.find((t) => t.id === "T7")!;
  const st = () => tableState(s, t7, E + 60000);
  assert.equal(st(), "available");
  const o = qr(s, [L("salad")])!;
  assert.equal(st(), "ordering");
  run(s, { type: "order.accept", orderId: o.id });
  assert.equal(st(), "waiting_food");
  run(s, { type: "ticket.ready", ticketId: tickets(s, o.id)[0].id }); run(s, { type: "order.serve", orderId: o.id });
  assert.equal(st(), "eating");
  run(s, { type: "table.request", tableToken: T7, kind: "bill" }, "guest");
  assert.equal(st(), "bill");
  assert.equal(tableState(s, s.tables.find((t) => t.id === "T3")!, E), "reserved");
});

test("service requests are de-duplicated and closed", () => {
  const s = fresh();
  run(s, { type: "table.request", tableToken: T7, kind: "waiter" }, "guest");
  run(s, { type: "table.request", tableToken: T7, kind: "waiter" }, "guest");
  const r = s.requests.filter((x) => x.tableId === "T7");
  assert.equal(r.length, 1);
  run(s, { type: "request.done", requestId: r[0].id }, "s-ani");
  assert.equal(r[0].status, "done");
});

test("ticket bump and recall", () => {
  const s = fresh();
  const o = qr(s, [L("areni")])!; run(s, { type: "order.accept", orderId: o.id });
  const t = tickets(s, o.id)[0];
  run(s, { type: "ticket.ready", ticketId: t.id }); run(s, { type: "ticket.bump", ticketId: t.id });
  assert.equal(t.status, "bumped");
  run(s, { type: "ticket.recall", ticketId: t.id });
  assert.equal(t.status, "ready");
});

test("menu price change: bounds respected, affects new orders only", () => {
  const s = fresh();
  run(s, { type: "menu.price", itemId: "salad", price: 5 });
  assert.equal(s.items.find((i) => i.id === "salad")!.price, 3800);
  const a = qr(s, [L("salad")])!;
  run(s, { type: "menu.price", itemId: "salad", price: 4200 });
  const b = qr(s, [L("salad")])!;
  assert.equal(a.total, 3800);
  assert.equal(b.total, 4200);
});

test("analytics are internally consistent across views", () => {
  const s = replay(BASE, [], E);
  for (const p of ["today", "yesterday", "7d", "28d"] as const) {
    const r = A.periodDays(s, p);
    const sm = A.summary(s, r);
    const days = A.byDay(s, r);
    assert.ok(Math.abs(days.reduce((a, d) => a + d.gross, 0) - sm.gross) < 1e-6, p);
    assert.ok(Math.abs(sm.byChannel.reduce((a, c) => a + c.gross, 0) - sm.gross) < 1e-6, p);
    assert.equal(days.reduce((a, d) => a + d.orders, 0), sm.orders);
    const fees = A.facts(s, r).filter((o) => o.status === "completed").reduce((a, o) => a + o.gross - o.lines.reduce((x, l) => x + l.gross, 0), 0);
    assert.ok(Math.abs(A.dishes(s, r).rows.reduce((a, d) => a + d.gross, 0) + fees - sm.gross) < 1e-6, p);
  }
});

test("a newly accepted order is reflected in today's sales and channel mix", () => {
  const s = fresh();
  const r = A.periodDays(s, "today");
  const before = A.summary(s, r);
  const o = qr(s, [L("ribeye", 1, ["medium"])])!;
  assert.equal(A.summary(s, r).gross, before.gross, "not counted before acceptance");
  run(s, { type: "order.accept", orderId: o.id });
  const after = A.summary(s, r);
  assert.equal(after.gross - before.gross, 16500);
  assert.equal(after.byChannel.find((c) => c.channel === "qr")!.gross - before.byChannel.find((c) => c.channel === "qr")!.gross, 16500);
});

test("net profit is not computed without expense data", () => {
  const s = fresh();
  const r = A.periodDays(s, "7d");
  assert.equal(A.netProfit(s, r), null);
  run(s, { type: "settings.update", patch: { expenses: { rent: 600000, staff: 2400000, utilities: 300000, other: 150000 } } });
  const np = A.netProfit(s, r)!;
  assert.ok(Math.abs(np.value - (A.summary(s, r).gp - (3450000 * 7) / 30)) < 1e-6);
});

test("savings calculator: every result = base × assumption, total = sum, assumptions editable", () => {
  const s = fresh();
  const a = A.savings(s);
  assert.ok(Math.abs(a.total - a.rows.reduce((x, r) => x + r.result, 0)) < 1e-6);
  const waste = a.rows.find((r) => r.id === "waste")!;
  assert.ok(Math.abs(waste.result - waste.base.value * 0.2) < 1e-6);
  assert.equal(waste.actual.kind, "actual");
  assert.equal(a.rows.find((r) => r.id === "prices")!.actual.kind, "calculated");
  run(s, { type: "settings.update", patch: { savings: { wasteReductionPct: 40 } } });
  const b = A.savings(s);
  assert.ok(Math.abs(b.rows.find((r) => r.id === "waste")!.result - waste.result * 2) < 1e-6);
  assert.equal(b.rows.find((r) => r.id === "remakes")!.result, a.rows.find((r) => r.id === "remakes")!.result);
});

test("price changes and margin erosion use the price history", () => {
  const s = fresh();
  const pc = A.priceChanges(s);
  assert.ok(pc.some((p) => p.ingredient.id === "salmon" && p.pct > 0 && p.monthlyImpact > 0));
  const ero = A.marginErosion(s).find((x) => x.item.id === "salmon")!;
  assert.ok(ero.gmNow < ero.gmThen);
});

test("menu engineering classifies every food item; insights carry evidence", () => {
  const s = fresh();
  const d = A.dishes(s, A.periodDays(s, "28d"));
  assert.ok(d.rows.filter((r) => r.item.categoryId !== "drinks").every((r) => ["star", "plowhorse", "puzzle", "dog"].includes(r.cls)));
  const ins = A.insights(s);
  assert.ok(ins.length >= 4);
  assert.ok(ins.every((i) => i.evidence.length > 0 && i.href.startsWith("/r/")));
});

test("pickup estimate grows with kitchen load and snaps to the slot grid", () => {
  const s = fresh();
  const a = earliestPickup(s, [L("khorovats")], E);
  for (let i = 0; i < 6; i++) { const o = qr(s, [L("khorovats", 3)])!; run(s, { type: "order.accept", orderId: o.id }); }
  const b = earliestPickup(s, [L("khorovats")], E);
  assert.ok(b.minutes > a.minutes);
  assert.equal(b.at % (15 * 60000), 0);
});

test("permissions: waiters and cooks cannot see costs or finance; owners can", () => {
  assert.equal(can("waiter", "costs.view"), false);
  assert.equal(can("cook", "finance.view"), false);
  assert.equal(can("chef", "costs.view"), true);
  assert.equal(can("owner", "settings.manage"), true);
  assert.equal(can("manager", "settings.manage"), false);
});

test("external messages are only ever simulated", () => {
  const s = replay(BASE, [], E);
  assert.ok(s.outbox.length > 0);
  assert.ok(s.outbox.every((o) => o.state === "simulated"));
});
