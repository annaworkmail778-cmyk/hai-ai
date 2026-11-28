/* Restaurant OS operations tests: waiter, courses, KDS, floor, bills & payments, reservations, inbox, reviews, purchasing, automations. */
import assert from "node:assert/strict";
import test from "node:test";
import { apply, baseState, onHand } from "../src/lib/restaurant/engine.ts";
import { slotsFor, suggestTables, tableFree } from "../src/lib/restaurant/ops.ts";
import { detectLang, intentOf } from "../src/lib/restaurant/nlp.ts";
import { tableState } from "../src/lib/restaurant/rules.ts";
import type { CartLine, RestaurantEvent, RestaurantState, RStamped } from "../src/lib/restaurant/types.ts";

const BASE = "2026-11-27";
const E = Date.parse("2026-11-27T16:15:00Z");
let n = 0;
const fresh = () => baseState(BASE, E);
const run = (s: RestaurantState, e: RestaurantEvent, by = "s-lusine", at = E + ++n * 1000) => { const x = { ...e, id: `x${n}`, at, by } as RStamped; apply(s, x); return x; };
const L = (itemId: string, extra: Partial<CartLine> = {}): CartLine => ({ itemId, qty: 1, modifierIds: [], note: "", ...extra });
const waiterOrder = (s: RestaurantState, tableId: string, lines: CartLine[]) => { const x = run(s, { type: "order.submit", channel: "waiter", orderType: "dine_in", tableId, note: "", lines }, "s-ani"); return s.orders.find((o) => o.id === `o-${x.id}`)!; };
const tk = (s: RestaurantState, orderId: string) => s.tickets.filter((t) => t.orderId === orderId);

test("waiter order with seats and courses: drinks + first course fire, later courses are held", () => {
  const s = fresh();
  run(s, { type: "table.open", tableId: "T7", partySize: 2 }, "s-ani");
  const o = waiterOrder(s, "T7", [L("areni", { seat: 1 }), L("salad", { seat: 1, course: 1 }), L("ribeye", { seat: 2, course: 2, modifierIds: ["medium"] }), L("cake", { seat: 2, course: 3 })]);
  assert.equal(o.status, "accepted");
  const st = Object.fromEntries(tk(s, o.id).map((t) => [`${t.station}:${t.course}`, t.status]));
  assert.deepEqual(st, { "bar:0": "queued", "cold:1": "queued", "grill:2": "held", "pastry:3": "held" });
  assert.equal(o.lines.find((l) => l.itemId === "ribeye")!.seat, 2);
  // first course ready → order ready (held courses do not count) → served
  tk(s, o.id).filter((t) => t.status === "queued").forEach((t) => run(s, { type: "ticket.ready", ticketId: t.id }, "s-gor"));
  assert.equal(o.status, "ready");
  run(s, { type: "order.serve", orderId: o.id }, "s-ani");
  // fire course 2 → kitchen again → guest/waiter see preparing
  run(s, { type: "order.fireCourse", tableId: "T7", course: 2 }, "s-ani");
  assert.equal(tk(s, o.id).find((t) => t.course === 2)!.status, "queued");
  assert.equal(tk(s, o.id).find((t) => t.course === 3)!.status, "held");
  run(s, { type: "ticket.start", ticketId: tk(s, o.id).find((t) => t.course === 2)!.id }, "s-hayk");
  assert.equal(o.status, "preparing");
});

test("guests cannot hold courses: QR lines always fire immediately", () => {
  const s = fresh();
  const x = run(s, { type: "order.submit", channel: "qr", orderType: "dine_in", tableToken: "h2v4", note: "", lines: [L("salad", { course: 3 })] }, "guest");
  run(s, { type: "order.accept", orderId: `o-${x.id}` }, "s-ani");
  assert.equal(tk(s, `o-${x.id}`)[0].status, "queued");
});

test("cancelling a held (not yet cooked) course reverses stock, not waste", () => {
  const s = fresh();
  run(s, { type: "table.open", tableId: "T7", partySize: 2 }, "s-ani");
  const r0 = onHand(s, "ribeye");
  const o = waiterOrder(s, "T7", [L("salad", { course: 1 }), L("ribeye", { course: 2, modifierIds: ["rare"] })]);
  assert.ok(onHand(s, "ribeye") < r0);
  run(s, { type: "order.voidLine", orderId: o.id, lineId: o.lines[1].id, reason: "Հյուրը հրաժարվեց" });
  assert.ok(Math.abs(onHand(s, "ribeye") - r0) < 1e-6);
  assert.ok(!s.moves.some((m) => m.kind === "waste" && m.ref === o.lines[1].id));
});

