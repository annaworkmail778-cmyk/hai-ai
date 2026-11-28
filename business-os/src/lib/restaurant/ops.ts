/*
 * Restaurant OS operations reducer (extends engine.ts): floor & waiter workflows, courses, bills and payments,
 * reservations & waitlist, unified inbox, reviews, CRM & loyalty, team, stocktake, purchase approval,
 * and the automation runner with an execution log.
 *
 * Automation rules: every automation is enabled/disabled per restaurant, runs inside the reducer (deterministic on every
 * device), is idempotent by `${automationId}:${ref}` and never dispatches further events, so loops are impossible.
 * Payments: a bill part becomes "paid" ONLY from a `payment.result` produced by a payment adapter. Staff can "record"
 * cash or an external POS settlement, which is labelled as recorded, not provider-verified.
 */
import { accept, addMove, fire, moveLine, onHand, recalc, releaseLines, setStatus, syncFromTickets } from "./engine.ts";
import { draftReply, analyzeReview, detectLang, intentOf } from "./nlp.ts";
import { canMove, linesCost, unitCost } from "./rules.ts";
import type { AutomationId, BillPart, Conversation, Customer, Order, RestaurantState, RStamped, TableSession } from "./types.ts";

export const PO_APPROVAL_LIMIT = 150_000;
export const SIMULATED_PAYMENT_ADAPTERS = ["demo-terminal"];
export const TURN_MIN = (party: number) => (party <= 2 ? 75 : party <= 4 ? 95 : 120);
export const RES_BUFFER_MIN = 15;

const tableLabel = (s: RestaurantState, id: string) => s.tables.find((t) => t.id === id)?.label ?? id;
const staffName = (s: RestaurantState, by: string) => (by === "guest" ? "Հյուր" : by === "presenter" ? "Ներկայացում" : by === "seed" ? "Համակարգ" : by.startsWith("adapter:") ? by.slice(8) : s.staff.find((x) => x.id === by)?.name ?? "Աշխատակից");

/* ---------------- automation runner ---------------- */

export function runAuto(s: RestaurantState, id: AutomationId, ref: string, at: number, detail: string, fn?: () => void): boolean {
  const key = `${id}:${ref}`;
  if (!s.automations[id]) { if (!s.autolog.some((x) => x.id === key)) s.autolog.unshift({ id: key, automationId: id, at, ref, result: "skipped", detail: "Անջատված է" }); return false; }
  if (s.autolog.some((x) => x.id === key && x.result === "ok")) return false; // idempotent: never twice for the same trigger
  try {
    fn?.();
    s.autolog.unshift({ id: key, automationId: id, at, ref, result: "ok", detail });
    return true;
  } catch (e) {
    s.autolog.unshift({ id: key, automationId: id, at, ref, result: "failed", detail: String(e).slice(0, 120) });
    return false;
  }
}

const task = (s: RestaurantState, id: string, at: number, title: string, opts: { role?: Customer["tags"][number] | string; assigneeId?: string; priority?: "normal" | "high"; ref?: string; source?: "automation" | "manual" | "assistant" } = {}) => {
  if (s.tasks.some((t) => t.id === id)) return;
  s.tasks.unshift({ id, title, assigneeId: opts.assigneeId, role: opts.role as never, priority: opts.priority ?? "normal", status: "open", createdAt: at, source: opts.source ?? "automation", ref: opts.ref });
};

/* ---------------- customers & loyalty ---------------- */

export const normPhone = (p: string) => p.replace(/\D/g, "").replace(/^0+/, "");

export function upsertCustomer(s: RestaurantState, name: string, phone: string, at: number, source: string, lang: Customer["lang"] = "hy"): Customer | undefined {
  const n = normPhone(phone);
  if (n.length < 6) return undefined;
  let c = s.customers.find((x) => normPhone(x.phone) === n);
  if (!c) {
    c = { id: `cu-${n}`, name: name.trim() || "Հյուր", phone, lang, firstSeen: at, visits: 0, spend: 0, orders: 0, favourites: [], tags: ["Նոր"], consent: { marketing: false, at, source }, points: 0, tier: "member" };
    s.customers.unshift(c);
  }
  return c;
}

export const tierOf = (s: RestaurantState, points: number) => [...s.loyalty.tiers].sort((a, b) => b.min - a.min).find((t) => points >= t.min)?.id ?? "member";

/** Called by the engine when an order reaches "completed": customer stats and loyalty points (once per order). */
export function onOrderCompleted(s: RestaurantState, o: Order, at: number) {
  const sess = o.sessionId ? s.sessions.find((x) => x.id === o.sessionId) : undefined;
  const cid = sess?.customerId ?? (o.contact ? upsertCustomer(s, o.contact.name, o.contact.phone, at, "takeaway")?.id : undefined);
  const c = cid ? s.customers.find((x) => x.id === cid) : undefined;
  if (!c) return;
  c.orders += 1; c.spend += o.total; c.lastVisit = at;
  const counts: Record<string, number> = {};
  for (const l of o.lines) if (l.status === "active") counts[l.itemId] = (counts[l.itemId] ?? 0) + l.qty;
  c.favourites = Array.from(new Set([...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k]) => k), ...c.favourites])).slice(0, 4);
  c.tags = c.tags.filter((t) => t !== "Նոր");
  if (s.loyalty.enabled && !s.loyalty.ledger.some((e) => e.key === `earn:${o.id}`)) {
    const pts = Math.floor(o.total / 1000) * s.loyalty.earnPer1000;
    if (pts > 0) { s.loyalty.ledger.unshift({ key: `earn:${o.id}`, customerId: c.id, points: pts, at, reason: `Պատվեր ${o.code}` }); c.points += pts; c.tier = tierOf(s, c.points); }
  }
}

