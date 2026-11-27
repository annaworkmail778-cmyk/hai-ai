import { test } from "node:test";
import assert from "node:assert/strict";
import { replay } from "../src/lib/engine.ts";
import { computeKpis, periods } from "../src/lib/analytics.ts";
import { respond } from "../src/lib/assistant.ts";
import { freeRooms, nightlyRate, quote } from "../src/lib/pricing.ts";
import { scenarioDates } from "../src/lib/seed.ts";
import { computeRoi } from "../src/lib/roi.ts";
import type { StampedEvent } from "../src/lib/types.ts";

const BASE = "2026-11-27";
let n = 0;
const ev = (e: object, by = "s-gohar") => ({ id: `t${++n}`, at: Date.UTC(2026, 10, 27, 19, 30) + n * 1000, by, ...e }) as StampedEvent;

test("seed is deterministic", () => {
  const a = replay(BASE, []);
  const b = replay(BASE, []);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.ok(a.reservations.length > 300);
});

test("night inquiry → approve → prep task + simulated confirmation", () => {
  const sc = scenarioDates(BASE);
  const events: StampedEvent[] = [
    ev({ type: "clock.set", mode: "night" }, "presenter"),
    ev({ type: "inquiry.create", guest: { firstName: "Мария", lastName: "Волкова", phone: "+7 900 000 11 22", email: "", lang: "ru" }, typeId: "family", checkIn: sc.checkIn, checkOut: sc.checkOut, adults: 2, children: 2, requests: "", source: "assistant" }, "guest"),
  ];
  let s = replay(BASE, events);
  const inq = s.reservations.find((r) => r.id === `r-${events[1].id}`)!;
  assert.equal(inq.status, "inquiry");
  assert.equal(inq.afterHours, true);
  assert.ok(s.outbox.some((o) => o.workflowId === "inquiry_alert" && o.state === "simulated"));
  const free = freeRooms(s, "family", sc.checkIn, sc.checkOut);
  assert.ok(free.length >= 1, "scenario room must be free");
  events.push(ev({ type: "reservation.approve", reservationId: inq.id, roomId: free[0] }));
  s = replay(BASE, events);
  const res = s.reservations.find((r) => r.id === inq.id)!;
  assert.equal(res.status, "confirmed");
  assert.ok(s.hkTasks.some((t) => t.reservationId === res.id && t.kind === "arrival_prep" && t.auto));
  assert.ok(s.outbox.some((o) => o.reservationId === res.id && o.template.includes("հաստատում")));
  // double-booking guard
  events.push(ev({ type: "inquiry.create", guest: { firstName: "A", lastName: "B", phone: "+000 1", email: "", lang: "en" }, typeId: "family", checkIn: sc.checkIn, checkOut: sc.checkOut, adults: 2, children: 0, requests: "", source: "website" }, "guest"));
  const second = `r-${events[events.length - 1].id}`;
  events.push(ev({ type: "reservation.approve", reservationId: second, roomId: free[0] }));
  s = replay(BASE, events);
  assert.equal(s.reservations.find((r) => r.id === second)!.status, "inquiry");
});

test("checkout creates housekeeping task and review request", () => {
  const s0 = replay(BASE, []);
  const dep = s0.reservations.find((r) => r.status === "checked_in" && r.checkOut === BASE)!;
  assert.ok(dep, "seed must have a departure to check out");
  const s = replay(BASE, [ev({ type: "reservation.checkout", reservationId: dep.id })]);
  assert.equal(s.hk[dep.roomId!], "dirty");
  assert.ok(s.hkTasks.some((t) => t.reservationId === dep.id && t.kind === "checkout"));
  assert.ok(s.outbox.some((o) => o.reservationId === dep.id && o.workflowId === "review_request" && o.state === "scheduled"));
});

test("analytics are internally consistent", () => {
  const s = replay(BASE, []);
  for (const p of Object.values(periods(BASE))) {
    const k = computeKpis(s, p);
    assert.ok(k.occupancy > 0 && k.occupancy <= 1);
    assert.ok(Math.abs(k.revpar - k.occupancy * k.adr) < 1, "RevPAR = occupancy × ADR");
    const daily = k.daily.reduce((a, d) => a + d.revenue, 0);
    assert.equal(daily, k.revenue);
    assert.equal(k.bySource.reduce((a, x) => a + x.revenue, 0), k.revenue);
    assert.equal(k.byType.reduce((a, x) => a + x.revenue, 0), k.revenue);
  }
});