test("KDS item-level check starts the ticket; reopen needs chef/manager authorisation", () => {
  const s = fresh();
  run(s, { type: "table.open", tableId: "T7", partySize: 2 }, "s-ani");
  const o = waiterOrder(s, "T7", [L("salad"), L("kufta")]);
  const t = tk(s, o.id).find((x) => x.station === "cold")!;
  run(s, { type: "ticket.itemDone", ticketId: t.id, lineId: t.lineIds[0], done: true }, "s-sona");
  assert.equal(t.status, "in_progress");
  assert.equal(o.status, "preparing");
  run(s, { type: "ticket.ready", ticketId: t.id }, "s-sona");
  run(s, { type: "ticket.reopen", ticketId: t.id, reason: "Սխալ" }, "s-ani");
  assert.equal(t.status, "ready", "waiter cannot reopen");
  run(s, { type: "ticket.reopen", ticketId: t.id, reason: "Սխալ" }, "s-gor");
  assert.equal(t.status, "in_progress");
});

test("table transfer moves the whole session; target must be free", () => {
  const s = fresh();
  run(s, { type: "table.open", tableId: "T7", partySize: 2 }, "s-ani");
  const o = waiterOrder(s, "T7", [L("salad")]);
  run(s, { type: "table.transfer", fromTableId: "T7", toTableId: "T1" }, "s-ani"); // T1 is occupied in the seed
  assert.equal(o.tableId, "T7");
  run(s, { type: "table.transfer", fromTableId: "T7", toTableId: "T11" }, "s-ani");
  assert.equal(o.tableId, "T11");
  assert.equal(tableState(s, s.tables.find((t) => t.id === "T7")!, E), "available");
  run(s, { type: "table.assign", tableId: "T11", waiterId: "s-davit" }, "s-lusine");
  assert.equal(s.sessions.find((x) => x.tableId === "T11" && x.status === "open")!.waiterId, "s-davit");
});

test("merging tables joins the sessions; the merged table shows the shared state", () => {
  const s = fresh();
  run(s, { type: "table.open", tableId: "T7", partySize: 2 }, "s-ani");
  run(s, { type: "table.open", tableId: "T11", partySize: 3 }, "s-davit");
  const o2 = waiterOrder(s, "T11", [L("salad")]);
  run(s, { type: "table.merge", tableId: "T7", withTableId: "T11" }, "s-ani");
  const main = s.sessions.find((x) => x.tableId === "T7" && x.status === "open")!;
  assert.deepEqual(main.mergedTables, ["T11"]);
  assert.equal(main.partySize, 5);
  assert.equal(o2.sessionId, main.id);
  assert.equal(tableState(s, s.tables.find((t) => t.id === "T11")!, E), tableState(s, s.tables.find((t) => t.id === "T7")!, E));
});

test("moving items to another table carries tickets and stock keys", () => {
  const s = fresh();
  run(s, { type: "table.open", tableId: "T7", partySize: 4 }, "s-ani");
  const o = waiterOrder(s, "T7", [L("salad"), L("areni"), L("kufta")]);
  const wine = o.lines.find((l) => l.itemId === "areni")!;
  run(s, { type: "order.moveLines", orderId: o.id, lineIds: [wine.id], toTableId: "T11" }, "s-ani");
  const moved = s.orders.find((x) => x.tableId === "T11" && x.lines.some((l) => l.id === wine.id))!;
  assert.ok(moved);
  assert.equal(o.total, 3800 + 4900);
  assert.equal(moved.total, 3200);
  assert.equal(tk(s, moved.id).find((t) => t.station === "bar")!.lineIds[0], wine.id);
  const w0 = onHand(s, "wine");
  run(s, { type: "order.voidLine", orderId: moved.id, lineId: wine.id, reason: "x" });
  assert.ok(Math.abs(onHand(s, "wine") - w0 - 150) < 1e-6, "reversed exactly once");
});

