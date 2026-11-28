import { test } from "node:test";
import assert from "node:assert/strict";
import { replay } from "../src/lib/engine.ts";
import { folioOf } from "../src/lib/engine-ops.ts";
import { classify, detectLang, draftReply } from "../src/lib/ai/inbox-ai.ts";
import { analyseReview, draftReviewReply, replyIssues } from "../src/lib/ai/review-ai.ts";
import { askCopilot } from "../src/lib/ai/copilot.ts";
import { demoOtaBooking } from "../src/lib/channel-adapters.ts";
import { computeKpis, occupiedOn, periods } from "../src/lib/analytics.ts";
import { addDays } from "../src/lib/dates.ts";
import { roomIsFree } from "../src/lib/pricing.ts";
import type { StampedEvent } from "../src/lib/types.ts";

const BASE = "2026-11-27";
let n = 0;
const ev = (e: object, by = "s-gohar") => ({ id: `o${++n}`, at: Date.UTC(2026, 10, 27, 9, 0) + n * 1000, by, ...e }) as StampedEvent;
const NOW = Date.UTC(2026, 10, 27, 10, 0);

test("inbox AI: language, intent and risk gate (never auto-answers money, cancellations, medical, legal, availability)", () => {
  assert.equal(detectLang("Բարև, կա՞ ավտոկայանատեղի"), "hy");
  assert.equal(detectLang("Есть ли парковка?"), "ru");
  assert.equal(detectLang("Do you have parking?"), "en");
  const s = replay(BASE, []);
  const low = draftReply(s, "What time is breakfast?");
  assert.equal(low.autoAllowed, true);
  assert.ok(low.sources.includes("kb.breakfast"));
  assert.ok(low.text.includes(s.kb.breakfast), "draft uses the configured breakfast hours");
  for (const q of ["I want a refund", "Can I pay by card?", "Please cancel my booking", "I need a doctor", "My lawyer will contact you", "Any free rooms on Friday?", "The air conditioning is not working"]) {
    const d = draftReply(s, q);
    assert.equal(d.autoAllowed, false, q);
    assert.equal(d.risk, "high", q);
  }
  assert.equal(classify("blah blah unknown").risk, "high", "unknown topics are not auto-answered");
});

test("inbox: inbound, escalation automation is idempotent per message, reply marks first response", () => {
  const events = [
    ev({ type: "inbox.inbound", threadId: "it-x", channel: "whatsapp", contact: { name: "T", handle: "+000", lang: "en" }, text: "I want a refund for my stay" }),
    ev({ type: "inbox.reply", threadId: "it-x", text: "We are checking.", ai: true }),
  ];
  const s = replay(BASE, events);
  const t = s.inbox.find((x) => x.id === "it-x")!;
  assert.equal(t.priority, "high");
  assert.equal(t.dept, "management");
  assert.ok(t.firstResponseAt);
  assert.equal(s.autoLog.filter((a) => a.rule === "inbox_escalation").length, 1);
  const again = replay(BASE, [...events, events[0]]); // re-delivered event (same id) is deduplicated
  assert.equal(again.autoLog.filter((a) => a.rule === "inbox_escalation").length, 1);
});

test("reviews: analysis, safe reply draft in the review language, approval rules per platform", () => {
  const a = analyseReview({ rating: 2, text: "Our room was cold and the response was slow." });
  assert.ok(a.negatives.includes("temperature"));
  assert.equal(a.sentiment, "negative");
  const s0 = replay(BASE, [ev({ type: "review.add", review: { platform: "tripadvisor", rating: 2, lang: "ru", author: "Иван Петров", text: "Было шумно ночью и холодно в номере." } })]);
  const rv = s0.reviews[0];
  assert.equal(s0.staffTasks[0].origin, "automation", "negative review creates a task");
  const d = draftReviewReply(s0, rv);
  assert.match(d.text, /[А-Яа-я]/, "reply drafted in Russian");
  assert.ok(!d.text.includes("Петров"), "no surname in reply");
  assert.deepEqual(replyIssues(d.text), []);
  assert.ok(replyIssues("We will refund one night").length > 0);
  // a housekeeper cannot approve; a manager can; Tripadvisor has no reply API → manual
  const id = `rv-${"o" + (n + 1)}`;
  const s2 = replay(BASE, [
    { ...ev({ type: "review.add", review: { platform: "tripadvisor", rating: 2, lang: "en", author: "A", text: "Noisy" } }), id: id.slice(3) },
    ev({ type: "review.draft", target: id, text: "Thank you" }),
    ev({ type: "review.approve", target: id }, "s-lilit"),
  ]);
  assert.equal(s2.reviews.find((r) => r.id === id)!.status, "draft", "housekeeper approval is ignored");
  const s3 = replay(BASE, [
    { ...ev({ type: "review.add", review: { platform: "tripadvisor", rating: 2, lang: "en", author: "A", text: "Noisy" } }), id: id.slice(3) },
    ev({ type: "review.draft", target: id, text: "Thank you" }),
    ev({ type: "review.approve", target: id }, "s-narek"),
  ]);
  assert.equal(s3.reviews.find((r) => r.id === id)!.status, "manual_required", "no reply API → manual publishing");
});