/** Called when a table session closes: one visit for the linked guest. */
export function closeHook(s: RestaurantState, sess: TableSession, at: number, who: string) {
  void who;
  const c = sess.customerId ? s.customers.find((x) => x.id === sess.customerId) : undefined;
  if (c) c.visits += 1;
  if (sess.reservationId) { const r = s.reservations.find((x) => x.id === sess.reservationId); if (r && r.status === "seated") { r.status = "completed"; r.history.push({ at, text: "Այցը ավարտվեց", by: "Համակարգ" }); } }
}

/** Called by the engine when an ingredient crosses below its minimum. */
export function onLowStock(s: RestaurantState, ingredientId: string, at: number) {
  const ing = s.ingredients.find((i) => i.id === ingredientId);
  if (!ing) return;
  const open = s.pos.some((p) => ["draft", "pending_approval", "approved", "sent", "partial"].includes(p.status) && p.lines.some((l) => l.ingredientId === ingredientId && l.received < l.qty));
  if (open) return;
  const qty = Math.max(1, Math.ceil(((ing.parLevel - onHand(s, ingredientId)) / ing.unitsPerPurchase) * 10) / 10);
  runAuto(s, "low_stock_purchase_draft", `${ingredientId}:${Math.floor(at / 3600000)}`, at, `Սևագիր գնման պատվեր՝ ${ing.name} ${qty} ${ing.purchaseUnit} (չի ուղարկվել, պահանջում է աշխատակցի հաստատում)`, () => {
    s.seq.po += 1;
    const total = qty * ing.cost;
    s.pos.unshift({ id: `po-auto-${ingredientId}-${at}`, code: `PO-${String(s.seq.po).padStart(3, "0")}`, supplierId: ing.supplierId, status: total > PO_APPROVAL_LIMIT ? "pending_approval" : "draft", createdAt: at, total, auto: true, lines: [{ ingredientId, qty, cost: ing.cost, received: 0 }] });
  });
}

/* ---------------- reservations ---------------- */

const overlaps = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;

/** Tables free for [at, at+duration] considering reservations, open sessions (expected turn time) and blocks. */
export function tableFree(s: RestaurantState, tableId: string, at: number, durationMin: number, exceptResId?: string) {
  const t = s.tables.find((x) => x.id === tableId);
  if (!t || t.blocked || !s.areas.find((a) => a.id === t.areaId)?.open) return false;
  const a0 = at - RES_BUFFER_MIN * 60000, a1 = at + (durationMin + RES_BUFFER_MIN) * 60000;
  for (const r of s.reservations) {
    if (r.id === exceptResId || !["confirmed", "seated"].includes(r.status) || !r.tableIds.includes(tableId)) continue;
    if (overlaps(a0, a1, r.at, r.at + r.durationMin * 60000)) return false;
  }
  const sess = s.sessions.find((x) => x.status === "open" && (x.tableId === tableId || x.mergedTables?.includes(tableId)));
  if (sess && at < sess.openedAt + TURN_MIN(sess.partySize) * 60000) return false;
  return true;
}

/** Suggestion: smallest single table that fits, else a pair of combinable tables. */
export function suggestTables(s: RestaurantState, at: number, party: number, durationMin = TURN_MIN(party), exceptResId?: string): string[] | null {
  const free = s.tables.filter((t) => tableFree(s, t.id, at, durationMin, exceptResId));
  const single = free.filter((t) => t.seats >= party && t.seats <= party + 4).sort((a, b) => a.seats - b.seats)[0];
  if (single) return [single.id];
  for (const t of free) for (const o of t.combinableWith ?? []) {
    const u = free.find((x) => x.id === o);
    if (u && t.seats + u.seats >= party) return [t.id, u.id];
  }
  const big = free.filter((t) => t.seats >= party).sort((a, b) => a.seats - b.seats)[0];
  return big ? [big.id] : null;
}

export function slotsFor(s: RestaurantState, day: string, party: number, from = "12:00", to = "22:00") {
  const out: { at: number; ok: boolean }[] = [];
  const base = Date.parse(`${day}T00:00:00+04:00`);
  const [fh, fm] = from.split(":").map(Number), [th, tm] = to.split(":").map(Number);
  for (let m = fh * 60 + fm; m <= th * 60 + tm; m += 30) { const at = base + m * 60000; out.push({ at, ok: Boolean(suggestTables(s, at, party)) }); }
  return out;
}

/* ---------------- bills ---------------- */

export function sessionLines(s: RestaurantState, sess: TableSession) {
  return s.orders.filter((o) => o.sessionId === sess.id && !["cancelled", "rejected"].includes(o.status)).flatMap((o) => o.lines.filter((l) => l.status === "active").map((l) => ({ ...l, orderCode: o.code })));
}
export const sessionTotal = (s: RestaurantState, sess: TableSession) => sessionLines(s, sess).reduce((a, l) => a + l.unitPrice * l.qty, 0);
const findOpen = (s: RestaurantState, tableId: string) => s.sessions.find((x) => x.status === "open" && (x.tableId === tableId || x.mergedTables?.includes(tableId)));

/* ---------------- inbox ---------------- */

function conversationFor(s: RestaurantState, ev: Extract<RStamped, { type: "inbox.receive" }>): Conversation {
  let c = ev.conversationId ? s.inbox.find((x) => x.id === ev.conversationId) : s.inbox.find((x) => x.channel === ev.channel && x.customer.handle === ev.from.handle && x.status !== "resolved");
  if (!c) {
    c = { id: ev.conversationId ?? `cv-${ev.id}`, channel: ev.channel, customer: { name: ev.from.name.slice(0, 60) || "Հյուր", handle: ev.from.handle.slice(0, 60) }, lang: detectLang(ev.text), status: "new", priority: "normal", tags: [], messages: [], unread: 0, firstInAt: ev.at, deviceKey: ev.deviceKey };
    s.inbox.unshift(c);
  } else if (c.status === "resolved") c.status = "open";
  return c;
}