test("bill: single, by seat and equal split always add up to the table total", () => {
  const s = fresh();
  run(s, { type: "table.open", tableId: "T7", partySize: 3 }, "s-ani");
  waiterOrder(s, "T7", [L("salad", { seat: 1 }), L("areni", { seat: 2 }), L("kufta", { seat: 3 }), L("water")]);
  const sess = () => s.sessions.find((x) => x.tableId === "T7" && x.status === "open")!;
  for (const mode of ["single", "seats", "equal"] as const) {
    run(s, { type: "bill.prepare", tableId: "T7", mode, n: 3 }, "s-ani");
    const b = sess().bill!;
    assert.equal(b.parts.reduce((a, p) => a + p.amount, 0), b.total, mode);
  }
  assert.equal(sess().bill!.parts.length, 3);
  assert.equal(sess().bill!.total, 3800 + 3200 + 4900 + 1200);
});

test("payment: only an adapter result marks a part paid; pending blocks closing; duplicates ignored", () => {
  const s = fresh();
  run(s, { type: "table.open", tableId: "T7", partySize: 2 }, "s-ani");
  const o = waiterOrder(s, "T7", [L("salad")]);
  tk(s, o.id).forEach((t) => run(s, { type: "ticket.ready", ticketId: t.id }, "s-gor"));
  run(s, { type: "order.serve", orderId: o.id }, "s-ani");
  run(s, { type: "bill.prepare", tableId: "T7", mode: "equal", n: 2 }, "s-ani");
  const sess = s.sessions.find((x) => x.tableId === "T7" && x.status === "open")!;
  const [p1, p2] = sess.bill!.parts;
  run(s, { type: "payment.request", tableId: "T7", partId: p1.id, method: "card_terminal" }, "s-ani");
  assert.equal(p1.status, "pending");
  assert.equal(tableState(s, s.tables.find((t) => t.id === "T7")!, E), "payment_pending");
  run(s, { type: "table.close", tableId: "T7" }, "s-ani");
  assert.equal(sess.status, "open", "cannot close while a payment is pending");
  const pay = s.payments.find((x) => x.partId === p1.id)!;
  run(s, { type: "payment.result", paymentId: pay.id, approved: true, providerRef: "ref-1", adapter: "real-bank" }, "adapter:x");
  assert.equal(p1.status, "pending", "unknown adapter ignored");
  run(s, { type: "payment.result", paymentId: pay.id, approved: true, providerRef: "ref-1", adapter: "demo-terminal" }, "adapter:demo");
  assert.equal(p1.status, "paid");
  run(s, { type: "payment.record", tableId: "T7", partId: p2.id, method: "cash" }, "s-ani");
  assert.equal(p2.status, "open", "a waiter cannot record cash");
  run(s, { type: "payment.record", tableId: "T7", partId: p2.id, method: "cash" }, "s-ruzan");
  assert.equal(p2.status, "recorded");
  run(s, { type: "table.close", tableId: "T7", via: "bill" }, "s-ani");
  assert.equal(sess.status, "closed");
  assert.equal(o.status, "completed");
});

test("reservations: availability, no double booking, seating with allergies, no-show after grace", () => {
  const s = fresh();
  const at = E + 3 * 3600000;
  const a = run(s, { type: "reservation.request", name: "Test A", phone: "+374 00 999 001", partySize: 2, at, allergies: "Ընկույզ", source: "website" }, "guest");
  const b = run(s, { type: "reservation.request", name: "Test B", phone: "+374 00 999 002", partySize: 2, at: at + 30 * 60000, source: "phone" }, "s-elen");
  const ra = s.reservations.find((r) => r.id === `rv-${a.id}`)!, rb = s.reservations.find((r) => r.id === `rv-${b.id}`)!;
  assert.equal(ra.status, "requested");
  assert.ok(tableFree(s, "T7", at, 75));
  run(s, { type: "reservation.confirm", reservationId: ra.id, tableIds: ["T7"] }, "s-elen");
  assert.equal(ra.status, "confirmed");
  run(s, { type: "reservation.confirm", reservationId: rb.id, tableIds: ["T7"] }, "s-elen");
  assert.equal(rb.status, "requested", "overlapping slot on the same table refused");
  run(s, { type: "reservation.confirm", reservationId: rb.id, tableIds: suggestTables(s, rb.at, 2)! }, "s-elen");
  assert.equal(rb.status, "confirmed");
  assert.notDeepEqual(rb.tableIds, ["T7"]);
  run(s, { type: "reservation.noShow", reservationId: ra.id }, "s-elen", E + 1000);
  assert.equal(ra.status, "confirmed", "no-show only after the grace period");
  run(s, { type: "reservation.seat", reservationId: ra.id }, "s-elen");
  const sess = s.sessions.find((x) => x.reservationId === ra.id)!;
  assert.equal(sess.allergies, "Ընկույզ");
  assert.equal(ra.status, "seated");
});

