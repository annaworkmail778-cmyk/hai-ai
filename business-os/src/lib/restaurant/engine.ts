/*
 * Restaurant OS reducer: the single source of truth. state = replay(seed(baseDate, epochAt), events).
 * Pure and deterministic: station routing, stock deduction, alerts and the simulated outbox all run here,
 * so the guest phone, the waiter phone, the kitchen screen and the owner dashboard always agree.
 *
 * Invariants (unit-tested):
 *  - prices come from the menu, never from the client; sold-out items and invalid modifiers are rejected
 *  - "accepted" only by a staff event or a visible auto-accept rule; preparing/ready derive from kitchen tickets
 *  - stock moves carry deterministic keys, so a line is consumed once; cancel before cooking reverses,
 *    after cooking records waste
 *  - external messages are only ever written to the outbox as "simulated"
 */
import { replayEvents } from "../kernel/replay.ts";
import { canMove, derivedKitchenStatus, linesCost, modifierError, modifiersOf, orderCode, recipeOf, unitCost } from "./rules.ts";
import { createSeed } from "./seed.ts";
import type { CartLine, MoveKind, Order, OrderLine, RecipeLine, RestaurantState, RStamped, StationId, Ticket } from "./types.ts";

const staffName = (s: RestaurantState, by: string) => (by === "guest" ? "Հյուր" : by === "presenter" ? "Ներկայացում" : by === "seed" ? "Համակարգ" : s.staff.find((x) => x.id === by)?.name ?? "Աշխատակից");

export const onHand = (s: RestaurantState, ingredientId: string) => (s.stockStart[ingredientId] ?? 0) + s.moves.reduce((a, m) => (m.ingredientId === ingredientId ? a + m.qty : a), 0);

function addMove(s: RestaurantState, key: string, ingredientId: string, qty: number, kind: MoveKind, at: number, extra: { ref?: string; reason?: string; by?: string } = {}) {
  if (!qty || s.moves.some((m) => m.key === key)) return false; // idempotent by key
  const ing = s.ingredients.find((i) => i.id === ingredientId);
  if (!ing) return false;
  const before = onHand(s, ingredientId);
  s.moves.push({ key, ingredientId, qty, kind, unitCost: unitCost(ing), at, ...extra });
  if (s.automations.low_stock_alert && qty < 0 && before >= ing.minLevel && before + qty < ing.minLevel && !s.notices.some((n) => n.id === `low-${ingredientId}`)) {
    s.notices.unshift({ id: `low-${ingredientId}`, at, text: `Պաշարը նվազագույնից ցածր է՝ ${ing.name}`, href: `/r/admin/inventory?open=${ingredientId}`, read: false, kind: "stock" });
  }
  return true;
}

/** Recipe lines (gross usage) consumed by one order line, incl. modifier deltas. */
function lineUsage(s: RestaurantState, l: OrderLine): RecipeLine[] {
  const item = s.items.find((i) => i.id === l.itemId);
  const base = recipeOf(s, l.itemId)?.lines ?? [];
  const mods = modifiersOf(item, l.modifiers.map((m) => m.id)).flatMap((m) => m.recipe ?? []);
  return [...base, ...mods];
}

function moveLine(s: RestaurantState, l: OrderLine, kind: "consume" | "reverse" | "waste", at: number, tag: string, reason?: string) {
  if (!s.automations.stock_deduction) return;
  lineUsage(s, l).forEach((r, idx) => {
    const qty = (r.qty / (r.yieldPct || 1)) * l.qty;
    const consumedKey = `consume:${l.id}:${idx}`;
    if (kind === "consume") addMove(s, consumedKey, r.ingredientId, -qty, "consume", at, { ref: l.id });
    else if (s.moves.some((m) => m.key === consumedKey) && !s.moves.some((m) => m.key === `reverse:${l.id}:${idx}` || m.key === `waste:${l.id}:${idx}`)) {
      // reverse puts stock back; waste keeps it consumed but records the loss (one of the two, never both)
      if (kind === "reverse") addMove(s, `reverse:${l.id}:${idx}`, r.ingredientId, qty, "reverse", at, { ref: l.id });
      else s.moves.push({ key: `waste:${l.id}:${idx}`, ingredientId: r.ingredientId, qty: 0, lost: qty, kind: "waste", unitCost: s.moves.find((m) => m.key === consumedKey)!.unitCost, at, ref: l.id, reason: reason ?? tag });
    }
  });
}