/* ---------------- reducer for the new events ---------------- */

export function applyOps(s: RestaurantState, ev: RStamped, who: string) {
  const at = ev.at, id = ev.id;
  switch (ev.type) {
    /* ---------- floor & waiter ---------- */
    case "table.notes": {
      const sess = findOpen(s, ev.tableId);
      if (!sess) return;
      if (ev.allergies !== undefined) sess.allergies = ev.allergies.slice(0, 200) || undefined;
      if (ev.notes !== undefined) sess.notes = ev.notes.slice(0, 300) || undefined;
      if (ev.partySize && ev.partySize >= 1 && ev.partySize <= 30) sess.partySize = Math.floor(ev.partySize);
      return;
    }
    case "table.transfer": {
      const sess = findOpen(s, ev.fromTableId);
      const to = s.tables.find((t) => t.id === ev.toTableId);
      if (!sess || !to || to.blocked || findOpen(s, ev.toTableId) || s.cleaning.includes(ev.toTableId)) return;
      const from = sess.tableId;
      sess.tableId = to.id;
      s.orders.filter((o) => o.sessionId === sess.id).forEach((o) => (o.tableId = to.id));
      s.requests.filter((r) => r.sessionId === sess.id).forEach((r) => (r.tableId = to.id));
      s.activity.unshift({ id: `a-${id}`, at, text: `Հյուրերը տեղափոխվեցին՝ սեղան ${tableLabel(s, from)} → ${to.label}`, by: who, kind: "table" });
      return;
    }
    case "table.assign": {
      const sess = findOpen(s, ev.tableId);
      if (!sess || !s.staff.some((x) => x.id === ev.waiterId)) return;
      sess.waiterId = ev.waiterId;
      s.activity.unshift({ id: `a-${id}`, at, text: `Սեղան ${tableLabel(s, ev.tableId)}՝ պատասխանատու ${staffName(s, ev.waiterId)}`, by: who, kind: "table" });
      return;
    }
    case "table.merge": {
      const a = findOpen(s, ev.tableId);
      if (!a || ev.withTableId === a.tableId || a.mergedTables?.includes(ev.withTableId)) return;
      const other = s.tables.find((t) => t.id === ev.withTableId);
      if (!other || other.blocked) return;
      const b = findOpen(s, ev.withTableId);
      if (b) {
        if (b.bill) return;
        s.orders.filter((o) => o.sessionId === b.id).forEach((o) => { o.sessionId = a.id; });
        s.requests.filter((r) => r.sessionId === b.id).forEach((r) => (r.sessionId = a.id));
        a.partySize += b.partySize;
        b.status = "closed"; b.closedAt = at;
        a.mergedTables = [...(a.mergedTables ?? []), b.tableId, ...(b.mergedTables ?? [])];
      } else a.mergedTables = [...(a.mergedTables ?? []), ev.withTableId];
      s.activity.unshift({ id: `a-${id}`, at, text: `Սեղաններ միացվեցին՝ ${tableLabel(s, a.tableId)} + ${other.label}`, by: who, kind: "table" });
      return;
    }
    case "table.block": {
      const t = s.tables.find((x) => x.id === ev.tableId);
      if (!t || (ev.reason && findOpen(s, t.id))) return;
      t.blocked = ev.reason ? ev.reason.slice(0, 80) : undefined;
      return;
    }
    case "table.layout": {
      const t = s.tables.find((x) => x.id === ev.tableId);
      const ar = t && s.areas.find((a) => a.id === t.areaId);
      if (!t || !ar) return;
      if (ev.x !== undefined) t.x = Math.max(0, Math.min(ar.w - t.w, Math.round(ev.x * 2) / 2));
      if (ev.y !== undefined) t.y = Math.max(0, Math.min(ar.h - t.h, Math.round(ev.y * 2) / 2));
      if (ev.seats && ev.seats >= 1 && ev.seats <= 30) t.seats = Math.floor(ev.seats);
      if (ev.shape) t.shape = ev.shape;
      return;
    }
    case "order.moveLines": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      const to = s.tables.find((t) => t.id === ev.toTableId);
      if (!o || !to || o.type !== "dine_in" || !["accepted", "preparing", "ready", "served"].includes(o.status) || to.blocked) return;
      const moving = o.lines.filter((l) => ev.lineIds.includes(l.id) && l.status === "active");
      if (!moving.length || moving.length === o.lines.filter((l) => l.status === "active").length && o.tableId === to.id) return;
      let sess = findOpen(s, to.id);
      if (!sess) { sess = { id: `ss-${id}`, tableId: to.id, openedAt: at, partySize: 1, waiterId: to.waiterId, status: "open" }; s.sessions.push(sess); }
      if (sess.bill) return;
      s.seq.order += 1;
      const no: Order = { ...structuredClone(o), id: `o-${id}`, code: `S-${String(s.seq.order).padStart(4, "0")}`, tableId: to.id, sessionId: sess.id, lines: moving, history: [{ at, status: o.status, by: who, note: `Տեղափոխված ${o.code}-ից` }], deviceKey: undefined, fee: 0 };
      o.lines = o.lines.filter((l) => !ev.lineIds.includes(l.id));
      recalc(o); recalc(no);
      // tickets follow their lines (same line ids, so stock consumption keys stay valid)
      for (const t of s.tickets.filter((x) => x.orderId === o.id)) {
        const mv = t.lineIds.filter((x) => ev.lineIds.includes(x));
        if (!mv.length) continue;
        if (mv.length === t.lineIds.length) t.orderId = no.id;
        else { t.lineIds = t.lineIds.filter((x) => !mv.includes(x)); s.tickets.push({ ...structuredClone(t), id: `${t.id}-m${id}`, orderId: no.id, lineIds: mv, itemsDone: t.itemsDone.filter((x) => mv.includes(x)) }); }
      }
      s.orders.push(no);
      if (!o.lines.some((l) => l.status === "active")) setStatus(s, o, "cancelled", at, who, "Բոլոր դիրքերը տեղափոխված են");
      syncFromTickets(s, no, at, who);
      s.activity.unshift({ id: `a-${id}`, at, text: `${moving.length} դիրք տեղափոխվեց ${o.code} → սեղան ${to.label} (${no.code})`, by: who, kind: "order" });
      return;
    }
    case "order.fireCourse": {
      const sess = findOpen(s, ev.tableId);
      if (!sess) return;
      const orders = s.orders.filter((o) => o.sessionId === sess.id);
      let fired = 0;
      for (const t of s.tickets) if (t.status === "held" && t.course <= ev.course && orders.some((o) => o.id === t.orderId)) { t.status = "queued"; t.firedAt = at; fired++; }
      if (!fired) return;
      orders.forEach((o) => { if (o.status === "served") setStatus(s, o, "preparing", at, who, `Կուրս ${ev.course}`); syncFromTickets(s, o, at, who); });
      s.activity.unshift({ id: `a-${id}`, at, text: `Սեղան ${tableLabel(s, ev.tableId)}՝ ուղարկվեց կուրս ${ev.course} (${fired} տոմս)`, by: who, kind: "kitchen" });
      return;
    }
    case "ticket.itemDone": {
      const t = s.tickets.find((x) => x.id === ev.ticketId);
      if (!t || !t.lineIds.includes(ev.lineId) || !["queued", "in_progress"].includes(t.status)) return;
      t.itemsDone = ev.done ? Array.from(new Set([...t.itemsDone, ev.lineId])) : t.itemsDone.filter((x) => x !== ev.lineId);
      if (t.status === "queued" && ev.done) { t.status = "in_progress"; t.startedAt = at; const o = s.orders.find((x) => x.id === t.orderId); if (o) syncFromTickets(s, o, at, who); }
      return;
    }
    case "ticket.reopen": {
      const t = s.tickets.find((x) => x.id === ev.ticketId);
      const o = t && s.orders.find((x) => x.id === t.orderId);
      if (!t || !o || !["ready", "bumped"].includes(t.status)) return;
      const role = s.staff.find((x) => x.id === ev.by)?.role;
      if (ev.by !== "presenter" && role !== "chef" && role !== "manager" && role !== "owner") return; // authorisation
      t.status = "in_progress"; t.readyAt = undefined; t.bumpedAt = undefined; t.reopenedBy = ev.by;
      if (canMove(o.status, "preparing") || o.status === "served") setStatus(s, o, "preparing", at, who, `Վերաբացված՝ ${ev.reason}`);
      s.activity.unshift({ id: `a-${id}`, at, text: `Տոմսը վերաբացվեց ${o.code} (${ev.reason})`, by: who, kind: "kitchen" });
      return;
    }
    /* ---------- bills & payments ---------- */
    case "bill.prepare": {
      const sess = findOpen(s, ev.tableId);
      if (!sess) return;
      if (sess.bill && sess.bill.parts.some((p) => p.status !== "open" && p.status !== "declined")) return; // payments started: bill is locked
      const lines = sessionLines(s, sess);
      if (!lines.length) return;
      const total = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
      const sum = (ids: string[]) => lines.filter((l) => ids.includes(l.id)).reduce((a, l) => a + l.unitPrice * l.qty, 0);
      let parts: BillPart[] = [];
      if (ev.mode === "single") parts = [{ id: `bp-${id}-1`, label: "Ամբողջ հաշիվ", lineIds: lines.map((l) => l.id), amount: total, status: "open" }];
      else if (ev.mode === "seats") {
        const bySeat = new Map<string, string[]>();
        for (const l of lines) { const k = l.seat ? `Տեղ ${l.seat}` : "Ընդհանուր"; bySeat.set(k, [...(bySeat.get(k) ?? []), l.id]); }
        parts = [...bySeat.entries()].map(([label, ids], i) => ({ id: `bp-${id}-${i + 1}`, label, lineIds: ids, amount: sum(ids), status: "open" as const }));
      } else if (ev.mode === "equal") {
        const n = Math.max(2, Math.min(20, Math.floor(ev.n ?? 2)));
        const each = Math.floor(total / n);
        parts = Array.from({ length: n }, (_, i) => ({ id: `bp-${id}-${i + 1}`, label: `Մաս ${i + 1}/${n}`, lineIds: null, amount: i === n - 1 ? total - each * (n - 1) : each, status: "open" as const }));
      } else {
        const groups = (ev.groups ?? []).map((g) => g.filter((x) => lines.some((l) => l.id === x))).filter((g) => g.length);
        const used = new Set(groups.flat());
        const rest = lines.filter((l) => !used.has(l.id)).map((l) => l.id);
        parts = [...groups, ...(rest.length ? [rest] : [])].map((ids, i) => ({ id: `bp-${id}-${i + 1}`, label: `Հաշիվ ${i + 1}`, lineIds: ids, amount: sum(ids), status: "open" as const }));
      }
      sess.bill = { mode: ev.mode, parts, total, createdAt: at, by: ev.by };
      sess.billRequested = true;
      return;
    }
    case "payment.request": {
      const sess = findOpen(s, ev.tableId);
      const part = sess?.bill?.parts.find((p) => p.id === ev.partId);
      if (!sess || !part || (part.status !== "open" && part.status !== "declined") || ev.method !== "card_terminal") return;
      const pid = `pay-${id}`;
      s.payments.unshift({ id: pid, sessionId: sess.id, partId: part.id, amount: part.amount, method: ev.method, adapter: "demo-terminal", status: "pending", createdAt: at, by: ev.by });
      part.status = "pending"; part.paymentId = pid; part.method = ev.method;
      return;
    }
    case "payment.result": {
      const p = s.payments.find((x) => x.id === ev.paymentId);
      if (!p || p.status !== "pending" || p.adapter !== ev.adapter || !SIMULATED_PAYMENT_ADAPTERS.includes(ev.adapter)) return;
      if (!ev.providerRef || s.payments.some((x) => x.providerRef === ev.providerRef)) return; // idempotent by provider reference
      p.status = ev.approved ? "approved" : "declined"; p.providerRef = ev.providerRef; p.resultAt = at;
      const sess = s.sessions.find((x) => x.id === p.sessionId);
      const part = sess?.bill?.parts.find((x) => x.id === p.partId);
      if (part) part.status = ev.approved ? "paid" : "declined";
      s.activity.unshift({ id: `a-${id}`, at, text: `Վճարում ${ev.approved ? "հաստատված" : "մերժված"} (${ev.adapter} · սիմուլյացիա) · ${p.amount} ֏`, by: "Վճարման ադապտեր", kind: "order" });
      return;
    }
    case "payment.record": {
      const sess = findOpen(s, ev.tableId);
      const part = sess?.bill?.parts.find((p) => p.id === ev.partId);
      if (!sess || !part || (part.status !== "open" && part.status !== "declined")) return;
      const role = s.staff.find((x) => x.id === ev.by)?.role;
      if (ev.by !== "presenter" && !["cashier", "manager", "owner"].includes(role ?? "")) return;
      const pid = `pay-${id}`;
      s.payments.unshift({ id: pid, sessionId: sess.id, partId: part.id, amount: part.amount, method: ev.method, adapter: ev.method === "pos" ? "external-pos" : "cash-drawer", status: "recorded", createdAt: at, resultAt: at, by: ev.by });
      part.status = "recorded"; part.paymentId = pid; part.method = ev.method;
      return;
    }
    /* ---------- reservations & waitlist ---------- */
    case "reservation.request": {
      const party = Math.floor(ev.partySize);
      if (!(party >= 1 && party <= 30) || !ev.name.trim() || normPhone(ev.phone).length < 6 || ev.at < at - 3600000) return;
      s.seq.res += 1;
      const c = upsertCustomer(s, ev.name, ev.phone, at, `reservation:${ev.source}`);
      const r = { id: `rv-${id}`, code: `R-${String(s.seq.res).padStart(4, "0")}`, name: ev.name.trim().slice(0, 60), phone: ev.phone.slice(0, 30), partySize: party, at: ev.at, durationMin: TURN_MIN(party), tableIds: [] as string[], status: "requested" as const, source: ev.source, note: ev.note?.slice(0, 200), allergies: ev.allergies?.slice(0, 200), occasion: ev.occasion?.slice(0, 60), customerId: c?.id, deviceKey: ev.deviceKey, history: [{ at, text: "Հարցումը ստացվեց", by: ev.source === "website" ? "Կայք" : who }] };
      s.reservations.push(r);
      runAuto(s, "reservation_host_alert", r.id, at, `Ծանուցում հյուրընկալողին՝ ${r.code}`, () => s.notices.unshift({ id: `n-${id}`, at, text: `Ամրագրման հարցում ${r.code} · ${r.partySize} հյուր · ${r.name}`, href: `/r/host?res=${r.id}`, read: false, kind: "order" }));
      return;
    }
    case "reservation.confirm":
    case "reservation.modify": {
      const r = s.reservations.find((x) => x.id === ev.reservationId);
      if (!r) return;
      if (ev.type === "reservation.confirm" && r.status !== "requested") return;
      if (ev.type === "reservation.modify" && !["requested", "confirmed"].includes(r.status)) return;
      const nextAt = ev.type === "reservation.modify" && ev.at ? ev.at : r.at;
      const party = ev.type === "reservation.modify" && ev.partySize ? Math.floor(ev.partySize) : r.partySize;
      const tables = ev.tableIds ?? r.tableIds;
      const dur = TURN_MIN(party);
      // server-side availability check: every table free for the whole slot, enough seats → otherwise the change is refused (no double booking)
      if (r.status === "confirmed" || ev.type === "reservation.confirm") {
        if (!tables.length || tables.some((t) => !tableFree(s, t, nextAt, dur, r.id))) return;
        if (tables.reduce((a, t) => a + (s.tables.find((x) => x.id === t)?.seats ?? 0), 0) < party) return;
      }
      r.at = nextAt; r.partySize = party; r.durationMin = dur; r.tableIds = [...tables];
      if (ev.type === "reservation.confirm") {
        r.status = "confirmed";
        s.outbox.unshift({ id: `ob-${id}`, at, channel: "sms", to: r.name, text: `${s.brand.name}: ամրագրումը հաստատված է (${r.code})`, state: "simulated", ref: r.id });
      }
      r.history.push({ at, text: ev.type === "reservation.confirm" ? `Հաստատվեց · սեղան ${r.tableIds.map((t) => tableLabel(s, t)).join("+")}` : "Փոփոխվեց", by: who });
      return;
    }
    case "reservation.decline":
    case "reservation.cancel": {
      const r = s.reservations.find((x) => x.id === ev.reservationId);
      if (!r || !["requested", "confirmed"].includes(r.status)) return;
      if (ev.type === "reservation.decline" && r.status !== "requested") return;
      r.status = ev.type === "reservation.decline" ? "declined" : "cancelled";
      r.history.push({ at, text: `${ev.type === "reservation.decline" ? "Մերժվեց" : "Չեղարկվեց"}՝ ${ev.reason}`, by: who });
      return;
    }
    case "reservation.seat": {
      const r = s.reservations.find((x) => x.id === ev.reservationId);
      if (!r || r.status !== "confirmed" || !r.tableIds.length || r.tableIds.some((t) => findOpen(s, t))) return;
      const [main, ...rest] = r.tableIds;
      const t = s.tables.find((x) => x.id === main)!;
      s.sessions.push({ id: `ss-${id}`, tableId: main, openedAt: at, partySize: r.partySize, waiterId: t.waiterId, status: "open", mergedTables: rest.length ? rest : undefined, reservationId: r.id, customerId: r.customerId, allergies: r.allergies, notes: [r.occasion, r.note].filter(Boolean).join(" · ") || undefined });
      s.cleaning = s.cleaning.filter((x) => !r.tableIds.includes(x));
      r.status = "seated"; r.history.push({ at, text: "Հյուրերը նստեցին", by: who });
      return;
    }
    case "reservation.noShow": {
      const r = s.reservations.find((x) => x.id === ev.reservationId);
      if (!r || r.status !== "confirmed" || at < r.at + 15 * 60000) return; // only after the grace period
      r.status = "no_show"; r.history.push({ at, text: "Չներկայացավ", by: who });
      const c = r.customerId ? s.customers.find((x) => x.id === r.customerId) : undefined;
      if (c && !c.tags.includes("No-show")) c.tags.push("No-show");
      return;
    }
    case "reservation.remind": {
      const r = s.reservations.find((x) => x.id === ev.reservationId);
      if (!r || r.status !== "confirmed" || r.reminded) return;
      runAuto(s, "reservation_reminder", r.id, at, `Հիշեցում ${r.code} (SMS · սիմուլյացիա)`, () => {
        r.reminded = true;
        s.outbox.unshift({ id: `ob-${id}`, at, channel: "sms", to: r.name, text: `${s.brand.name}: սպասում ենք Ձեզ այսօր (${r.code}, ${r.partySize} հյուր)`, state: "simulated", ref: r.id });
      });
      return;
    }
    case "waitlist.add": {
      const party = Math.floor(ev.partySize);
      if (!(party >= 1 && party <= 20) || !ev.name.trim()) return;
      const ahead = s.waitlist.filter((w) => w.status === "waiting").length;
      s.waitlist.push({ id: `wl-${id}`, name: ev.name.trim().slice(0, 60), phone: ev.phone.slice(0, 30), partySize: party, addedAt: at, quotedMin: 10 + ahead * 10, status: "waiting" });
      return;
    }
    case "waitlist.notify": {
      const w = s.waitlist.find((x) => x.id === ev.entryId);
      if (!w || w.status !== "waiting") return;
      w.status = "notified";
      s.outbox.unshift({ id: `ob-${id}`, at, channel: "sms", to: w.name, text: `${s.brand.name}: Ձեր սեղանը պատրաստ է`, state: "simulated" });
      return;
    }
    case "waitlist.seat": {
      const w = s.waitlist.find((x) => x.id === ev.entryId);
      const t = s.tables.find((x) => x.id === ev.tableId);
      if (!w || !["waiting", "notified"].includes(w.status) || !t || findOpen(s, t.id) || t.blocked) return;
      // walk-in seated → assign the least-loaded waiter of that area
      const waiters = s.staff.filter((x) => x.role === "waiter" && x.areaIds?.includes(t.areaId));
      const load = (wid: string) => s.sessions.filter((x) => x.status === "open" && x.waiterId === wid).length;
      const waiter = waiters.sort((a, b) => load(a.id) - load(b.id))[0]?.id ?? t.waiterId;
      s.sessions.push({ id: `ss-${id}`, tableId: t.id, openedAt: at, partySize: w.partySize, waiterId: waiter, status: "open" });
      s.cleaning = s.cleaning.filter((x) => x !== t.id);
      w.status = "seated"; w.tableId = t.id;
      runAuto(s, "walkin_assign", w.id, at, `Սեղան ${t.label} → ${staffName(s, waiter)} (ամենաքիչ ծանրաբեռնված)`);
      return;
    }
    case "waitlist.remove": {
      const w = s.waitlist.find((x) => x.id === ev.entryId);
      if (w && ["waiting", "notified"].includes(w.status)) w.status = "left";
      return;
    }
    /* ---------- inbox ---------- */
    case "inbox.receive": {
      const text = ev.text.trim().slice(0, 1000);
      if (!text) return;
      const c = conversationFor(s, ev);
      const intent = intentOf(text);
      c.messages.push({ id: `m-${id}`, dir: "in", text, at, author: c.customer.name, state: "received", intent });
      c.unread += 1;
      if (["complaint", "manager", "allergy", "price_discount"].includes(intent)) c.priority = "high";
      if (!c.tags.includes(intent) && intent !== "other") c.tags.push(intent);
      c.draft = draftReply(s, c, at);
      if (c.draft.risk === "low" && s.inboxSettings.autoReplyIntents.includes(c.draft.intent)) {
        const d = c.draft;
        runAuto(s, "inbox_auto_reply", `${c.id}:${id}`, at, `Ավտոմատ պատասխան (${d.intent}) · ${c.channel}`, () => {
          c.messages.push({ id: `m-a-${id}`, dir: "out", text: d.text, at: at + 1, author: "AI (ավտոմատ)", state: c.channel === "webchat" ? "auto_delivered" : "auto_simulated", intent: d.intent });
          c.firstReplyAt ??= at + 1;
          c.draft = undefined;
        });
      }
      if (c.priority === "high") s.notices.unshift({ id: `n-${id}`, at, text: `Հաղորդագրություն (${c.channel})՝ ${c.customer.name} · պահանջում է մենեջերի ուշադրություն`, href: `/r/admin/inbox?c=${c.id}`, read: false, kind: "request" });
      return;
    }
    case "inbox.send": {
      const c = s.inbox.find((x) => x.id === ev.conversationId);
      const text = ev.text.trim().slice(0, 1000);
      if (!c || !text) return;
      c.messages.push({ id: `m-${id}`, dir: "out", text, at, author: who, state: c.channel === "webchat" ? "delivered" : "simulated" });
      c.firstReplyAt ??= at;
      c.unread = 0;
      c.draft = undefined;
      if (c.status === "new" || c.status === "open") c.status = "pending";
      if (!c.assigneeId && ev.by !== "presenter") c.assigneeId = ev.by;
      return;
    }
    case "inbox.assign": { const c = s.inbox.find((x) => x.id === ev.conversationId); if (c && s.staff.some((x) => x.id === ev.assigneeId)) { c.assigneeId = ev.assigneeId; if (c.status === "new") c.status = "open"; } return; }
    case "inbox.status": { const c = s.inbox.find((x) => x.id === ev.conversationId); if (c) c.status = ev.status; return; }
    case "inbox.note": { const c = s.inbox.find((x) => x.id === ev.conversationId); if (c && ev.text.trim()) c.messages.push({ id: `m-${id}`, dir: "note", text: ev.text.trim().slice(0, 500), at, author: who }); return; }
    case "inbox.tag": { const c = s.inbox.find((x) => x.id === ev.conversationId); if (c && ev.tag.trim() && !c.tags.includes(ev.tag)) c.tags.push(ev.tag.trim().slice(0, 30)); return; }
    case "inbox.read": { const c = s.inbox.find((x) => x.id === ev.conversationId); if (c) { c.unread = 0; if (c.status === "new") c.status = "open"; } return; }
    case "inbox.autoreply": s.inboxSettings.autoReplyIntents = ev.intents.filter((i) => ["hours", "menu", "thanks"].includes(i)); return; // only low-risk intents can ever be automated
    /* ---------- reviews ---------- */
    case "review.receive": {
      if (!(ev.rating >= 1 && ev.rating <= 5) || !ev.text.trim()) return;
      const r = { id: `rv-r-${id}`, platform: ev.platform, rating: Math.round(ev.rating), text: ev.text.slice(0, 2000), lang: detectLang(ev.text), author: ev.author.slice(0, 40), at, categories: analyzeReview(ev.text) };
      s.reviews.unshift(r);
      if (r.rating <= 3) runAuto(s, "negative_review_task", r.id, at, `Առաջադրանք մենեջերին՝ ${r.rating}★ կարծիք (${r.platform})`, () => {
        task(s, `tk-rev-${r.id}`, at, `Պատասխանել ${r.rating}★ կարծիքին (${r.platform}) և ստուգել պատճառը`, { role: "manager", priority: "high", ref: r.id });
        (r as { taskId?: string }).taskId = `tk-rev-${r.id}`;
        s.notices.unshift({ id: `n-${id}`, at, text: `Նոր ${r.rating}★ կարծիք (${r.platform})`, href: `/r/admin/reviews?r=${r.id}`, read: false, kind: "request" });
      });
      return;
    }
    case "review.reply": {
      const r = s.reviews.find((x) => x.id === ev.reviewId);
      if (!r || !ev.text.trim()) return;
      // Google: reply API exists (verified location + approved API access); demo adapter simulates it. Tripadvisor/TheFork: no public reply API → manual.
      const status = !ev.publish ? "draft" : r.platform === "google" ? "published_simulated" : "manual_required";
      r.reply = { text: ev.text.slice(0, 2000), status, by: who, at };
      if (ev.publish && r.taskId) { const t = s.tasks.find((x) => x.id === r.taskId); if (t) { t.status = "done"; t.doneAt = at; } }
      return;
    }
    /* ---------- CRM, loyalty ---------- */
    case "customer.update": {
      const c = s.customers.find((x) => x.id === ev.customerId);
      if (!c) return;
      if (ev.consent !== undefined) c.consent = { marketing: ev.consent, at, source: `staff:${ev.by}` };
      if (ev.tags) c.tags = ev.tags.slice(0, 8);
      if (ev.notes !== undefined) c.notes = ev.notes.slice(0, 300);
      if (ev.dietary !== undefined) c.dietary = ev.dietary.slice(0, 120);
      return;
    }
    case "loyalty.config":
      if (ev.enabled !== undefined) s.loyalty.enabled = ev.enabled;
      if (ev.earnPer1000 !== undefined && ev.earnPer1000 >= 0 && ev.earnPer1000 <= 100) s.loyalty.earnPer1000 = ev.earnPer1000;
      return;
    /* ---------- team ---------- */
    case "task.create":
      if (!ev.title.trim()) return;
      s.tasks.unshift({ id: `tk-${id}`, title: ev.title.slice(0, 160), assigneeId: ev.assigneeId, role: ev.role, priority: ev.priority, due: ev.due, status: "open", createdAt: at, source: ev.source ?? "manual", ref: ev.ref });
      return;
    case "task.done": { const t = s.tasks.find((x) => x.id === ev.taskId); if (t && t.status === "open") { t.status = "done"; t.doneAt = at; } return; }
    case "team.msg": if (ev.text.trim()) s.teamMsgs.unshift({ id: `tm-${id}`, channel: ev.channel, at, by: ev.by, text: ev.text.slice(0, 500), urgent: ev.urgent }); return;
    case "shift.handover": {
      const open = s.sessions.filter((x) => x.status === "open");
      const auto = [
        `Բաց սեղաններ՝ ${open.length}${open.length ? ` (${open.map((x) => tableLabel(s, x.tableId)).join(", ")})` : ""}`,
        `Խոհանոցում՝ ${s.orders.filter((o) => ["accepted", "preparing"].includes(o.status)).length} պատվեր`,
        `Չպատասխանված հաղորդագրություններ՝ ${s.inbox.filter((c) => c.status === "new" || (c.status === "open" && c.unread)).length}`,
        `Բաց առաջադրանքներ՝ ${s.tasks.filter((t) => t.status === "open").length}`,
        `Պաշար նվազագույնից ցածր՝ ${s.ingredients.filter((i) => onHand(s, i.id) < i.minLevel).map((i) => i.name).join(", ") || "չկա"}`,
      ];
      runAuto(s, "shift_handover", id, at, "Հերթափոխի փոխանցում ստեղծվեց", () => s.handovers.unshift({ id: `ho-${id}`, at, by: ev.by, text: [ev.text?.trim(), ...auto].filter(Boolean).join("\n"), auto: !ev.text }));
      return;
    }
    case "day.close": {
      const today = s.orders.filter((o) => !["cancelled", "rejected", "submitted"].includes(o.status));
      const gross = today.reduce((a, o) => a + o.total, 0);
      const counts: Record<string, number> = {};
      for (const o of today) for (const l of o.lines) if (l.status === "active") counts[l.name] = (counts[l.name] ?? 0) + l.qty;
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      const waste = s.moves.filter((m) => m.kind === "waste").reduce((a, m) => a + (m.qty < 0 ? -m.qty : m.lost ?? 0) * m.unitCost, 0);
      const lines = [
        `Վաճառք (ընդունված պատվերներ)՝ ${Math.round(gross).toLocaleString("en-US").replace(/,/g, " ")} ֏ · ${today.length} պատվեր`,
        `Ամենավաճառվողը՝ ${top ? `${top[0]} (${top[1]})` : "—"}`,
        `Չեղարկված պատվերներ՝ ${s.orders.filter((o) => o.status === "cancelled").length}`,
        `Կորուստ այսօր՝ ${Math.round(waste).toLocaleString("en-US").replace(/,/g, " ")} ֏`,
        `Ամրագրումներ՝ ${s.reservations.filter((r) => ["confirmed", "seated", "completed"].includes(r.status)).length}, չներկայացած՝ ${s.reservations.filter((r) => r.status === "no_show").length}`,
        `Նոր կարծիքներ՝ ${s.reviews.filter((r) => r.at >= s.epochAt).length}`,
      ];
      runAuto(s, "daily_summary", id, at, "Օրվա ամփոփում (սեփականատիրոջը՝ սիմուլյացիա)", () => {
        s.summaries.unshift({ id: `ds-${id}`, at, by: ev.by, text: lines });
        s.outbox.unshift({ id: `ob-${id}`, at, channel: "telegram", to: "Սեփականատեր", text: lines.join("\n"), state: "simulated" });
      });
      return;
    }
    /* ---------- inventory & purchasing ---------- */
    case "stock.count": {
      const lines = ev.lines.filter((l) => l.counted >= 0 && s.ingredients.some((i) => i.id === l.ingredientId));
      if (!lines.length) return;
      const rec = { id: `sc-${id}`, at, by: ev.by, lines: lines.map((l) => { const ing = s.ingredients.find((i) => i.id === l.ingredientId)!; return { ingredientId: l.ingredientId, expected: onHand(s, l.ingredientId), counted: l.counted, unitCost: unitCost(ing) }; }) };
      for (const l of rec.lines) addMove(s, `count:${id}:${l.ingredientId}`, l.ingredientId, l.counted - l.expected, "adjust", at, { reason: "Գույքագրում", by: ev.by });
      s.counts.unshift(rec);
      return;
    }
    case "po.approve": {
      const po = s.pos.find((x) => x.id === ev.poId);
      const role = s.staff.find((x) => x.id === ev.by)?.role;
      if (!po || po.status !== "pending_approval" || (ev.by !== "presenter" && role !== "manager" && role !== "owner")) return;
      po.status = "approved"; po.approvedBy = ev.by;
      return;
    }
    case "po.cancel": { const po = s.pos.find((x) => x.id === ev.poId); if (po && ["draft", "pending_approval", "approved"].includes(po.status)) po.status = "cancelled"; return; }
  }
}

