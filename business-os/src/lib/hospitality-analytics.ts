/*
 * Management intelligence beyond room KPIs: guest, restaurant, staff and loyalty metrics.
 * Every metric is derived from the same event-sourced state, so numbers on different pages agree.
 * Formulas are documented next to each field (and shown in the UI).
 */
import { dayOf } from "./format.ts";
import { loyaltyOf } from "./rules.ts";
import type { HotelState, Order } from "./types.ts";
import type { Period } from "./analytics.ts";

const DAY = 86400e3;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Guests / reputation for arrivals in [p.from, p.to). */
export function guestStats(state: HotelState, p: Period) {
  const arr = state.reservations.filter((r) => r.checkIn >= p.from && r.checkIn < p.to);
  const due = arr.filter((r) => ["confirmed", "checked_in", "checked_out", "no_show"].includes(r.status) && r.checkIn < state.baseDate);
  const noShows = due.filter((r) => r.status === "no_show").length;
  const stays = arr.filter((r) => ["confirmed", "checked_in", "checked_out"].includes(r.status));
  const returning = stays.filter((r) => state.reservations.some((x) => x.guestId === r.guestId && x.status === "checked_out" && x.checkOut <= r.checkIn && x.id !== r.id)).length;
  const reviews = stays.map((r) => r.review?.score).filter((x): x is number => typeof x === "number");
  const memberStays = stays.filter((r) => state.accounts.some((a) => a.guestId === r.guestId));
  const extras = stays.reduce((a, r) => a + (r.extras ?? []).reduce((s, e) => s + e.price, 0), 0);
  return {
    stays: stays.length,
    /** no-shows ÷ arrivals that were due before today (confirmed/in-house/departed/no-show) */
    noShowRate: due.length ? noShows / due.length : 0, noShows, due: due.length,
    /** stays by guests with an earlier completed stay ÷ all stays */
    returningRate: stays.length ? returning / stays.length : 0, returning,
    /** mean review score (1–5) of stays that left a review */
    satisfaction: avg(reviews), reviewCount: reviews.length,
    memberShare: stays.length ? memberStays.length / stays.length : 0, memberStays: memberStays.length,
    extrasRevenue: extras,
  };
}

/** Restaurant for orders created in [fromMs, toMs). Revenue counts only completed orders, after discounts. */
export function restaurantStats(state: HotelState, fromMs: number, toMs: number) {
  const inP = state.orders.filter((o) => o.createdAt >= fromMs && o.createdAt < toMs);
  const done = inP.filter((o) => o.status === "completed");
  const closed = inP.filter((o) => ["completed", "rejected", "cancelled"].includes(o.status));
  const revenue = done.reduce((a, o) => a + o.total, 0);
  const prep = done.map((o) => { const a = o.history.find((h) => h.status === "accepted")?.at, r = o.history.find((h) => h.status === "ready")?.at; return a && r ? (r - a) / 60000 : null; }).filter((x): x is number => x !== null && x >= 0);
  const byType = (t: Order["type"]) => done.filter((o) => o.type === t).reduce((a, o) => a + o.total, 0);
  const days = new Map<string, number>();
  for (const o of done) days.set(dayOf(o.createdAt), (days.get(dayOf(o.createdAt)) ?? 0) + o.total);
  return {
    orders: done.length, revenue, discount: done.reduce((a, o) => a + o.discount, 0),
    /** revenue ÷ completed orders */
    avgCheck: done.length ? revenue / done.length : 0,
    /** (rejected + cancelled) ÷ closed orders */
    lossRate: closed.length ? (closed.length - done.length) / closed.length : 0,
    /** mean minutes accepted → ready */
    avgPrepMin: avg(prep),
    byType: { room_service: byType("room_service"), dine_in: byType("dine_in"), takeaway: byType("takeaway") },
    daily: [...days.entries()].sort((a, b) => a[0].localeCompare(b[0])),
  };
}