test("large party gets a table combination; slots reflect availability", () => {
  const s = fresh();
  const at = E + 26 * 3600000;
  const t = suggestTables(s, at, 9)!;
  assert.ok(t.length >= 1);
  assert.ok(t.reduce((a, id) => a + s.tables.find((x) => x.id === id)!.seats, 0) >= 9);
  assert.ok(slotsFor(s, "2026-11-28", 2).some((x) => x.ok));
});

test("walk-in from the waitlist is seated with the least-loaded waiter (logged automation)", () => {
  const s = fresh();
  run(s, { type: "waitlist.seat", entryId: "wl-1", tableId: "T7" }, "s-elen");
  const sess = s.sessions.find((x) => x.tableId === "T7" && x.status === "open")!;
  assert.ok(["s-ani", "s-davit"].includes(sess.waiterId));
  assert.ok(s.autolog.some((x) => x.automationId === "walkin_assign" && x.result === "ok"));
});

test("inbox: only configured low-risk intents auto-reply; allergy is escalated; channels labelled honestly", () => {
  const s = fresh();
  assert.equal(detectLang("Բարև"), "hy"); assert.equal(detectLang("Привет"), "ru"); assert.equal(intentOf("Do you have nuts in the cake? allergy"), "allergy");
  run(s, { type: "inbox.receive", channel: "whatsapp", from: { name: "A", handle: "+37400111" }, text: "What time do you close tonight?" }, "adapter:demo");
  const c1 = s.inbox.find((c) => c.customer.handle === "+37400111")!;
  assert.equal(c1.messages.at(-1)!.state, "auto_simulated");
  run(s, { type: "inbox.receive", channel: "instagram", from: { name: "B", handle: "@b" }, text: "Is the khorovats safe for a nut allergy?" }, "adapter:demo");
  const c2 = s.inbox.find((c) => c.customer.handle === "@b")!;
  assert.equal(c2.messages.length, 1, "no auto reply for allergy");
  assert.equal(c2.draft!.risk, "escalate");
  assert.equal(c2.priority, "high");
  run(s, { type: "inbox.autoreply", intents: ["hours", "allergy"] }, "s-owner");
  assert.deepEqual(s.inboxSettings.autoReplyIntents, ["hours"], "allergy can never be automated");
  run(s, { type: "inbox.send", conversationId: c2.id, text: "A team member will check with the kitchen.", approved: true }, "s-lusine");
  assert.equal(c2.messages.at(-1)!.state, "simulated");
  run(s, { type: "inbox.receive", channel: "webchat", from: { name: "Web", handle: "web:1" }, text: "Do you have vegetarian dishes?" }, "guest");
  const c3 = s.inbox.find((c) => c.customer.handle === "web:1")!;
  run(s, { type: "inbox.send", conversationId: c3.id, text: "Yes", approved: true }, "s-lusine");
  assert.equal(c3.messages.at(-1)!.state, "delivered", "website chat is our own channel");
});

test("reviews: negative review creates one follow-up task; reply status depends on platform capability", () => {
  const s = fresh();
  const tasks0 = s.tasks.length;
  run(s, { type: "review.receive", platform: "google", rating: 2, text: "Waited 50 minutes and the food was cold.", author: "X" }, "adapter:demo");
  const r = s.reviews[0];
  assert.equal(r.categories.wait, -1); assert.equal(r.categories.food, -1);
  assert.equal(s.tasks.length, tasks0 + 1);
  run(s, { type: "review.reply", reviewId: r.id, text: "Thank you…", publish: true }, "s-lusine");
  assert.equal(r.reply!.status, "published_simulated");
  assert.equal(s.tasks.find((t) => t.id === r.taskId)!.status, "done");
  run(s, { type: "review.receive", platform: "tripadvisor", rating: 5, text: "Cozy and delicious", author: "Y" }, "adapter:demo");
  run(s, { type: "review.reply", reviewId: s.reviews[0].id, text: "Thanks", publish: true }, "s-lusine");
  assert.equal(s.reviews[0].reply!.status, "manual_required");
});

