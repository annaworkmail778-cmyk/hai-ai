/*
 * Owner analytics for Restaurant OS. One fact layer (history + today's live orders), so every screen agrees.
 *
 * Definitions:
 *  - Sales (gross) = value of committed orders (accepted … completed), incl. VAT; cancelled/rejected excluded.
 *  - Net sales = gross ex-VAT (when VAT-registered and prices include VAT).
 *  - Food cost = theoretical recipe cost of sold items at the ingredient prices in force when the kitchen accepted them,
 *    plus the cost of remakes.
 *  - Gross profit = net sales − food cost. Net profit is NOT computed unless operating expenses are entered.
 *  - Waste cost = raw stock written off + cooked food lost on cancellations/remakes after cooking.
 *
 * Three kinds of numbers, labelled everywhere:  "actual" (sample data as recorded), "calculated" (formula on actual data),
 * "hypothetical" (owner-editable assumption applied to an actual/calculated base).
 */
import { addDays, hourIn } from "../dates.ts";
import { wasteQty } from "./engine.ts";
import { dishEconomics, linesCost, netOf, unitCost } from "./rules.ts";
import type { Channel, HistOrder, HistWaste, RestaurantState, StationId } from "./types.ts";

export type Period = "today" | "yesterday" | "7d" | "28d";
export const PERIOD_LABEL: Record<Period, string> = { today: "Այսօր", yesterday: "Երեկ", "7d": "Վերջին 7 օր", "28d": "Վերջին 28 օր" };

type Fact = HistOrder & { live?: boolean; open?: boolean };

const dayOfMs = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan", year: "numeric", month: "2-digit", day: "2-digit" }).format(ms);

/** Today's live orders converted to facts. Cost = actual consumption moves of each line (price at acceptance). */
export function liveFacts(s: RestaurantState): Fact[] {
  const out: Fact[] = [];
  for (const o of s.orders) {
    if (o.status === "submitted") continue;
    const status = o.status === "cancelled" ? "cancelled" : o.status === "rejected" ? "rejected" : "completed";
    const lineCost = (lineId: string) => s.moves.filter((m) => m.ref === lineId && (m.kind === "consume" || m.kind === "reverse")).reduce((a, m) => a - m.qty * m.unitCost, 0);
    const lines = o.lines.filter((l) => l.status === "active" && !l.remakeOf).map((l) => {
      const remake = o.lines.find((x) => x.remakeOf === l.id);
      const gross = l.unitPrice * l.qty;
      return { itemId: l.itemId, qty: l.qty, gross, net: netOf(s.settings, gross), cost: lineCost(l.id), remade: Boolean(remake), remakeCost: remake ? lineCost(remake.id) : 0 };
    });
    const prep = s.tickets.filter((t) => t.orderId === o.id && t.readyAt && !t.remake).map((t) => {
      const min = Math.round((t.readyAt! - t.firedAt) / 60000);
      return { station: t.station, min, late: min > (s.stations.find((x) => x.id === t.station)?.thresholds.red ?? 99) };
    });
    const gross = o.total;
    out.push({ day: dayOfMs(o.createdAt), at: o.createdAt, hour: hourIn(o.createdAt), channel: o.channel, type: o.type, status, lines, gross, net: netOf(s.settings, gross), cost: lines.reduce((a, l) => a + l.cost + (l.remakeCost ?? 0), 0), prep, covers: o.type === "dine_in" ? s.sessions.find((x) => x.id === o.sessionId)?.partySize ?? 0 : 0, live: true, open: !["completed", "picked_up", "cancelled", "rejected"].includes(o.status) });
  }
  return out;
}