/** Waste above this value (AMD) triggers the unusual-waste alert. */
export const UNUSUAL_WASTE_AMD = 10_000;
export function onWaste(s: RestaurantState, ingredientId: string, qty: number, at: number, ref: string) {
  const ing = s.ingredients.find((i) => i.id === ingredientId);
  if (!ing) return;
  const value = qty * unitCost(ing);
  if (value < UNUSUAL_WASTE_AMD) return;
  runAuto(s, "unusual_waste_alert", ref, at, `Մեծ կորուստ՝ ${ing.name} ≈ ${Math.round(value)} ֏`, () => s.notices.unshift({ id: `n-w-${ref}`, at, text: `Անսովոր կորուստ՝ ${ing.name} ≈ ${Math.round(value).toLocaleString("en-US").replace(/,/g, " ")} ֏`, href: `/r/admin/inventory?tab=waste`, read: false, kind: "stock" }));
}

/** Cancellation after cooking started → manager alert with reason. */
export function onLateCancel(s: RestaurantState, o: Order, reason: string, at: number, ref: string) {
  runAuto(s, "cancel_manager_alert", ref, at, `${o.code}՝ ${reason}`, () => s.notices.unshift({ id: `n-c-${ref}`, at, text: `Չեղարկում պատրաստելուց հետո՝ ${o.code} (${reason})`, href: `/r/admin/orders?open=${o.id}`, read: false, kind: "order" }));
}

export { linesCost, moveLine, releaseLines, fire, accept };