/** Staff operations: service-request responsiveness, overdue work, onboarding. */
export function staffStats(state: HotelState, fromMs: number, toMs: number) {
  const sr = state.services.filter((s) => s.createdAt >= fromMs && s.createdAt < toMs);
  const firstAction = sr.map((s) => { const h = s.history.find((x, i) => i > 0); return h ? (h.at - s.createdAt) / 60000 : null; }).filter((x): x is number => x !== null && x >= 0);
  const doneMin = sr.filter((s) => s.status === "done").map((s) => { const h = s.history.find((x) => x.text === "Կատարված է"); return h ? (h.at - s.createdAt) / 60000 : null; }).filter((x): x is number => x !== null && x >= 0);
  const byDept = new Map<string, number>();
  for (const s of sr) byDept.set(s.dept, (byDept.get(s.dept) ?? 0) + 1);
  const today = state.baseDate;
  const overdue = state.hkTasks.filter((t) => t.status !== "done" && t.due < today).length + state.staffTasks.filter((t) => t.status !== "done" && t.due < today).length;
  const enr = state.enrollments;
  const steps = enr.reduce((a, e) => a + (state.training.find((m) => m.id === e.moduleId)?.steps.length ?? 0), 0);
  return {
    requests: sr.length, completed: sr.filter((s) => s.status === "done").length,
    /** mean minutes from request to first staff action (assign / start) */
    avgResponseMin: avg(firstAction),
    /** mean minutes from request to "done" */
    avgCompletionMin: avg(doneMin),
    byDept: [...byDept.entries()].sort((a, b) => b[1] - a[1]),
    overdue,
    /** completed onboarding steps ÷ assigned steps */
    onboardingProgress: steps ? enr.reduce((a, e) => a + e.done.length, 0) / steps : 0,
    modulesApproved: enr.filter((e) => e.status === "approved").length, modulesTotal: enr.length,
    awaitingReview: enr.filter((e) => e.status === "submitted").length,
  };
}

/** Loyalty programme. Liability = outstanding points; value uses the cheapest order reward's ֏-per-point. */
export function loyaltyStats(state: HotelState, now: number) {
  const members = state.accounts.map((a) => ({ a, lo: loyaltyOf(state, a.guestId) }));
  const tiers = state.loyalty.tiers.map((t) => ({ tier: t, count: members.filter((m) => m.lo.tier.id === t.id).length }));
  const last30 = state.ledger.filter((e) => now - e.at < 30 * DAY);
  const issued30 = last30.filter((e) => e.points > 0).reduce((a, e) => a + e.points, 0);
  const redeemed30 = -last30.filter((e) => e.points < 0).reduce((a, e) => a + e.points, 0);
  const outstanding = members.reduce((a, m) => a + m.lo.balance, 0);
  const issuedAll = state.ledger.filter((e) => e.points > 0).reduce((a, e) => a + e.points, 0);
  const redeemedAll = -state.ledger.filter((e) => e.points < 0).reduce((a, e) => a + e.points, 0);
  const amt = state.rewards.filter((r) => r.kind === "amount" && r.cost > 0).map((r) => r.value / r.cost);
  const amdPerPoint = amt.length ? Math.min(...amt) : 0;
  const active90 = members.filter((m) => m.lo.entries.some((e) => now - e.at < 90 * DAY && e.reason !== "welcome")).length;
  const repeat = (ids: Set<string>) => { const gs = [...ids]; return gs.length ? gs.filter((g) => state.reservations.filter((r) => r.guestId === g && r.status === "checked_out").length >= 2).length / gs.length : 0; };
  const memberIds = new Set(state.accounts.map((a) => a.guestId));
  const nonMemberIds = new Set(state.reservations.filter((r) => r.status === "checked_out" && !memberIds.has(r.guestId)).map((r) => r.guestId));
  return {
    members: members.length, tiers, active90,
    issued30, redeemed30, issuedAll, redeemedAll,
    /** outstanding = Σ member balances = issued − redeemed (all time) */
    outstanding, amdPerPoint, liability: outstanding * amdPerPoint,
    vouchers: { active: state.vouchers.filter((v) => v.status === "active").length, reserved: state.vouchers.filter((v) => v.status === "reserved").length, used: state.vouchers.filter((v) => v.status === "used").length },
    /** guests with ≥ 2 completed stays ÷ guests with ≥ 1 completed stay */
    repeatMembers: repeat(new Set([...memberIds].filter((g) => state.reservations.some((r) => r.guestId === g && r.status === "checked_out")))),
    repeatNonMembers: repeat(nonMemberIds),
    campaigns: state.campaigns.map((c) => ({ c, uses: c.uses })),
  };
}
