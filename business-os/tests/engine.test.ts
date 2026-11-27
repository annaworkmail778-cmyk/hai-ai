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