test("assistant only quotes prices from the rate table", () => {
  const s = replay(BASE, []);
  const r = respond(s, "ru", "Есть семейный номер на следующие выходные на 4 человек? Сколько стоит?");
  const card = r.messages.flatMap((m) => m.cards ?? []).find((c) => c.kind === "rooms");
  assert.ok(card && card.kind === "rooms");
  assert.ok(card.typeIds.includes("family"));
  const sc = scenarioDates(BASE);
  assert.equal(card.checkIn, sc.checkIn);
  assert.equal(quote("family", sc.checkIn, sc.checkOut).total, nightlyRate("family", sc.checkIn) + nightlyRate("family", sc.checkOut.slice(0, 8) + String(Number(sc.checkOut.slice(8)) - 1).padStart(2, "0")));
  const u = respond(s, "en", "Do you have a helipad?");
  assert.equal(u.action?.type, "handoff");
  const p = respond(s, "hy", "Նախաճաշը ներառվա՞ծ է");
  assert.equal(p.messages[0].intent, "breakfast");
  for (const lang of ["hy", "ru", "en"] as const) assert.ok(respond(s, lang, "q:checkin").messages[0].text.includes("14:00"));
});

test("ROI formulas", () => {
  const r = computeRoi({ monthlyInquiries: 300, minutesPerInquiry: 8, staffHandling: 2, hourlyCost: 1800, automationShare: 0.5, avgRoomPrice: 50000, avgNights: 2, occupancy: 0.6, missedShare: 0.1, recoverableShare: 0.5, directConversion: 0.3, otaBookingsPerMonth: 40, otaShiftShare: 0.1, otaCommission: 0.15, firstResponseHours: 3 });
  assert.equal(r.hoursSaved, 20);
  assert.equal(r.extraBookings, 4.5);
  assert.equal(r.extraRevenue, 450000);
  assert.equal(r.commissionSaved, 60000);
});

/* ---------------- Hospitality OS rules ---------------- */
import { bookingCalc, loyaltyOf, orderCalc } from "../src/lib/rules.ts";

test("loyalty: tiers from lifetime points, points only on completed transactions", () => {
  const s0 = replay(BASE, []);
  const james = loyaltyOf(s0, "g-james"), anna = loyaltyOf(s0, "g-anna");
  assert.ok(james.lifetime > anna.lifetime);
  assert.equal(james.balance, james.entries.reduce((a, e) => a + e.points, 0));
  // registering gives only the configured welcome bonus
  const reg = ev({ type: "account.register", accountId: "acc-t", guest: { firstName: "Test", lastName: "Guest", phone: "+374 00 111 222", email: "t@example.com", lang: "en" }, email: "t@example.com", marketing: false }, "guest");
  let s = replay(BASE, [reg]);
  const g = s.accounts.find((a) => a.id === "acc-t")!.guestId;
  assert.equal(loyaltyOf(s, g).balance, s.loyalty.welcomeBonus);
  // a booking request earns nothing; approval earns nothing; only check-out earns
  const sc = scenarioDates(BASE);
  const bk = ev({ type: "booking.create", source: "website", input: { guest: { firstName: "Test", lastName: "Guest", phone: "+374 00 111 222", email: "t@example.com", lang: "en" }, guestId: g, typeId: "classic", rooms: 1, checkIn: sc.checkIn, checkOut: sc.checkOut, adults: 2, children: 0, extras: [{ id: "transfer", qty: 1 }], requests: "" } }, "guest");
  s = replay(BASE, [reg, bk]);
  assert.equal(loyaltyOf(s, g).balance, s.loyalty.welcomeBonus);
  const res = s.reservations.find((r) => r.id === `r-${bk.id}`)!;
  assert.equal(res.status, "inquiry");
  assert.equal(res.payment, "unpaid");
  // order: points only when completed
  const oc = ev({ type: "order.create", order: { type: "takeaway", guestId: g, guestName: "Test", items: [{ itemId: "steak", qty: 2, options: [] }], note: "" } }, "guest");
  s = replay(BASE, [reg, oc]);
  const o = s.orders.find((x) => x.id === `o-${oc.id}`)!;
  assert.equal(o.subtotal, 33000);
  const steps = ["accepted", "preparing", "ready", "completed"].map((st) => ev({ type: "order.status", target: o.id, status: st }, "s-hayk"));
  s = replay(BASE, [reg, oc, ...steps.slice(0, 3)]);
  assert.equal(loyaltyOf(s, g).balance, s.loyalty.welcomeBonus);
  s = replay(BASE, [reg, oc, ...steps]);
  assert.equal(loyaltyOf(s, g).balance, s.loyalty.welcomeBonus + Math.floor(s.orders.find((x) => x.id === o.id)!.total / 1000) * 10);
  // invalid transition is ignored (submitted → ready)
  const bad = replay(BASE, [reg, oc, ev({ type: "order.status", target: o.id, status: "ready" }, "s-hayk")]);
  assert.equal(bad.orders.find((x) => x.id === o.id)!.status, "submitted");
});