export function periodDays(s: RestaurantState, p: Period): { from: string; to: string } {
  const t = s.baseDate;
  if (p === "today") return { from: t, to: t };
  if (p === "yesterday") return { from: addDays(t, -1), to: addDays(t, -1) };
  if (p === "7d") return { from: addDays(t, -7), to: addDays(t, -1) };
  return { from: addDays(t, -28), to: addDays(t, -1) };
}
export function previousPeriod(s: RestaurantState, p: Period): { from: string; to: string } | null {
  const t = s.baseDate;
  if (p === "today") return { from: addDays(t, -7), to: addDays(t, -7) }; // same weekday last week
  if (p === "yesterday") return { from: addDays(t, -8), to: addDays(t, -8) };
  if (p === "7d") return { from: addDays(t, -14), to: addDays(t, -8) };
  return null;
}

export function facts(s: RestaurantState, range: { from: string; to: string }): Fact[] {
  const hist = s.history.orders.filter((o) => o.day >= range.from && o.day <= range.to) as Fact[];
  const live = range.to >= s.baseDate ? liveFacts(s).filter((o) => o.day >= range.from && o.day <= range.to) : [];
  return [...hist, ...live];
}

export function wasteIn(s: RestaurantState, range: { from: string; to: string }) {
  const hist: HistWaste[] = s.history.waste.filter((w) => w.day >= range.from && w.day <= range.to);
  const live = range.to >= s.baseDate ? s.moves.filter((m) => m.kind === "waste").map((m) => ({ day: s.baseDate, ingredientId: m.ingredientId, qty: wasteQty(m), cost: wasteQty(m) * m.unitCost, reason: m.reason ?? "" })) : [];
  return [...hist, ...live];
}

export function summary(s: RestaurantState, range: { from: string; to: string }) {
  const f = facts(s, range);
  const sold = f.filter((o) => o.status === "completed");
  const lost = f.filter((o) => o.status !== "completed");
  const gross = sold.reduce((a, o) => a + o.gross, 0);
  const net = sold.reduce((a, o) => a + o.net, 0);
  const cost = sold.reduce((a, o) => a + o.cost, 0);
  const orders = sold.length;
  const byChannel = (["waiter", "qr", "website"] as Channel[]).map((ch) => {
    const x = sold.filter((o) => o.channel === ch);
    const g = x.reduce((a, o) => a + o.gross, 0);
    return { channel: ch, orders: x.length, gross: g, aov: x.length ? g / x.length : 0, share: gross ? g / gross : 0 };
  });
  const remakes = sold.flatMap((o) => o.lines.filter((l) => l.remade));
  const waste = wasteIn(s, range);
  const days = Math.max(1, Math.round((Date.parse(range.to) - Date.parse(range.from)) / 864e5) + 1);
  const prepAll = sold.flatMap((o) => o.prep);
  return {
    days, gross, net, cost, gp: net - cost, gm: net ? (net - cost) / net : 0, foodCostPct: net ? cost / net : 0,
    orders, aov: orders ? gross / orders : 0, covers: sold.reduce((a, o) => a + o.covers, 0), openOrders: f.filter((o) => o.open).length,
    byChannel,
    cancelled: { orders: lost.length, gross: lost.reduce((a, o) => a + o.gross, 0), rate: f.length ? lost.length / f.length : 0 },
    remakes: { count: remakes.length, cost: remakes.reduce((a, l) => a + (l.remakeCost ?? 0), 0), rate: sold.reduce((a, o) => a + o.lines.length, 0) ? remakes.length / sold.reduce((a, o) => a + o.lines.length, 0) : 0 },
    waste: { cost: waste.reduce((a, w) => a + w.cost, 0), entries: waste.length },
    late: { tickets: prepAll.length, late: prepAll.filter((p) => p.late).length, rate: prepAll.length ? prepAll.filter((p) => p.late).length / prepAll.length : 0 },
  };
}