/** Quantity written off by a waste move (raw stock thrown away, or cooked food lost after an order was cancelled/remade). */
export const wasteQty = (m: { qty: number; lost?: number; kind: MoveKind }) => (m.kind !== "waste" ? 0 : m.qty < 0 ? -m.qty : m.lost ?? 0);

function recalc(o: Order) {
  o.subtotal = o.lines.filter((l) => l.status === "active").reduce((a, l) => a + l.unitPrice * l.qty, 0);
  o.total = o.subtotal + o.fee;
}

function setStatus(s: RestaurantState, o: Order, status: Order["status"], at: number, by: string, note?: string) {
  if (o.status === status) return;
  o.status = status;
  o.history.push({ at, status, by, note });
  if (status === "ready") {
    o.readyAt = at;
    if (s.automations.ready_notify) {
      if (o.type === "takeaway" && o.contact) s.outbox.unshift({ id: `ob-ready-${o.id}-${o.history.length}`, at, channel: "sms", to: o.contact.name, text: `${o.code}. Ձեր պատվերը պատրաստ է վերցնելու։ Summit Table`, state: "simulated", ref: o.id });
      s.notices.unshift({ id: `n-ready-${o.id}-${o.history.length}`, at, text: `Պատրաստ է՝ ${o.code}${o.tableId ? ` · սեղան ${tableLabel(s, o.tableId)}` : " · տանելու"}`, href: o.type === "takeaway" ? "/r/admin/orders" : "/r/floor", read: false, kind: "order" });
    }
  }
  if (status === "completed") o.closedAt = at;
}

/** Order status follows the kitchen tickets while the order is in the kitchen. */
function syncFromTickets(s: RestaurantState, o: Order, at: number, by: string) {
  if (!["accepted", "preparing", "ready", "served"].includes(o.status)) return;
  const k = derivedKitchenStatus(s.tickets.filter((t) => t.orderId === o.id));
  if (o.status === "served" && k === "ready") return;
  if (k !== o.status && (canMove(o.status, k) || o.status === "served")) setStatus(s, o, k, at, by);
}

const tableLabel = (s: RestaurantState, id: string) => s.tables.find((t) => t.id === id)?.label ?? id;

function buildLines(s: RestaurantState, lines: CartLine[], idBase: string): OrderLine[] {
  const out: OrderLine[] = [];
  lines.slice(0, 30).forEach((c, i) => {
    const item = s.items.find((x) => x.id === c.itemId);
    if (!item || !item.available) return; // sold-out or unknown items are never accepted
    const qty = Math.floor(c.qty);
    if (!(qty >= 1 && qty <= 20)) return;
    const mods = Array.from(new Set(c.modifierIds));
    if (modifierError(item, mods)) return;
    const m = modifiersOf(item, mods);
    out.push({ id: `${idBase}-${i}`, itemId: item.id, name: item.name.hy, qty, unitPrice: item.price + m.reduce((a, x) => a + x.price, 0), modifiers: m.map((x) => ({ id: x.id, name: x.name.hy, price: x.price })), note: (c.note ?? "").slice(0, 200), station: item.station, status: "active" });
  });
  return out;
}

function fire(s: RestaurantState, o: Order, lines: OrderLine[], at: number, idBase: string, remake = false) {
  const by: Partial<Record<StationId, string[]>> = {};
  for (const l of lines) if (l.status === "active") (by[l.station] ??= []).push(l.id);
  for (const [station, ids] of Object.entries(by) as [StationId, string[]][]) {
    s.tickets.push({ id: `tk-${idBase}-${station}`, orderId: o.id, station, lineIds: ids, status: "queued", rush: remake, firedAt: at, remake });
  }
  for (const l of lines) if (l.status === "active") moveLine(s, l, "consume", at, "order");
}

