/*
 * Deterministic demo seed for "Summit Table" (fictional).
 *  - History, days −28 … −1: closed orders with prep times, cancellations, remakes, waste and stock-outs.
 *    Costs use the ingredient price in force on that day (price history), so margin erosion is real in the data.
 *  - Live service: built by applying scripted events through the same reducer, relative to the session start
 *    (epochAt), so tickets, stock and table states obey the same rules as live use.
 */
import { addDays, atTime, weekday } from "../dates.ts";
import { AREAS, BRAND, CATEGORIES, INGREDIENTS, MENU, PRICE_CHANGES, RECIPES, STAFF, STATIONS, SUPPLIERS, TABLES } from "./data.ts";
import { linesCost, netOf } from "./rules.ts";
import { seedOps } from "./seed-ops.ts";
import type { Channel, HistOrder, HistStockout, HistWaste, PricePoint, RestaurantEvent, RestaurantState, RStamped, Settings, StationId } from "./types.ts";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export const DEFAULT_SETTINGS: Settings = {
  vat: { registered: true, pricesIncludeVat: true, rate: 0.2 },
  autoAccept: { waiter: true, qr: false, website: false },
  takeaway: { enabled: true, minOrder: 4000, serviceFee: 300, slotMin: 15, leadMin: 10 },
  delivery: { enabled: false },
  expenses: null,
  savings: { wasteReductionPct: 20, remakeReductionPct: 30, priceRecoveryPct: 50, stockoutRecoveryPct: 50, minutesSavedPerOrder: 1, labourCostPerHour: 1800 },
};

const HIST_DAYS = 28;