export function byDay(s: RestaurantState, range: { from: string; to: string }) {
  const f = facts(s, range).filter((o) => o.status === "completed");
  const out: { day: string; gross: number; orders: number; gm: number }[] = [];
  for (let d = range.from; d <= range.to; d = addDays(d, 1)) {
    const x = f.filter((o) => o.day === d);
    const net = x.reduce((a, o) => a + o.net, 0), cost = x.reduce((a, o) => a + o.cost, 0);
    out.push({ day: d, gross: x.reduce((a, o) => a + o.gross, 0), orders: x.length, gm: net ? (net - cost) / net : 0 });
  }
  return out;
}

export function byHour(s: RestaurantState, range: { from: string; to: string }) {
  const f = facts(s, range).filter((o) => o.status === "completed");
  return Array.from({ length: 13 }, (_, i) => i + 11).map((h) => ({ hour: h, orders: f.filter((o) => o.hour === h).length, gross: f.filter((o) => o.hour === h).reduce((a, o) => a + o.gross, 0) }));
}

/** Per-dish sales and economics, plus menu-engineering class (Kasavana–Smith: popularity ≥ 70% of fair share; GP ≥ weighted average). */
export function dishes(s: RestaurantState, range: { from: string; to: string }) {
  const f = facts(s, range).filter((o) => o.status === "completed");
  const rows = s.items.map((item) => {
    const lines = f.flatMap((o) => o.lines.filter((l) => l.itemId === item.id));
    const qty = lines.reduce((a, l) => a + l.qty, 0);
    const gross = lines.reduce((a, l) => a + l.gross, 0), net = lines.reduce((a, l) => a + l.net, 0), cost = lines.reduce((a, l) => a + l.cost, 0);
    const now = dishEconomics(s, item.id);
    return { item, qty, gross, net, cost, gp: net - cost, gm: net ? (net - cost) / net : 0, now, cls: "" as "star" | "plowhorse" | "puzzle" | "dog" | "" };
  });
  const food = rows.filter((r) => r.item.categoryId !== "drinks");
  const totalQty = food.reduce((a, r) => a + r.qty, 0) || 1;
  const fair = (1 / food.length) * 0.7;
  const avgGp = food.reduce((a, r) => a + r.now.gp * r.qty, 0) / totalQty;
  for (const r of food) r.cls = r.qty / totalQty >= fair ? (r.now.gp >= avgGp ? "star" : "plowhorse") : r.now.gp >= avgGp ? "puzzle" : "dog";
  return { rows: rows.sort((a, b) => b.gross - a.gross), avgGp, fairShare: fair };
}

export function prepStats(s: RestaurantState, range: { from: string; to: string }) {
  const f = facts(s, range).filter((o) => o.status === "completed");
  return s.stations.map((st) => {
    const p = f.flatMap((o) => o.prep.filter((x) => x.station === st.id)).map((x) => x.min).sort((a, b) => a - b);
    const peak = f.filter((o) => [5, 6].includes(new Date(o.day + "T12:00:00Z").getUTCDay()) && o.hour >= 19 && o.hour <= 21).flatMap((o) => o.prep.filter((x) => x.station === st.id));
    return {
      station: st, tickets: p.length, avg: p.length ? p.reduce((a, b) => a + b, 0) / p.length : 0, p90: p.length ? p[Math.floor(p.length * 0.9)] : 0,
      lateRate: p.length ? f.flatMap((o) => o.prep.filter((x) => x.station === st.id && x.late)).length / p.length : 0,
      peakLateRate: peak.length ? peak.filter((x) => x.late).length / peak.length : 0, peakTickets: peak.length,
    };
  });
}