function accept(s: RestaurantState, o: Order, at: number, by: string, auto: boolean) {
  if (o.status !== "submitted") return;
  setStatus(s, o, "accepted", at, by, auto ? "Ավտոմատ ընդունում (կանոն)" : undefined);
  o.acceptedAt = at;
  fire(s, o, o.lines, at, o.id);
  s.activity.unshift({ id: `a-acc-${o.id}`, at, text: `Ընդունվեց ${o.code} → ${new Set(o.lines.map((l) => l.station)).size} կայան`, by, kind: "order" });
  if (o.type === "takeaway" && o.contact) s.outbox.unshift({ id: `ob-acc-${o.id}`, at, channel: "sms", to: o.contact.name, text: `${o.code}. Պատվերն ընդունված է։ Մոտավոր պատրաստ՝ ${o.pickupAt ? new Date(o.pickupAt).toISOString().slice(11, 16) : "շուտով"}։`, state: "simulated", ref: o.id });
}

/** Undo or write off stock for lines that leave the kitchen. */
function releaseLines(s: RestaurantState, o: Order, lineIds: string[], at: number, reason: string) {
  for (const id of lineIds) {
    const l = o.lines.find((x) => x.id === id);
    if (!l) continue;
    const t = s.tickets.find((x) => x.orderId === o.id && x.lineIds.includes(id));
    const started = t && t.status !== "queued";
    moveLine(s, l, started ? "waste" : "reverse", at, started ? "Չեղարկված պատրաստելուց հետո" : "Չեղարկված", reason);
    if (t) { t.lineIds = t.lineIds.filter((x) => x !== id); if (!t.lineIds.length) t.status = "voided"; }
  }
}