test("channel manager: import, duplicate is idempotent, modification, cancellation, conflict + resolve", () => {
  const ci = addDays(BASE, 30), co = addDays(BASE, 32);
  const b = demoOtaBooking("booking", 1, ci, co, "deluxe");
  let s = replay(BASE, [ev({ type: "ota.import", booking: b }), ev({ type: "ota.import", booking: b })]);
  const imported = s.reservations.filter((r) => r.external?.externalId === b.externalId);
  assert.equal(imported.length, 1, "duplicate delivery does not create a second reservation");
  assert.equal(imported[0].status, "confirmed");
  assert.equal(imported[0].external!.syncState, "synced");
  assert.ok(s.syncLog.some((l) => l.op === "duplicate" && l.result === "ignored"));
  assert.equal(s.autoLog.filter((a) => a.rule === "ota_booking_alert").length, 1, "alert fires once");
  s = replay(BASE, [ev({ type: "ota.import", booking: b }), ev({ type: "ota.import", booking: { ...b, checkOut: addDays(co, 1) } }), ev({ type: "ota.cancel", channel: "booking", externalId: b.externalId }), ev({ type: "ota.cancel", channel: "booking", externalId: b.externalId })]);
  const r = s.reservations.find((x) => x.external?.externalId === b.externalId)!;
  assert.equal(r.external!.version, 2);
  assert.equal(r.status, "cancelled");
  assert.ok(s.syncLog.filter((l) => l.op === "duplicate").length >= 1, "second cancel ignored");
  // conflict: fill every chalet, then import one more
  const chalets = replay(BASE, []).rooms.filter((x) => x.typeId === "chalet");
  const fill = chalets.map((_, i) => ev({ type: "ota.import", booking: demoOtaBooking("expedia", 100 + i, addDays(BASE, 60), addDays(BASE, 62), "chalet") }));
  const over = demoOtaBooking("expedia", 999, addDays(BASE, 60), addDays(BASE, 62), "chalet");
  const overEv = ev({ type: "ota.import", booking: over });
  s = replay(BASE, [...fill, overEv]);
  const c = s.reservations.find((x) => x.external?.externalId === over.externalId)!;
  assert.equal(c.external!.syncState, "conflict");
  assert.equal(c.roomId, null, "never double-books a room");
  const alt = s.rooms.find((room) => roomIsFree(s, room.id, over.checkIn, over.checkOut))!;
  const s2 = replay(BASE, [...fill, overEv, ev({ type: "ota.resolve", reservationId: c.id, roomId: alt.id })]);
  const resolved = s2.reservations.find((x) => x.external?.externalId === over.externalId)!;
  assert.equal(resolved.roomId, alt.id);
  assert.equal(resolved.external!.syncState, "synced");
});

test("front desk: room move validates availability, no-show only on/after arrival, folio balance", () => {
  const s0 = replay(BASE, []);
  const inHouse = s0.reservations.find((r) => r.status === "checked_in" && r.roomId)!;
  const free = s0.rooms.find((room) => room.id !== inHouse.roomId && !s0.reservations.some((r) => r.roomId === room.id && ["confirmed", "checked_in"].includes(r.status) && r.checkIn < inHouse.checkOut && r.checkOut > BASE))!;
  const s1 = replay(BASE, [ev({ type: "reservation.move", reservationId: inHouse.id, roomId: free.id, reason: "AC" })]);
  const moved = s1.reservations.find((r) => r.id === inHouse.id)!;
  assert.equal(moved.roomId, free.id);
  assert.equal(s1.hk[inHouse.roomId!], "dirty", "old room needs cleaning");
  const future = s0.reservations.find((r) => r.status === "confirmed" && r.checkIn > BASE)!;
  assert.equal(replay(BASE, [ev({ type: "reservation.noshow", reservationId: future.id })]).reservations.find((r) => r.id === future.id)!.status, "confirmed");
  const s2 = replay(BASE, [ev({ type: "folio.add", reservationId: inHouse.id, kind: "charge", label: "Minibar", amount: 4000 }), ev({ type: "folio.add", reservationId: inHouse.id, kind: "deposit", label: "Deposit", amount: 10000, method: "card" }), ev({ type: "folio.add", reservationId: inHouse.id, kind: "refund", label: "Refund", amount: 2000 })]);
  const f = folioOf(s2.reservations.find((r) => r.id === inHouse.id)!);
  const base = inHouse.total + (inHouse.extras ?? []).reduce((a, x) => a + x.price, 0) - (inHouse.discount ?? 0);
  assert.equal(f.charges, base + 4000);
  assert.equal(f.paid, 8000);
  assert.equal(f.balance, base + 4000 - 8000);
});

test("copilot: numbers are traceable and equal the analytics module; permissions; unsupported questions refused", () => {
  const s = replay(BASE, []);
  const gm = s.staff.find((x) => x.position === "general_manager")!;
  const hk = s.staff.find((x) => x.position === "housekeeper")!;
  const occ = askCopilot(s, "Քանի՞ սենյակ է զբաղված այսօր", gm, NOW);
  assert.ok(occ.figures[0].value.startsWith(`${occupiedOn(s, BASE).length} / ${s.rooms.length}`));
  assert.ok(occ.figures.every((f) => f.formula && f.source));
  const c = askCopilot(s, "How is the cancellation rate changing?", gm, NOW);
  const k = computeKpis(s, periods(BASE).last30);
  assert.ok(c.figures[0].value.startsWith(`${k.cancelled} / ${k.bookings}`));
  assert.equal(askCopilot(s, "How many bookings came from each channel?", hk, NOW).refused, true, "housekeeper cannot see channel revenue data");
  assert.equal(askCopilot(s, "What will the weather be?", gm, NOW).refused, true);
  const sum = askCopilot(s, "Ամփոփիր այսօրվա օրը", gm, NOW);
  assert.ok(sum.items.length >= 5);
  assert.equal(sum.analysisOnly, true);
});