/** Ingredient price changes in the last 28 days with the monthly cost impact on actual usage. */
export function priceChanges(s: RestaurantState) {
  const since = Date.parse(addDays(s.baseDate, -28) + "T00:00:00Z");
  const usage = monthlyUsage(s);
  return s.ingredients.map((ing) => {
    const pts = s.prices.filter((p) => p.ingredientId === ing.id).sort((a, b) => a.at - b.at);
    const first = pts.filter((p) => p.at <= since).pop() ?? pts[0];
    const from = first?.cost ?? ing.cost;
    const changedAt = pts.filter((p) => p.at > since && p.cost !== from).pop()?.at;
    const deltaUnit = (ing.cost - from) / ing.unitsPerPurchase;
    const dishes = s.recipes.filter((r) => r.lines.some((l) => l.ingredientId === ing.id)).map((r) => r.itemId);
    return { ingredient: ing, from, to: ing.cost, pct: from ? (ing.cost - from) / from : 0, changedAt, monthlyUsage: usage[ing.id] ?? 0, monthlyImpact: deltaUnit * (usage[ing.id] ?? 0), dishes };
  }).filter((x) => x.to !== x.from).sort((a, b) => b.monthlyImpact - a.monthlyImpact);
}

/** Gross usage per ingredient over the last 28 days of sold dishes, scaled to 30 days. */
export function monthlyUsage(s: RestaurantState) {
  const f = facts(s, periodDays(s, "28d")).filter((o) => o.status === "completed");
  const qtyByItem: Record<string, number> = {};
  for (const o of f) for (const l of o.lines) qtyByItem[l.itemId] = (qtyByItem[l.itemId] ?? 0) + l.qty;
  const usage: Record<string, number> = {};
  for (const r of s.recipes) for (const l of r.lines) usage[l.ingredientId] = (usage[l.ingredientId] ?? 0) + (l.qty / (l.yieldPct || 1)) * (qtyByItem[r.itemId] ?? 0) * (30 / 28);
  return usage;
}

/** Dish margin now vs 28 days ago (same recipe, ingredient prices then vs now). */
export function marginErosion(s: RestaurantState) {
  const since = Date.parse(addDays(s.baseDate, -28) + "T12:00:00Z");
  const costThen = (id: string) => {
    const ing = s.ingredients.find((i) => i.id === id)!;
    const pts = s.prices.filter((p) => p.ingredientId === id && p.at <= since);
    return (pts.length ? pts[pts.length - 1].cost : ing.cost) / ing.unitsPerPurchase;
  };
  return s.items.map((item) => {
    const now = dishEconomics(s, item.id);
    const then = dishEconomics(s, item.id, costThen);
    return { item, gmNow: now.gm, gmThen: then.gm, costNow: now.cost, costThen: then.cost, delta: now.gm - then.gm };
  }).filter((x) => Math.abs(x.delta) > 0.0005).sort((a, b) => a.delta - b.delta);
}

export function stockStatus(s: RestaurantState) {
  return s.ingredients.map((ing) => {
    const qty = (s.stockStart[ing.id] ?? 0) + s.moves.filter((m) => m.ingredientId === ing.id).reduce((a, m) => a + m.qty, 0);
    const exp = s.expiring.filter((e) => e.ingredientId === ing.id);
    return { ingredient: ing, qty, value: qty * unitCost(ing), low: qty < ing.minLevel, suggested: qty < ing.minLevel ? Math.max(0, ing.parLevel - qty) : 0, expiring: exp };
  });
}

/** Net profit only when the owner entered operating expenses; otherwise null ("requires expense data"). */
export function netProfit(s: RestaurantState, range: { from: string; to: string }) {
  const e = s.settings.expenses;
  if (!e) return null;
  const sm = summary(s, range);
  const monthly = e.rent + e.staff + e.utilities + e.other;
  return { expenses: (monthly * sm.days) / 30, value: sm.gp - (monthly * sm.days) / 30 };
}

/* ---------------- Business Performance & Savings Calculator ---------------- */

export type SavingsRow = {
  id: "waste" | "remakes" | "prices" | "stockouts" | "labour";
  title: string;
  actual: { label: string; value: number; unit: "amd" | "count" | "min"; kind: "actual" | "calculated"; source: string };
  base: { label: string; value: number };
  assumption: { key: keyof RestaurantState["settings"]["savings"]; label: string; value: number; unit: "%" | "min" | "amd" };
  formula: string;
  result: number;
  note?: string;
};