export function createSeed(baseDate: string, epochAt: number, apply: (s: RestaurantState, e: RStamped) => RestaurantState): RestaurantState {
  const r = rng(20261127);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const between = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const ingredients = INGREDIENTS.map((i) => ({ ...i }));
  const items = MENU.map((m) => ({ ...m }));
  const recipes = RECIPES.map((x) => ({ ...x, lines: x.lines.map((l) => ({ ...l })) }));

  /* ---------- price history ---------- */
  const prices: PricePoint[] = [];
  const start = atTime(addDays(baseDate, -HIST_DAYS), "09:00");
  for (const ing of ingredients) {
    const ch = PRICE_CHANGES.find((c) => c.ingredientId === ing.id);
    prices.push({ ingredientId: ing.id, at: start, cost: ch ? ch.from : ing.cost, source: "seed" });
    if (ch) prices.push({ ingredientId: ing.id, at: atTime(addDays(baseDate, -ch.daysAgo), "10:00"), cost: ing.cost, source: "invoice" });
  }
  const costOnDay = (day: string) => {
    const at = atTime(day, "12:00");
    return (id: string) => {
      const ing = ingredients.find((i) => i.id === id)!;
      const pts = prices.filter((p) => p.ingredientId === id && p.at <= at);
      return (pts.length ? pts[pts.length - 1].cost : ing.cost) / ing.unitsPerPurchase;
    };
  };
  const ctx = { ingredients };
  const settings = structuredClone(DEFAULT_SETTINGS);

  /* ---------- history: orders ---------- */
  const weighted = items.flatMap((m) => Array.from({ length: m.weight }, () => m));
  const food = weighted.filter((m) => m.categoryId !== "drinks");
  const drinks = weighted.filter((m) => m.categoryId === "drinks");
  const large = items.find((i) => i.id === "khorovats")!.groups[0].options[0];
  const orders: HistOrder[] = [];
  const waste: HistWaste[] = [];
  const stockouts: HistStockout[] = [];
  const DAY_FACTOR = [1.15, 0.7, 0.75, 0.8, 0.9, 1.45, 1.6]; // Sun … Sat
  for (let d = -HIST_DAYS; d <= -1; d++) {
    const day = addDays(baseDate, d);
    const cost = costOnDay(day);
    const itemCostOn = (id: string) => linesCost(ctx, recipes.find((x) => x.itemId === id)?.lines ?? [], cost).total;
    const wd = weekday(day);
    const n = Math.round(78 * DAY_FACTOR[wd] * (0.92 + r() * 0.16));
    const weekend = wd === 5 || wd === 6;
    for (let k = 0; k < n; k++) {
      const lunch = r() < 0.34;
      const hour = lunch ? between(12, 15) : between(18, 22);
      const at = atTime(day, `${String(hour).padStart(2, "0")}:${String(between(0, 59)).padStart(2, "0")}`);
      const x = r();
      const channel: Channel = x < 0.57 ? "waiter" : x < 0.86 ? "qr" : "website";
      const type = channel === "website" ? "takeaway" as const : "dine_in" as const;
      const covers = type === "takeaway" ? 0 : between(1, 5);
      const nFood = type === "takeaway" ? between(1, 3) : Math.max(1, covers + between(-1, 1));
      const picks = [...Array.from({ length: nFood }, () => pick(food)), ...(type === "takeaway" ? [] : Array.from({ length: Math.max(0, covers + between(-1, 1)) }, () => pick(drinks)))];
      const lines = picks.map((m) => {
        const isLarge = m.id === "khorovats" && r() < 0.25;
        const gross = m.price + (isLarge ? large.price : 0);
        const c = itemCostOn(m.id) + (isLarge ? linesCost(ctx, large.recipe!, cost).total : 0);
        const remade = r() < 0.017;
        return { itemId: m.id, qty: 1, gross, net: netOf(settings, gross), cost: c, remade, remakeCost: remade ? c : 0 };
      });
      const sx = r();
      const status = sx < 0.012 ? "cancelled" as const : sx < 0.026 ? "rejected" as const : "completed" as const;
      const peak = weekend && hour >= 19 && hour <= 21;
      const stations = Array.from(new Set(lines.map((l) => items.find((i) => i.id === l.itemId)!.station)));
      const prep = status === "completed" ? stations.map((st) => {
        const base = Math.max(...lines.filter((l) => items.find((i) => i.id === l.itemId)!.station === st).map((l) => items.find((i) => i.id === l.itemId)!.prepMin));
        const min = Math.round(base * (0.85 + r() * 0.35) * (peak ? (st === "grill" ? 1.42 : 1.18) : 1));
        return { station: st as StationId, min, late: min > STATIONS.find((s) => s.id === st)!.thresholds.red };
      }) : [];
      const g = lines.reduce((a, l) => a + l.gross, 0) + (type === "takeaway" ? settings.takeaway.serviceFee : 0);
      orders.push({ day, at, hour, channel, type, status, lines, gross: g, net: netOf(settings, g), cost: lines.reduce((a, l) => a + l.cost + (l.remakeCost ?? 0), 0), prep, covers });
    }
    /* waste: trim, expiry, overproduction */
    const perishables = ["greens", "herbs", "salmon", "trout", "tomato", "cream", "raspberry", "lavash", "chicken", "asparagus"];
    for (let w = 0; w < between(2, 4); w++) {
      const id = pick(perishables);
      const ing = ingredients.find((i) => i.id === id)!;
      const qty = ing.unit === "pcs" ? between(3, 10) : between(150, 900);
      const reason = pick(["Ժամկետանց", "Ավելորդ պատրաստում", "Մաքրման կորուստ", "Վնասված փաթեթավորում", "Ընկել է / սխալ մատուցում"]);
      waste.push({ day, ingredientId: id, qty, cost: qty * cost(id), reason });
    }
  }
  stockouts.push({ day: addDays(baseDate, -5), itemId: "salmon", minutes: 190 }, { day: addDays(baseDate, -11), itemId: "ribs", minutes: 120 }, { day: addDays(baseDate, -16), itemId: "trout-bowl", minutes: 240 }, { day: addDays(baseDate, -2), itemId: "salmon", minutes: 95 });

  /* ---------- stock at the start of the live session ---------- */
  const stockStart: Record<string, number> = {};
  for (const ing of ingredients) stockStart[ing.id] = Math.round(ing.parLevel * (0.85 + r() * 0.35));
  Object.assign(stockStart, { greens: 1150, salmon: 2900, cream: 2600, pork: 15600, raspberry: 1100 });

  const s: RestaurantState = {
    baseDate, epochAt, brand: structuredClone(BRAND), settings, stations: structuredClone(STATIONS), areas: structuredClone(AREAS), tables: structuredClone(TABLES), staff: structuredClone(STAFF),
    categories: structuredClone(CATEGORIES), items, ingredients, recipes, prices, suppliers: structuredClone(SUPPLIERS),
    history: { orders: Object.freeze(orders), waste: Object.freeze(waste), stockouts: Object.freeze(stockouts) },
    stockStart,
    expiring: [{ ingredientId: "herbs", qty: 600, expiresDay: addDays(baseDate, 1) }, { ingredientId: "trout", qty: 1200, expiresDay: addDays(baseDate, 1) }, { ingredientId: "cream", qty: 1000, expiresDay: addDays(baseDate, 2) }],
    moves: [], orders: [], tickets: [], sessions: [], requests: [], reservations: [], cleaning: [], pos: [], activity: [], notices: [], outbox: [],
    automations: { station_routing: true, stock_deduction: true, ready_notify: true, low_stock_alert: true, price_change_alert: true, late_ticket_alert: true, request_escalation: true,
      reservation_host_alert: true, reservation_reminder: true, walkin_assign: true, bill_request_notify: true, cancel_manager_alert: true, low_stock_purchase_draft: true,
      negative_review_task: true, inbox_auto_reply: true, unusual_waste_alert: true, shift_handover: true, daily_summary: true },
    autolog: [], payments: [], waitlist: [], customers: [], loyalty: { enabled: true, earnPer1000: 10, tiers: [], ledger: [] }, inbox: [], inboxSettings: { autoReplyIntents: [] },
    reviews: [], tasks: [], shifts: [], handovers: [], teamMsgs: [], counts: [], summaries: [], sops: [],
    seq: { order: 1240, po: 17, res: 300 },
  };

  seedOps(s, epochAt, r);
  liveService(s, epochAt, apply);
  s.autolog = s.autolog.filter((x) => x.result === "ok").slice(0, 12); // keep a short, readable history from the seeded evening
  return s;
}