export function apply(s: RestaurantState, ev: RStamped): RestaurantState {
  const at = ev.at, id = ev.id, who = staffName(s, ev.by);
  switch (ev.type) {
    case "order.submit": {
      const table = ev.tableToken ? s.tables.find((t) => t.token === ev.tableToken) : ev.tableId ? s.tables.find((t) => t.id === ev.tableId) : undefined;
      if (ev.orderType === "dine_in" && (!table || !s.areas.find((a) => a.id === table.areaId)?.open)) return s;
      if (ev.orderType === "takeaway" && (!s.settings.takeaway.enabled || !ev.contact?.name.trim() || ev.contact.phone.replace(/\D/g, "").length < 6)) return s;
      const lines = buildLines(s, ev.lines, `ol-${id}`);
      if (!lines.length) return s;
      const fee = ev.orderType === "takeaway" ? s.settings.takeaway.serviceFee : 0;
      const subtotal = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
      if (ev.orderType === "takeaway" && subtotal < s.settings.takeaway.minOrder) return s;
      let sessionId: string | undefined;
      if (table) {
        let sess = s.sessions.find((x) => x.tableId === table.id && x.status === "open");
        if (!sess) {
          sess = { id: `ss-${id}`, tableId: table.id, openedAt: at, partySize: 2, waiterId: table.waiterId, status: "open" };
          s.sessions.push(sess);
          s.cleaning = s.cleaning.filter((x) => x !== table.id);
        }
        sessionId = sess.id;
      }
      s.seq.order += 1;
      const o: Order = {
        id: `o-${id}`, code: orderCode(s.seq.order), channel: ev.channel, type: ev.orderType, tableId: table?.id, sessionId,
        contact: ev.contact ? { name: ev.contact.name.trim().slice(0, 60), phone: ev.contact.phone.trim().slice(0, 30) } : undefined,
        pickupAt: ev.orderType === "takeaway" ? ev.pickupAt : undefined, note: (ev.note ?? "").slice(0, 300), lines, subtotal, fee, total: subtotal + fee,
        status: "submitted", createdAt: at, history: [{ at, status: "submitted", by: ev.channel === "waiter" ? who : "Հյուր" }],
        waiterId: table?.waiterId ?? (ev.channel === "waiter" ? ev.by : undefined), deviceKey: ev.deviceKey,
      };
      s.orders.push(o);
      const where = table ? `սեղան ${table.label}` : "տանելու";
      s.activity.unshift({ id: `a-${id}`, at, text: `Նոր պատվեր ${o.code} · ${where} · ${{ waiter: "մատուցող", qr: "QR", website: "կայք" }[ev.channel]}`, by: ev.channel === "waiter" ? who : "Հյուր", kind: "order" });
      if (s.settings.autoAccept[ev.channel]) accept(s, o, at, ev.channel === "waiter" ? who : "Համակարգ", true);
      else s.notices.unshift({ id: `n-${id}`, at, text: `Նոր պատվեր ${o.code} · ${where} · սպասում է ընդունման`, href: table ? `/r/floor?table=${table.id}` : "/r/admin/orders", read: false, kind: "order" });
      return s;
    }
    case "order.accept": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      if (o) accept(s, o, at, who, false);
      return s;
    }
    case "order.reject": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      if (!o || o.status !== "submitted") return s;
      o.reason = ev.reason.slice(0, 200);
      setStatus(s, o, "rejected", at, who, o.reason);
      if (o.contact) s.outbox.unshift({ id: `ob-rej-${o.id}`, at, channel: "sms", to: o.contact.name, text: `${o.code}. Ցավոք, պատվերը չի ընդունվել. ${o.reason}`, state: "simulated", ref: o.id });
      s.activity.unshift({ id: `a-${id}`, at, text: `Մերժվեց ${o.code}՝ ${o.reason}`, by: who, kind: "order" });
      return s;
    }
    case "order.cancel": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      if (!o || !canMove(o.status, "cancelled")) return s;
      if (ev.by === "guest" && o.status !== "submitted") return s; // guests can cancel only before acceptance
      releaseLines(s, o, o.lines.filter((l) => l.status === "active").map((l) => l.id), at, ev.reason);
      o.reason = ev.reason.slice(0, 200);
      setStatus(s, o, "cancelled", at, who, o.reason);
      s.activity.unshift({ id: `a-${id}`, at, text: `Չեղարկվեց ${o.code}՝ ${o.reason}`, by: who, kind: "order" });
      return s;
    }
    case "order.addLines": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      if (!o || !["accepted", "preparing", "ready", "served"].includes(o.status)) return s;
      const lines = buildLines(s, ev.lines, `ol-${id}`);
      if (!lines.length) return s;
      o.lines.push(...lines);
      recalc(o);
      fire(s, o, lines, at, id);
      syncFromTickets(s, o, at, who);
      return s;
    }
    case "order.voidLine": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      const l = o?.lines.find((x) => x.id === ev.lineId);
      if (!o || !l || l.status !== "active" || !["submitted", "accepted", "preparing", "ready", "served"].includes(o.status)) return s;
      if (o.status !== "submitted") releaseLines(s, o, [l.id], at, ev.reason);
      l.status = "voided";
      l.voidReason = ev.reason.slice(0, 200);
      recalc(o);
      if (!o.lines.some((x) => x.status === "active")) setStatus(s, o, "cancelled", at, who, "Բոլոր դիրքերը չեղարկված են");
      else syncFromTickets(s, o, at, who);
      s.activity.unshift({ id: `a-${id}`, at, text: `Չեղարկված դիրք ${o.code}՝ ${l.name} (${l.voidReason})`, by: who, kind: "order" });
      return s;
    }
    case "order.remake": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      const l = o?.lines.find((x) => x.id === ev.lineId);
      if (!o || !l || l.status !== "active" || !["preparing", "ready", "served"].includes(o.status)) return s;
      moveLine(s, l, "waste", at, "Վերապատրաստում", `Վերապատրաստում՝ ${ev.reason}`);
      const copy: OrderLine = { ...l, id: `ol-${id}`, unitPrice: 0, remakeOf: l.id, note: `ՎԵՐԱՊԱՏՐԱՍՏՈՒՄ · ${ev.reason}`.slice(0, 200) };
      o.lines.push(copy);
      fire(s, o, [copy], at, id, true);
      syncFromTickets(s, o, at, who);
      if (o.status === "served") setStatus(s, o, "preparing", at, who, "Վերապատրաստում");
      s.activity.unshift({ id: `a-${id}`, at, text: `Վերապատրաստում ${o.code}՝ ${l.name} (${ev.reason})`, by: who, kind: "kitchen" });
      return s;
    }
    case "order.serve": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      if (!o || o.type !== "dine_in" || o.status !== "ready") return s;
      setStatus(s, o, "served", at, who);
      s.tickets.filter((t) => t.orderId === o.id && t.status === "ready").forEach((t) => { t.status = "bumped"; t.bumpedAt = at; });
      return s;
    }
    case "order.pickup": {
      const o = s.orders.find((x) => x.id === ev.orderId);
      if (!o || o.type !== "takeaway" || o.status !== "ready") return s;
      setStatus(s, o, "picked_up", at, who);
      setStatus(s, o, "completed", at, who, "Վճարվել է դրամարկղում (POS)");
      s.tickets.filter((t) => t.orderId === o.id && t.status === "ready").forEach((t) => { t.status = "bumped"; t.bumpedAt = at; });
      s.activity.unshift({ id: `a-${id}`, at, text: `Վերցվեց ${o.code}`, by: who, kind: "order" });
      return s;
    }
    case "ticket.start":
    case "ticket.ready":
    case "ticket.bump":
    case "ticket.recall":
    case "ticket.rush": {
      const t = s.tickets.find((x) => x.id === ev.ticketId);
      if (!t || t.status === "voided") return s;
      if (ev.type === "ticket.start" && t.status === "queued") { t.status = "in_progress"; t.startedAt = at; }
      else if (ev.type === "ticket.ready" && (t.status === "queued" || t.status === "in_progress")) { t.startedAt ??= at; t.status = "ready"; t.readyAt = at; }
      else if (ev.type === "ticket.bump" && t.status === "ready") { t.status = "bumped"; t.bumpedAt = at; }
      else if (ev.type === "ticket.recall" && t.status === "bumped") { t.status = "ready"; t.bumpedAt = undefined; }
      else if (ev.type === "ticket.rush") { t.rush = ev.rush; return s; }
      else return s;
      const o = s.orders.find((x) => x.id === t.orderId);
      if (o) syncFromTickets(s, o, at, who);
      return s;
    }
    case "table.open": {
      const table = s.tables.find((t) => t.id === ev.tableId);
      if (!table || s.sessions.some((x) => x.tableId === table.id && x.status === "open")) return s;
      s.sessions.push({ id: `ss-${id}`, tableId: table.id, openedAt: at, partySize: Math.max(1, Math.min(30, Math.floor(ev.partySize))), waiterId: ev.waiterId ?? table.waiterId, status: "open" });
      s.cleaning = s.cleaning.filter((x) => x !== table.id);
      s.reservations = s.reservations.filter((r) => !(r.tableId === table.id && Math.abs(r.at - at) < 90 * 60000));
      s.activity.unshift({ id: `a-${id}`, at, text: `Սեղան ${table.label}՝ հյուրեր (${ev.partySize})`, by: who, kind: "table" });
      return s;
    }
    case "table.close": {
      const sess = s.sessions.find((x) => x.tableId === ev.tableId && x.status === "open");
      if (!sess) return s;
      const orders = s.orders.filter((o) => o.sessionId === sess.id);
      if (orders.some((o) => ["submitted", "accepted", "preparing", "ready"].includes(o.status))) return s; // kitchen still working
      orders.filter((o) => o.status === "served").forEach((o) => setStatus(s, o, "completed", at, who, "Հաշիվը փակվել է դրամարկղում (POS)"));
      sess.status = "closed"; sess.closedAt = at;
      s.requests.filter((r) => r.tableId === ev.tableId && r.status !== "done").forEach((r) => { r.status = "done"; r.doneAt = at; });
      s.cleaning.push(ev.tableId);
      s.activity.unshift({ id: `a-${id}`, at, text: `Սեղան ${tableLabel(s, ev.tableId)}՝ հաշիվը փակված է (POS)`, by: who, kind: "table" });
      return s;
    }
    case "table.clean":
      s.cleaning = s.cleaning.filter((x) => x !== ev.tableId);
      return s;
    case "table.request": {
      const table = ev.tableToken ? s.tables.find((t) => t.token === ev.tableToken) : s.tables.find((t) => t.id === ev.tableId);
      if (!table || s.requests.some((r) => r.tableId === table.id && r.kind === ev.kind && r.status !== "done")) return s;
      let sess = s.sessions.find((x) => x.tableId === table.id && x.status === "open");
      if (!sess) { sess = { id: `ss-${id}`, tableId: table.id, openedAt: at, partySize: 2, waiterId: table.waiterId, status: "open" }; s.sessions.push(sess); }
      if (ev.kind === "bill") sess.billRequested = true;
      s.requests.push({ id: `rq-${id}`, tableId: table.id, sessionId: sess.id, kind: ev.kind, at, status: "new" });
      s.notices.unshift({ id: `n-${id}`, at, text: `Սեղան ${table.label}՝ ${{ waiter: "կանչում է մատուցողին", bill: "խնդրում է հաշիվը", help: "օգնության կարիք ունի" }[ev.kind]}`, href: `/r/floor?table=${table.id}`, read: false, kind: "request" });
      return s;
    }
    case "request.ack":
    case "request.done": {
      const r = s.requests.find((x) => x.id === ev.requestId);
      if (!r || r.status === "done") return s;
      if (ev.type === "request.ack") { r.status = "ack"; r.ackAt = at; r.by = ev.by; }
      else { r.status = "done"; r.doneAt = at; r.ackAt ??= at; r.by = ev.by; }
      return s;
    }
    case "menu.availability": {
      const m = s.items.find((x) => x.id === ev.itemId);
      if (!m || m.available === ev.available) return s;
      m.available = ev.available;
      m.soldOutAt = ev.available ? undefined : at;
      s.activity.unshift({ id: `a-${id}`, at, text: `${m.name.hy}՝ ${ev.available ? "կրկին հասանելի է" : "վերջացել է (բոլոր ալիքներում)"}`, by: who, kind: "menu" });
      return s;
    }
    case "menu.price": {
      const m = s.items.find((x) => x.id === ev.itemId);
      if (!m || !(ev.price >= 100 && ev.price <= 1_000_000)) return s;
      const before = m.price;
      m.price = Math.round(ev.price);
      s.activity.unshift({ id: `a-${id}`, at, text: `Գին՝ ${m.name.hy} ${before} → ${m.price} ֏`, by: who, kind: "menu" });
      return s;
    }
    case "ingredient.price": {
      const ing = s.ingredients.find((x) => x.id === ev.ingredientId);
      if (!ing || !(ev.cost > 0 && ev.cost < 10_000_000) || Math.round(ev.cost) === ing.cost) return s;
      const before = ing.cost;
      ing.cost = Math.round(ev.cost);
      s.prices.push({ ingredientId: ing.id, at, cost: ing.cost, source: ev.source });
      const affected = s.recipes.filter((r) => r.lines.some((l) => l.ingredientId === ing.id)).length;
      s.activity.unshift({ id: `a-${id}`, at, text: `Գնի փոփոխություն՝ ${ing.name} ${before} → ${ing.cost} ֏/${ing.purchaseUnit} · ${affected} բաղադրատոմս վերահաշվարկվեց`, by: who, kind: "stock" });
      if (s.automations.price_change_alert && Math.abs(ing.cost - before) / before >= 0.05) s.notices.unshift({ id: `n-${id}`, at, text: `${ing.name}՝ գինը ${ing.cost > before ? "աճել" : "նվազել"} է ${Math.round((Math.abs(ing.cost - before) / before) * 100)}%-ով. ստուգեք ${affected} ուտեստի մարժան`, href: `/r/admin/inventory?open=${ing.id}`, read: false, kind: "stock" });
      return s;
    }
    case "recipe.qty": {
      const r = recipeOf(s, ev.itemId);
      const l = r?.lines.find((x) => x.ingredientId === ev.ingredientId);
      if (!r || !l || !(ev.qty >= 0 && ev.qty <= 5000)) return s;
      l.qty = ev.qty;
      r.version += 1;
      s.activity.unshift({ id: `a-${id}`, at, text: `Բաղադրատոմս՝ ${s.items.find((i) => i.id === r.itemId)?.name.hy} (տարբերակ ${r.version})`, by: who, kind: "stock" });
      return s;
    }
    case "stock.waste": {
      const ing = s.ingredients.find((x) => x.id === ev.ingredientId);
      if (!ing || !(ev.qty > 0) || ev.qty > onHand(s, ing.id) + 1e-6) return s;
      addMove(s, `wastelog:${id}`, ing.id, -ev.qty, "waste", at, { reason: ev.reason.slice(0, 120), by: ev.by });
      s.activity.unshift({ id: `a-${id}`, at, text: `Կորուստ՝ ${ing.name} ${ev.qty} ${ing.unit} (${ev.reason})`, by: who, kind: "stock" });
      return s;
    }
    case "stock.adjust": {
      const ing = s.ingredients.find((x) => x.id === ev.ingredientId);
      if (!ing || !(ev.counted >= 0)) return s;
      addMove(s, `count:${id}`, ing.id, ev.counted - onHand(s, ing.id), "adjust", at, { reason: "Գույքագրում", by: ev.by });
      return s;
    }
    case "po.create": {
      const lines = ev.lines.map((l) => ({ ...l, ing: s.ingredients.find((i) => i.id === l.ingredientId) })).filter((l) => l.ing && l.ing.supplierId === ev.supplierId && l.qty > 0);
      if (!lines.length) return s;
      s.seq.po += 1;
      s.pos.unshift({ id: `po-${id}`, code: `PO-${String(s.seq.po).padStart(3, "0")}`, supplierId: ev.supplierId, status: "draft", createdAt: at, lines: lines.map((l) => ({ ingredientId: l.ingredientId, qty: l.qty, cost: l.ing!.cost, received: 0 })) });
      s.activity.unshift({ id: `a-${id}`, at, text: `Գնման պատվեր PO-${String(s.seq.po).padStart(3, "0")} (${s.suppliers.find((x) => x.id === ev.supplierId)?.name})`, by: who, kind: "stock" });
      return s;
    }
    case "po.send": {
      const po = s.pos.find((x) => x.id === ev.poId);
      if (!po || po.status !== "draft") return s;
      po.status = "sent";
      const sup = s.suppliers.find((x) => x.id === po.supplierId);
      s.outbox.unshift({ id: `ob-${id}`, at, channel: "telegram", to: sup?.name ?? "", text: `${po.code}: ${po.lines.length} դիրք. Summit Table`, state: "simulated", ref: po.id });
      return s;
    }
    case "po.receive": {
      const po = s.pos.find((x) => x.id === ev.poId);
      if (!po || !["sent", "partial"].includes(po.status)) return s;
      for (const r of ev.lines) {
        const pl = po.lines.find((x) => x.ingredientId === r.ingredientId);
        const ing = s.ingredients.find((x) => x.id === r.ingredientId);
        if (!pl || !ing || !(r.qty > 0)) continue;
        if (r.cost > 0 && Math.round(r.cost) !== ing.cost) apply(s, { type: "ingredient.price", ingredientId: ing.id, cost: r.cost, source: "invoice", id: `${id}-${ing.id}`, at, by: ev.by });
        addMove(s, `receive:${po.id}:${ing.id}:${id}`, ing.id, r.qty * ing.unitsPerPurchase, "receive", at, { ref: po.id, by: ev.by });
        pl.received += r.qty;
      }
      po.status = po.lines.every((l) => l.received >= l.qty) ? "received" : "partial";
      s.activity.unshift({ id: `a-${id}`, at, text: `Ստացվեց ${po.code} (${po.status === "received" ? "ամբողջությամբ" : "մասնակի"})`, by: who, kind: "stock" });
      return s;
    }
    case "settings.update": {
      const p = ev.patch;
      const cur = s.settings;
      s.settings = {
        ...cur,
        ...(p.vat ? { vat: { ...cur.vat, ...p.vat } } : {}),
        ...(p.takeaway ? { takeaway: { ...cur.takeaway, ...p.takeaway } } : {}),
        ...(p.autoAccept ? { autoAccept: { ...cur.autoAccept, ...p.autoAccept } } : {}),
        ...(p.savings ? { savings: { ...cur.savings, ...p.savings } } : {}),
        ...("expenses" in p ? { expenses: p.expenses ?? null } : {}),
      };
      return s;
    }
    case "automation.toggle":
      if (ev.target in s.automations) s.automations[ev.target] = ev.on;
      return s;
    case "notices.read":
      s.notices.forEach((n) => (n.read = true));
      return s;
  }
  return s;
}

/* ---------------- replay with a memoised seed ---------------- */

const memo = new Map<string, RestaurantState>();
/** Seed is built once per (day, session start); each replay clones only the mutable part and shares the read-only history. */
export function baseState(baseDate: string, epochAt: number): RestaurantState {
  const key = `${baseDate}|${epochAt}`;
  let m = memo.get(key);
  if (!m) {
    m = createSeed(baseDate, epochAt, apply);
    if (memo.size > 4) memo.clear();
    memo.set(key, m);
  }
  const { history, ...rest } = m;
  return { ...structuredClone(rest), history } as RestaurantState;
}

export function replay(baseDate: string, events: RStamped[], epochAt: number): RestaurantState {
  return replayEvents(baseState(baseDate, epochAt), events, apply);
}

export { linesCost };