export function savings(s: RestaurantState) {
  const range = periodDays(s, "28d");
  const k = 30 / 28;
  const sum = summary(s, range);
  const a = s.settings.savings;
  const f = facts(s, range);
  const wasteCost = sum.waste.cost;
  const remakeCost = sum.remakes.cost; // cancellations before cooking cost nothing (stock is reversed); after cooking they are in waste
  const price = priceChanges(s).filter((p) => p.monthlyImpact > 0).reduce((x, p) => x + p.monthlyImpact, 0);
  // stock-outs: lost gross profit while a dish was unavailable = minutes × that dish's average GP per open minute (11 open hours/day)
  const ds = dishes(s, range).rows;
  const stockoutLost = s.history.stockouts.filter((x) => x.day >= range.from).reduce((x, so) => {
    const r = ds.find((d) => d.item.id === so.itemId);
    const gpPerMin = r ? r.gp / (28 * 11 * 60) : 0;
    return x + so.minutes * gpPerMin;
  }, 0);
  const stockoutMin = s.history.stockouts.filter((x) => x.day >= range.from).reduce((x, so) => x + so.minutes, 0);
  const digitalOrders = f.filter((o) => o.status === "completed" && o.type === "dine_in").length;

  const rows: SavingsRow[] = [
    { id: "waste", title: "Սննդի կորուստ (waste)", actual: { label: "Գրանցված կորուստ 28 օրում", value: wasteCost, unit: "amd", kind: "actual", source: "Կորուստների մատյան + չեղարկում/վերապատրաստում պատրաստելուց հետո" }, base: { label: "Ամսական (×30/28)", value: wasteCost * k }, assumption: { key: "wasteReductionPct", label: "Կորուստի կրճատում", value: a.wasteReductionPct, unit: "%" }, formula: "ամսական կորուստ × կրճատման %", result: wasteCost * k * (a.wasteReductionPct / 100) },
    { id: "remakes", title: "Վերապատրաստված ուտեստներ (սխալներ)", actual: { label: `${sum.remakes.count} վերապատրաստում 28 օրում`, value: remakeCost, unit: "amd", kind: "actual", source: "Վերապատրաստված դիրքերի բաղադրատոմսային ինքնարժեք" }, base: { label: "Ամսական (×30/28)", value: remakeCost * k }, assumption: { key: "remakeReductionPct", label: "Սխալների կրճատում", value: a.remakeReductionPct, unit: "%" }, formula: "ամսական վերապատրաստման ինքնարժեք × կրճատման %", result: remakeCost * k * (a.remakeReductionPct / 100) },
    { id: "prices", title: "Բաղադրիչների գնաճ", actual: { label: "Ամսական լրացուցիչ ինքնարժեք", value: price, unit: "amd", kind: "calculated", source: "Գնի փոփոխություն × փաստացի ամսական օգտագործում (բաղադրատոմսերով)" }, base: { label: "Ամսական ազդեցություն", value: price }, assumption: { key: "priceRecoveryPct", label: "Վերականգնվող մաս (գին, բաժին, մատակարար)", value: a.priceRecoveryPct, unit: "%" }, formula: "ամսական գնաճի ազդեցություն × վերականգնվող %", result: price * (a.priceRecoveryPct / 100) },
    { id: "stockouts", title: "Վերջացած ուտեստներ (stock-outs)", actual: { label: `${Math.round(stockoutMin / 60)} ժամ անհասանելիություն 28 օրում`, value: stockoutMin, unit: "min", kind: "actual", source: "«Վերջացել է» նշումների պատմություն" }, base: { label: "Կորցրած համախառն շահույթ / ամիս (հաշվարկ)", value: stockoutLost * k }, assumption: { key: "stockoutRecoveryPct", label: "Կանխվող մաս (պաշարի ազդանշաններ)", value: a.stockoutRecoveryPct, unit: "%" }, formula: "րոպեներ × ուտեստի միջին համախառն շահույթ/րոպե × ×30/28 × կանխվող %", result: stockoutLost * k * (a.stockoutRecoveryPct / 100), note: "Ենթադրում է, որ պահանջարկը հավասար է բաշխված 11 աշխատանքային ժամերին" },
    { id: "labour", title: "Պատվերի ընդունման ժամանակ", actual: { label: `${digitalOrders} սրահի պատվեր 28 օրում`, value: digitalOrders, unit: "count", kind: "actual", source: "Սրահի ավարտված պատվերներ" }, base: { label: "Պատվերներ / ամիս", value: digitalOrders * k }, assumption: { key: "minutesSavedPerOrder", label: "Խնայված րոպե յուրաքանչյուր պատվերի համար", value: a.minutesSavedPerOrder, unit: "min" }, formula: "պատվերներ/ամիս × րոպե ÷ 60 × աշխատաժամի արժեք", result: ((digitalOrders * k * a.minutesSavedPerOrder) / 60) * a.labourCostPerHour, note: `Աշխատաժամի արժեք՝ ${a.labourCostPerHour} ֏ (ենթադրություն, փոխարինեք Ձեր թվով)։ Ազատված ժամանակ է, ոչ անպայման կանխիկ խնայողություն` },
  ];
  return { rows, total: rows.reduce((x, r) => x + r.result, 0), basis: "Վերջին 28 օրվա ցուցադրական տվյալներ, վերահաշվարկված 30 օրվա" };
}