/* ---------- live service (relative to the session start) ---------- */

function liveService(s: RestaurantState, E: number, apply: (s: RestaurantState, e: RStamped) => RestaurantState) {
  let n = 0;
  const run = (e: RestaurantEvent, minAgo: number, by = "seed") => { const id = `seed-${++n}`; apply(s, { ...e, id, at: E - minAgo * 60000, by } as RStamped); return id; };
  const L = (itemId: string, qty = 1, modifierIds: string[] = [], note = "") => ({ itemId, qty, modifierIds, note });
  const order = (tableId: string, minAgo: number, lines: ReturnType<typeof L>[], channel: Channel = "waiter", by = s.tables.find((t) => t.id === tableId)!.waiterId) => {
    const o = `o-${run({ type: "order.submit", channel, orderType: "dine_in", tableId, note: "", lines }, minAgo, channel === "qr" ? "guest" : by)}`;
    // the seed goes through the same validation as live orders: fail loudly if a scripted line was rejected
    if (s.orders.find((x) => x.id === o)?.lines.length !== lines.length) throw new Error(`seed order rejected at ${tableId}`);
    if (channel === "qr") run({ type: "order.accept", orderId: o }, minAgo - 1, s.tables.find((t) => t.id === tableId)!.waiterId);
    return o;
  };
  const tk = (orderId: string, station: StationId) => s.tickets.find((t) => t.orderId === orderId && t.station === station)!.id;
  // each station finishes after its own typical prep time; `readyAgo` is when the slowest station is done
  const PREP: Record<StationId, number> = { cold: 7, bar: 3, pastry: 4, hot: 14, grill: 20 };
  const kitchen = (orderId: string, startAgo: number, readyAgo?: number) => {
    for (const t of s.tickets.filter((x) => x.orderId === orderId && x.status === "queued")) {
      run({ type: "ticket.start", ticketId: t.id }, startAgo, "s-gor");
      if (readyAgo !== undefined) run({ type: "ticket.ready", ticketId: t.id }, Math.max(readyAgo, startAgo - PREP[t.station]), "s-gor");
    }
  };
  const open = (tableId: string, party: number, minAgo: number) => run({ type: "table.open", tableId, partySize: party }, minAgo, s.tables.find((t) => t.id === tableId)!.waiterId);

  /* earlier today: lunch and early dinner, closed on the POS */
  const earlier: [string, number, ReturnType<typeof L>[]][] = [
    ["T2", 330, [L("salad"), L("khorovats"), L("areni", 2)]], ["T5", 320, [L("burger"), L("penne"), L("water", 2)]], ["L1", 300, [L("ribeye", 1, ["medium"]), L("salmon"), L("areni", 2)]],
    ["T9", 290, [L("kufta"), L("khorovats", 1, ["large"]), L("lavash-basket"), L("tea", 3)]], ["T12", 280, [L("trout-bowl"), L("cappuccino", 2), L("cake")]], ["T3", 270, [L("salad", 2), L("farfalle"), L("water")]],
    ["B1", 260, [L("cocktail", 2)]], ["T7", 250, [L("khorovats"), L("veg-bowl"), L("areni", 2), L("panna")]], ["T14", 240, [L("burger", 2, ["bacon"]), L("water", 2)]],
    ["L3", 220, [L("salmon", 2), L("salad"), L("areni", 2)]], ["T6", 210, [L("ribs"), L("khorovats"), L("lavash-basket"), L("tea", 2)]], ["T10", 200, [L("penne", 1, ["chicken"]), L("cake"), L("cappuccino")]],
    ["T1", 190, [L("kufta"), L("ribeye", 1, ["well"]), L("areni")]], ["T11", 180, [L("khorovats", 1, ["large"]), L("salad"), L("water", 3)]], ["L2", 170, [L("sundae", 2), L("cappuccino", 2)]],
    ["T15", 160, [L("salmon"), L("farfalle"), L("water", 2)]],
  ];
  for (const [i, [table, ago, lines]] of earlier.entries()) {
    open(table, (ago % 3) + 2, ago + 3);
    const o = order(table, ago, lines, i % 3 === 1 ? "qr" : "waiter");
    kitchen(o, ago - 2, ago - 18);
    run({ type: "order.serve", orderId: o }, ago - 20, s.tables.find((t) => t.id === table)!.waiterId);
    run({ type: "table.close", tableId: table }, ago - 60, "s-ruzan");
    run({ type: "table.clean", tableId: table }, ago - 65, "s-ruzan");
  }
  // one remake earlier today (wrong doneness) and one cancelled item after cooking
  {
    open("T16", 6, 150);
    const o = order("T16", 148, [L("ribeye", 1, ["rare"]), L("salad")]);
    kitchen(o, 146, 124);
    run({ type: "order.serve", orderId: o }, 122);
    const ribeye = s.orders.find((x) => x.id === o)!.lines.find((l) => l.itemId === "ribeye")!;
    run({ type: "order.remake", orderId: o, lineId: ribeye.id, reason: "Սխալ եփվածություն" }, 118, "s-lusine");
    kitchen(o, 116, 98);
    run({ type: "order.serve", orderId: o }, 96);
    run({ type: "table.close", tableId: "T16" }, 70, "s-ruzan");
    run({ type: "table.clean", tableId: "T16" }, 66, "s-ruzan");
  }
  // an earlier takeaway, picked up
  {
    const id = run({ type: "order.submit", channel: "website", orderType: "takeaway", contact: { name: "Լիլիթ Ա.", phone: "+374 00 000 118" }, pickupAt: E - 95 * 60000, note: "", lines: [L("khorovats"), L("salad"), L("lavash-basket")] }, 130, "guest");
    run({ type: "order.accept", orderId: `o-${id}` }, 128, "s-lusine");
    kitchen(`o-${id}`, 126, 100);
    run({ type: "order.pickup", orderId: `o-${id}` }, 92, "s-ruzan");
  }

  /* current service */
  open("T1", 2, 52); { const o = order("T1", 50, [L("khorovats"), L("salad"), L("areni", 2)]); kitchen(o, 48, 28); run({ type: "order.serve", orderId: o }, 26, "s-ani"); }
  open("T2", 4, 30); { const o = order("T2", 26, [L("khorovats", 1, ["large"]), L("kufta"), L("salad"), L("water", 2)]); run({ type: "ticket.start", ticketId: tk(o, "grill") }, 22, "s-hayk"); run({ type: "ticket.start", ticketId: tk(o, "hot") }, 20, "s-narine"); run({ type: "ticket.ready", ticketId: tk(o, "cold") }, 21, "s-sona"); run({ type: "ticket.ready", ticketId: tk(o, "bar") }, 24, "s-tigran"); }
  open("T4", 3, 36); { const o = order("T4", 32, [L("salmon"), L("penne"), L("cappuccino")]); kitchen(o, 30, 4); }
  open("T5", 2, 8); order("T5", 3, [L("ribeye", 1, ["medium"]), L("veg-bowl"), L("areni", 2)]);
  open("T9", 6, 44); { const o = order("T9", 38, [L("khorovats", 2), L("ribs"), L("burger", 1, ["cheese"]), L("lavash-basket"), L("water", 3)]); run({ type: "ticket.start", ticketId: tk(o, "grill") }, 36, "s-hayk"); run({ type: "ticket.ready", ticketId: tk(o, "cold") }, 33, "s-sona"); run({ type: "ticket.ready", ticketId: tk(o, "bar") }, 35, "s-tigran"); run({ type: "ticket.rush", ticketId: tk(o, "grill"), rush: true }, 6, "s-lusine"); }
  open("T10", 2, 70); { const o = order("T10", 66, [L("farfalle"), L("salad"), L("tea", 2)]); kitchen(o, 64, 50); run({ type: "order.serve", orderId: o }, 48, "s-davit"); run({ type: "table.request", tableId: "T10", kind: "bill" }, 3, "guest"); }
  open("T12", 2, 9); run({ type: "order.submit", channel: "qr", orderType: "dine_in", tableId: "T12", note: "", lines: [L("trout-bowl"), L("cappuccino", 1, ["oat"]), L("cake")] }, 2, "guest");
  open("T14", 4, 4);
  open("L1", 2, 58); { const o = order("L1", 55, [L("ribeye", 1, ["rare"]), L("areni", 2), L("panna")]); kitchen(o, 53, 30); run({ type: "order.serve", orderId: o }, 29, "s-mariam"); }
  open("L3", 4, 24); { const o = order("L3", 20, [L("salmon", 2), L("veg-bowl"), L("cocktail", 2)]); run({ type: "ticket.start", ticketId: tk(o, "hot") }, 16, "s-narine"); run({ type: "ticket.ready", ticketId: tk(o, "bar") }, 17, "s-tigran"); }
  open("L4", 3, 15); { const o = order("L4", 12, [L("cocktail", 3)]); kitchen(o, 11, 8); run({ type: "order.serve", orderId: o }, 7, "s-mariam"); run({ type: "table.request", tableId: "L4", kind: "waiter" }, 1, "guest"); }
  open("B2", 2, 20); { const o = order("B2", 18, [L("cocktail"), L("areni")]); kitchen(o, 17, 14); run({ type: "order.serve", orderId: o }, 13, "s-davit"); }
  open("P1", 10, 34); order("P1", 6, [L("khorovats", 3, ["large"]), L("salad", 3), L("kufta", 2), L("lavash-basket", 3), L("areni", 6), L("water", 4)], "waiter", "s-mariam");
  // takeaways in progress
  { const id = run({ type: "order.submit", channel: "website", orderType: "takeaway", contact: { name: "Գևորգ Հ.", phone: "+374 00 000 131" }, pickupAt: E + 5 * 60000, note: "Առանց սոխի", lines: [L("burger", 2), L("salad")] }, 24, "guest"); run({ type: "order.accept", orderId: `o-${id}` }, 23, "s-lusine"); kitchen(`o-${id}`, 20, 2); }
  { const id = run({ type: "order.submit", channel: "website", orderType: "takeaway", contact: { name: "Mila K.", phone: "+374 00 000 144" }, pickupAt: E + 20 * 60000, note: "", lines: [L("khorovats", 1, ["large"]), L("lavash-basket")] }, 9, "guest"); run({ type: "order.accept", orderId: `o-${id}` }, 8, "s-lusine"); }
  s.cleaning.push("T8");

  s.notices.forEach((x) => (x.read = true));
  // keep the two live guest-facing signals unread for the demo
  s.notices.filter((x) => x.href.includes("table=T12") || x.kind === "request").forEach((x) => (x.read = false));
}