test("low stock creates one purchase draft; large POs need manager approval", () => {
  const s = fresh();
  const ing = s.ingredients.find((i) => i.id === "pork")!;
  run(s, { type: "stock.waste", ingredientId: "pork", qty: onHand(s, "pork") - ing.minLevel + 3000, reason: "test" }); // ≈ 14 000 ֏ → unusual-waste alert
  run(s, { type: "stock.waste", ingredientId: "pork", qty: 50, reason: "test" });
  const drafts = s.pos.filter((p) => p.auto && p.lines[0].ingredientId === "pork");
  assert.equal(drafts.length, 1);
  assert.ok(s.autolog.some((x) => x.automationId === "unusual_waste_alert"));
  run(s, { type: "po.create", supplierId: "sp-meat", lines: [{ ingredientId: "ribeye", qty: 20 }] }, "s-vahe");
  const po = s.pos[0];
  assert.equal(po.status, "pending_approval");
  run(s, { type: "po.send", poId: po.id }, "s-vahe");
  assert.equal(po.status, "pending_approval");
  run(s, { type: "po.approve", poId: po.id }, "s-vahe");
  assert.equal(po.status, "pending_approval", "stock role cannot approve");
  run(s, { type: "po.approve", poId: po.id }, "s-lusine");
  run(s, { type: "po.send", poId: po.id }, "s-vahe");
  assert.equal(po.status, "sent");
});

test("stocktake records variance as adjustments", () => {
  const s = fresh();
  const q = onHand(s, "tomato");
  run(s, { type: "stock.count", lines: [{ ingredientId: "tomato", counted: q - 500 }] }, "s-vahe");
  assert.ok(Math.abs(onHand(s, "tomato") - (q - 500)) < 1e-6);
  assert.equal(s.counts[0].lines[0].counted - s.counts[0].lines[0].expected, -500);
});

test("loyalty points are earned once when an identified takeaway order completes", () => {
  const s = fresh();
  const x = run(s, { type: "order.submit", channel: "website", orderType: "takeaway", contact: { name: "Loyal", phone: "+374 00 777 888" }, note: "", lines: [L("ribeye", { modifierIds: ["well"] })] }, "guest");
  const o = s.orders.find((y) => y.id === `o-${x.id}`)!;
  run(s, { type: "order.accept", orderId: o.id });
  tk(s, o.id).forEach((t) => run(s, { type: "ticket.ready", ticketId: t.id }, "s-gor"));
  run(s, { type: "order.pickup", orderId: o.id }, "s-ruzan");
  const c = s.customers.find((y) => y.phone === "+374 00 777 888")!;
  assert.equal(c.points, Math.floor(o.total / 1000) * 10);
  assert.equal(s.loyalty.ledger.filter((e) => e.key === `earn:${o.id}`).length, 1);
});

test("disabled automations are skipped and logged; daily summary goes to the outbox as a simulation", () => {
  const s = fresh();
  run(s, { type: "automation.toggle", target: "negative_review_task", on: false }, "s-owner");
  const t0 = s.tasks.length;
  run(s, { type: "review.receive", platform: "google", rating: 1, text: "Rude service", author: "Z" }, "adapter:demo");
  assert.equal(s.tasks.length, t0);
  assert.ok(s.autolog.some((x) => x.automationId === "negative_review_task" && x.result === "skipped"));
  run(s, { type: "day.close" }, "s-lusine");
  assert.equal(s.summaries.length, 1);
  assert.equal(s.outbox[0].state, "simulated");
  run(s, { type: "shift.handover" }, "s-lusine");
  assert.match(s.handovers[0].text, /Բաց սեղաններ/);
});

test("business assistant answers are grounded in the same analytics and propose (not execute) actions", async () => {
  const { ask, answer } = await import("../src/lib/restaurant/assistant.ts");
  const A = await import("../src/lib/restaurant/analytics.ts");
  const s = fresh();
  const rev = answer(s, "revenue", E);
  const sm = A.summary(s, A.periodDays(s, "today"));
  assert.ok(rev.lines[0].includes(Math.round(sm.gross).toLocaleString("en-US").replace(/,/g, " ")));
  assert.ok(rev.sources.length > 0);
  const st = ask(s, "Which ingredients are running low?", E);
  assert.equal(st.title, "Վերջացող բաղադրիչներ");
  const pos0 = s.pos.length;
  assert.ok((st.actions ?? []).every((a) => a.permission === "purchasing.manage"));
  assert.equal(s.pos.length, pos0, "asking never changes data");
  assert.equal(ask(s, "Сколько у нас бронирований сегодня?", E).title, "Ամրագրումներ այս երեկո");
  assert.equal(ask(s, "Give me a summary of today's restaurant performance", E).title, "Այսօրվա ամփոփում");
  assert.equal(ask(s, "what is the weather", E).title, "Չհասկացա հարցը");
});