/* ---------------- insights (each with its evidence) ---------------- */

export type Insight = { id: string; tone: "warn" | "ok" | "info"; title: string; action: string; evidence: string[]; href: string };

export function insights(s: RestaurantState): Insight[] {
  const out: Insight[] = [];
  const r28 = periodDays(s, "28d");
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
  const amd = (n: number) => `${Math.round(n).toLocaleString("en-US").replace(/,/g, " ")} ֏`;
  const ero = marginErosion(s)[0];
  if (ero && ero.delta < -0.01) {
    const pc = priceChanges(s).find((p) => p.dishes.includes(ero.item.id) && p.pct > 0);
    out.push({ id: "erosion", tone: "warn", title: `«${ero.item.name.hy}»-ի մարժան նվազել է ${(-ero.delta * 100).toFixed(1)} տոկոսային կետով`, action: "Վերանայեք գինը կամ բաժինը, կամ բանակցեք մատակարարի հետ", evidence: [`Մարժա 28 օր առաջ՝ ${pct(ero.gmThen)}, այսօր՝ ${pct(ero.gmNow)}`, `Ինքնարժեք՝ ${amd(ero.costThen)} → ${amd(ero.costNow)}`, ...(pc ? [`${pc.ingredient.name}՝ ${amd(pc.from)} → ${amd(pc.to)} (${pct(pc.pct)})`] : [])], href: `/r/admin/recipes?item=${ero.item.id}` });
  }
  const d = dishes(s, r28);
  const puzzle = d.rows.filter((x) => x.cls === "puzzle").sort((a, b) => b.now.gp - a.now.gp)[0];
  if (puzzle) out.push({ id: "puzzle", tone: "info", title: `«${puzzle.item.name.hy}»՝ բարձր շահույթ, ցածր պահանջարկ`, action: "Առաջարկեք մատուցողների միջոցով և նշեք «Շեֆն առաջարկում է» մենյուում", evidence: [`Համախառն շահույթ մեկ բաժնից՝ ${amd(puzzle.now.gp)} (միջինը՝ ${amd(d.avgGp)})`, `Վաճառք 28 օրում՝ ${puzzle.qty} բաժին`], href: "/r/admin/analytics?tab=menu" });
  const plow = d.rows.filter((x) => x.cls === "plowhorse").sort((a, b) => b.qty - a.qty)[0];
  if (plow) out.push({ id: "plowhorse", tone: "info", title: `«${plow.item.name.hy}»՝ շատ է վաճառվում, բայց մեկ բաժնի շահույթը ցածր է`, action: "Փոքր գնի բարձրացումը կամ զույգ առաջարկը (օր.՝ + ըմպելիք) կազդի մեծ ծավալի վրա", evidence: [`Վաճառք՝ ${plow.qty} բաժին 28 օրում`, `Համախառն շահույթ՝ ${amd(plow.now.gp)}/բաժին (միջինը՝ ${amd(d.avgGp)})`, `Համախառն մարժա՝ ${pct(plow.now.gm)}`], href: `/r/admin/recipes?item=${plow.item.id}` });
  const grill = prepStats(s, r28).find((x) => x.station.id === "grill");
  if (grill && grill.peakLateRate > grill.lateRate * 1.5 && grill.peakTickets > 20) out.push({ id: "grill", tone: "warn", title: `Մանղալը ուշանում է ուրբաթ-շաբաթ 19:00–22:00`, action: "Պիկ ժամերին ավելացրեք մեկ խոհարար մանղալում կամ նախապատրաստեք շամփուրները", evidence: [`Ուշացած տոմսեր պիկին՝ ${pct(grill.peakLateRate)} (${grill.peakTickets} տոմս)`, `Մյուս ժամերին՝ ${pct(grill.lateRate)}`, `Շեմ՝ ${grill.station.thresholds.red} րոպե`], href: "/r/admin/analytics?tab=ops" });
  const sm = summary(s, r28);
  const qr = sm.byChannel.find((c) => c.channel === "qr")!, w = sm.byChannel.find((c) => c.channel === "waiter")!;
  if (qr.aov > w.aov * 1.03) out.push({ id: "qr", tone: "ok", title: `QR պատվերների միջին չեկը ${pct(qr.aov / w.aov - 1)}-ով բարձր է`, action: "Տեղադրեք QR բոլոր սրահներում և ավելացրեք հավելումներ մենյուում", evidence: [`QR՝ ${amd(qr.aov)} (${qr.orders} պատվեր)`, `Մատուցող՝ ${amd(w.aov)} (${w.orders} պատվեր)`], href: "/r/admin/analytics?tab=sales" });
  const so = s.history.stockouts.filter((x) => x.itemId === "salmon");
  if (so.length >= 2) out.push({ id: "stockout", tone: "warn", title: "Սաղմոնը վերջացել է 2 անգամ վերջին 2 շաբաթում", action: "Բարձրացրեք սաղմոնի նվազագույն պաշարը և պատվիրեք մատակարարման օրից առաջ", evidence: so.map((x) => `${x.day}՝ ${Math.round(x.minutes / 60 * 10) / 10} ժամ անհասանելի`), href: "/r/admin/inventory?open=salmon" });
  const wz = wasteIn(s, r28);
  const byIng: Record<string, number> = {};
  for (const x of wz) byIng[x.ingredientId] = (byIng[x.ingredientId] ?? 0) + x.cost;
  const top = Object.entries(byIng).sort((a, b) => b[1] - a[1])[0];
  if (top) { const ing = s.ingredients.find((i) => i.id === top[0])!; out.push({ id: "waste", tone: "info", title: `Ամենամեծ կորուստը՝ ${ing.name}`, action: "Փոքրացրեք պատվերի խմբաքանակը կամ ավելացրեք «օգտագործել առաջինը» հատուկ ուտեստ", evidence: [`Կորուստ 28 օրում՝ ${amd(top[1])}`, `Ընդհանուր կորուստ՝ ${amd(sm.waste.cost)}`], href: "/r/admin/inventory?tab=waste" }); }
  return out;
}

export { linesCost };