test("booking price breakdown and voucher lifecycle", () => {
  const s = replay(BASE, []);
  const sc = scenarioDates(BASE);
  const c = bookingCalc(s, { typeId: "deluxe", rooms: 2, checkIn: sc.checkIn, checkOut: sc.checkOut, adults: 2, children: 0, extras: [{ id: "spa", qty: 1 }], guestId: "g-anna" });
  assert.equal(c.roomTotal, quote("deluxe", sc.checkIn, sc.checkOut).total * 2);
  assert.equal(c.total, c.roomTotal + c.extrasTotal - c.discount);
  assert.equal(c.lines.reduce((a, l) => a + l.amount, 0), c.total);
  assert.ok(c.memberPct > 0, "Anna is a member with a tier discount");
  // Anna's active restaurant voucher reserved on order, used on acceptance, released on rejection
  const oc = ev({ type: "order.create", order: { type: "takeaway", guestId: "g-anna", guestName: "Anna", items: [{ itemId: "skewers", qty: 2, options: [] }], note: "", voucherId: "v-anna-1" } }, "guest");
  let t = replay(BASE, [oc]);
  assert.equal(t.vouchers.find((v) => v.id === "v-anna-1")!.status, "reserved");
  assert.ok(t.orders.find((x) => x.id === `o-${oc.id}`)!.discount >= 10000);
  t = replay(BASE, [oc, ev({ type: "order.status", target: `o-${oc.id}`, status: "rejected" }, "s-hayk")]);
  assert.equal(t.vouchers.find((v) => v.id === "v-anna-1")!.status, "active");
  const calc = orderCalc(s, [{ itemId: "cappuccino", qty: 1, options: ["oat"] }]);
  assert.equal(calc.subtotal, 1800);
});

test("QR service request routing and onboarding flow", () => {
  const sr = ev({ type: "service.create", serviceType: "towels", roomId: "204", note: "2 big towels" }, "guest");
  let s = replay(BASE, [sr]);
  const req = s.services.find((x) => x.id === `sr-${sr.id}`)!;
  assert.equal(req.dept, "housekeeping");
  assert.equal(req.status, "new");
  s = replay(BASE, [sr, ev({ type: "service.assign", target: req.id, assigneeId: "s-lilit" }, "s-anahit"), ev({ type: "service.status", target: req.id, status: "done" }, "s-lilit")]);
  assert.equal(s.services.find((x) => x.id === req.id)!.status, "done");
  // onboarding: new waiter gets welcome + restaurant modules; quiz needs ≥70%
  const emp = ev({ type: "employee.create", name: "Test Waiter", phone: "+374 00", email: "w@example.com", dept: "restaurant", position: "waiter", supervisorId: "s-tatev" }, "s-narek");
  s = replay(BASE, [emp]);
  const mine = s.enrollments.filter((e) => e.employeeId === `s-${emp.id}`);
  assert.deepEqual(mine.map((e) => e.moduleId).sort(), ["tm-restaurant", "tm-welcome"]);
  const w = mine.find((e) => e.moduleId === "tm-welcome")!;
  const steps = ["w1", "w2", "w3"].map((st) => ev({ type: "training.step", enrollmentId: w.id, stepId: st }, `s-${emp.id}`));
  const failQuiz = ev({ type: "training.step", enrollmentId: w.id, stepId: "w4", score: 50 }, `s-${emp.id}`);
  s = replay(BASE, [emp, ...steps, failQuiz, ev({ type: "training.submit", enrollmentId: w.id }, `s-${emp.id}`)]);
  assert.equal(s.enrollments.find((e) => e.id === w.id)!.status, "in_progress");
  const passQuiz = ev({ type: "training.step", enrollmentId: w.id, stepId: "w4", score: 100 }, `s-${emp.id}`);
  s = replay(BASE, [emp, ...steps, passQuiz, ev({ type: "training.submit", enrollmentId: w.id }, `s-${emp.id}`), ev({ type: "training.review", enrollmentId: w.id, approved: true, note: "" }, "s-tatev")]);
  assert.equal(s.enrollments.find((e) => e.id === w.id)!.status, "approved");
});
