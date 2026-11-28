/*
 * AI Restaurant Business Assistant (deterministic, data-grounded).
 * Each answer is computed from Restaurant OS data through the same analytics used by the dashboards, and returns:
 *   - kind: "analysis" (read-only) | "recommendation"
 *   - lines: the answer, with numbers
 *   - sources: where every number comes from (formula / dataset)
 *   - actions: proposed actions that REQUIRE the user's confirmation and permission (never executed automatically)
 * Natural-language matching is keyword-based (hy/ru/en). An LLM adapter can replace the matcher and phrasing while
 * keeping these functions as its tools — see docs/RESTAURANT_OS_AI_ARCHITECTURE.md.
 */
import * as A from "./analytics.ts";
import { onHand } from "./engine.ts";
import type { Permission } from "./permissions.ts";
import { tableState, ticketAge } from "./rules.ts";
import type { RestaurantEvent, RestaurantState } from "./types.ts";

export type Answer = { title: string; kind: "analysis" | "recommendation"; lines: string[]; sources: string[]; actions?: { label: string; permission: Permission; events: RestaurantEvent[] }[] };
const amd = (n: number) => `${Math.round(n).toLocaleString("en-US").replace(/,/g, " ")} ֏`;
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export const QUESTIONS: { id: string; q: string; match: RegExp }[] = [
  { id: "summary", q: "Տուր այսօրվա աշխատանքի ամփոփում", match: /summary|summar|ամփոփ|сводк|итог|как дела|today.*performance/i },
  { id: "revenue", q: "Որքա՞ն եկամուտ ունենք այսօր", match: /revenue|sales|выручк|продаж|եկամուտ|վաճառք/i },
  { id: "best", q: "Ո՞ր ուտեստներն են ամենաշատը վաճառվել", match: /best.?sell|top dish|most sold|продава|популяр|վաճառվ/i },
  { id: "foodcost", q: "Ո՞ր ուտեստների ինքնարժեքն է ամենաբարձրը", match: /food cost|highest cost|себестоим|ինքնարժեք/i },
  { id: "margin", q: "Ո՞ր ուտեստներն ունեն ցածր մարժա", match: /margin|маржа|маржин|մարժա/i },
  { id: "stock", q: "Ո՞ր բաղադրիչներն են վերջանում", match: /stock|running low|ingredient|запас|заканчив|պաշար|վերջան|բաղադրիչ/i },
  { id: "waste", q: "Որքա՞ն է այս շաբաթվա կորուստը", match: /waste|spoil|списан|отход|կորուստ/i },
  { id: "slow", q: "Ո՞ր պատվերներն են ուշացել", match: /slow|late|took too long|delay|долго|задерж|ուշաց/i },
  { id: "waiting", q: "Ո՞ր սեղաններն են ամենաերկար սպասում", match: /waiting|tables.*wait|ждут|սպասում/i },
  { id: "reservations", q: "Քանի՞ ամրագրում ունենք այս երեկո", match: /reservation|booking|брон|ամրագր/i },
  { id: "inbox", q: "Ո՞ր հաճախորդների հաղորդագրություններն են անպատասխան", match: /unanswered|message|inbox|сообщен|հաղորդագր/i },
  { id: "complaints", q: "Ինչի՞ց են ամենաշատը բողոքում հյուրերը", match: /complain|feedback|review|жалоб|отзыв|բողոք|կարծիք/i },
  { id: "tasks", q: "Ո՞ր առաջադրանքներն են ուշացած", match: /task|overdue|задач|առաջադրանք/i },
  { id: "investigate", q: "Ո՞ր 5 ուտեստներն են պահանջում ղեկավարության ուշադրություն", match: /investigate|attention|deserve|внимани|ուշադրություն/i },
  { id: "problems", q: "Որո՞նք են շաբաթվա հիմնական խնդիրները", match: /problem|issue|проблем|խնդիր/i },
];

export function ask(s: RestaurantState, text: string, now: number): Answer {
  const q = QUESTIONS.find((x) => x.match.test(text));
  return q ? answer(s, q.id, now) : { title: "Չհասկացա հարցը", kind: "analysis", lines: ["Ես պատասխանում եմ միայն Restaurant OS-ի տվյալներով։ Փորձեք առաջարկվող հարցերից մեկը (վաճառք, ուտեստներ, մարժա, պաշար, կորուստ, ուշացումներ, ամրագրումներ, հաղորդագրություններ, կարծիքներ, առաջադրանքներ)։"], sources: [] };
}

export function answer(s: RestaurantState, id: string, now: number): Answer {
  const today = A.periodDays(s, "today"), week = A.periodDays(s, "7d"), month = A.periodDays(s, "28d");
  switch (id) {
    case "revenue": {
      const sm = A.summary(s, today);
      const prev = A.summary(s, A.previousPeriod(s, "today")!);
      return { title: "Այսօրվա եկամուտ", kind: "analysis", lines: [`Վաճառք՝ ${amd(sm.gross)} (${sm.orders} պատվեր, միջին չեկ ${amd(sm.aov)}), որից ${sm.openOrders} պատվեր դեռ բաց է։`, `Նախորդ շաբաթվա նույն օրը՝ ${amd(prev.gross)}։`, ...sm.byChannel.map((c) => `${c.channel === "qr" ? "QR" : c.channel === "waiter" ? "Մատուցող" : "Կայք"}՝ ${amd(c.gross)} (${c.orders})`)], sources: ["Վաճառք = ընդունված և փակված պատվերների գումար (ներառյալ ԱԱՀ), չեղարկվածները՝ ոչ", "Աղբյուր՝ այսօրվա պատվերներ + պատմություն"] };
    }
    case "best": {
      const d = A.dishes(s, week).rows.filter((x) => x.item.categoryId !== "drinks").sort((a, b) => b.qty - a.qty).slice(0, 5);
      return { title: "Ամենավաճառվող ուտեստներ (7 օր)", kind: "analysis", lines: d.map((x, i) => `${i + 1}. ${x.item.name.hy} — ${x.qty} բաժին, ${amd(x.gross)}, մարժա ${pct(x.now.gm)}`), sources: ["Ավարտված պատվերների դիրքեր, վերջին 7 օր"] };
    }
    case "foodcost": {
      const d = A.dishes(s, month).rows.filter((x) => x.item.categoryId !== "drinks").sort((a, b) => b.now.foodCostPct - a.now.foodCostPct).slice(0, 5);
      return { title: "Ամենաբարձր սննդի ինքնարժեքի %", kind: "analysis", lines: d.map((x) => `${x.item.name.hy} — ${pct(x.now.foodCostPct)} (ինքնարժեք ${amd(x.now.cost)}, զուտ գին ${amd(x.now.net)})`), sources: ["Սննդի ինքնարժեքի % = բաղադրատոմսի ինքնարժեք ÷ զուտ գին (առանց ԱԱՀ)", "Բաղադրիչների ընթացիկ գներ"] };
    }
    case "margin": {
      const ero = A.marginErosion(s).filter((x) => x.delta < -0.005).slice(0, 3);
      const low = A.dishes(s, month).rows.filter((x) => x.item.categoryId !== "drinks").sort((a, b) => a.now.gm - b.now.gm).slice(0, 4);
      return {
        title: "Ցածր մարժայով ուտեստներ", kind: "recommendation",
        lines: [...low.map((x) => `${x.item.name.hy} — համախառն մարժա ${pct(x.now.gm)}, շահույթ ${amd(x.now.gp)}/բաժին, ${x.qty} բաժին 28 օրում`), ...ero.map((x) => `↓ ${x.item.name.hy}՝ մարժան ${pct(x.gmThen)} → ${pct(x.gmNow)} գնաճի պատճառով`), "Առաջարկ՝ վերանայել գինը կամ բաժինը. ամենամեծ ազդեցությունը մեծ ծավալով ուտեստներն են։"],
        sources: ["Համախառն մարժա = (զուտ գին − ինքնարժեք) ÷ զուտ գին", "Համեմատություն 28 օր առաջվա գների հետ (գների պատմություն)"],
        actions: low.length ? [{ label: `Առաջադրանք շեֆին՝ վերանայել «${low[0].item.name.hy}»-ի բաժինը`, permission: "team.manage", events: [{ type: "task.create", title: `Վերանայել «${low[0].item.name.hy}»-ի բաժինը և ինքնարժեքը`, role: "chef", priority: "normal", source: "assistant" }] }] : undefined,
      };
    }
    case "stock": {
      const low = A.stockStatus(s).filter((x) => x.low);
      const bySup = new Map<string, { ingredientId: string; qty: number }[]>();
      for (const x of low) {
        const open = s.pos.some((p) => !["received", "cancelled"].includes(p.status) && p.lines.some((l) => l.ingredientId === x.ingredient.id && l.received < l.qty));
        if (open) continue;
        const qty = Math.max(1, Math.ceil(((x.ingredient.parLevel - x.qty) / x.ingredient.unitsPerPurchase) * 10) / 10);
        bySup.set(x.ingredient.supplierId, [...(bySup.get(x.ingredient.supplierId) ?? []), { ingredientId: x.ingredient.id, qty }]);
      }
      return {
        title: "Վերջացող բաղադրիչներ", kind: "recommendation",
        lines: low.length ? low.map((x) => `${x.ingredient.name} — ${Math.round(x.qty)} / նվազագույն ${x.ingredient.minLevel} ${x.ingredient.unit}${s.pos.some((p) => !["received", "cancelled"].includes(p.status) && p.lines.some((l) => l.ingredientId === x.ingredient.id)) ? " · գնման պատվերն արդեն կա" : ""}`) : ["Բոլոր բաղադրիչները նվազագույնից բարձր են։"],
        sources: ["Պաշար = սկզբնական + ստացումներ − օգտագործում (բաղադրատոմսով) − կորուստ ± գույքագրում", "Նվազագույն և նպատակային մակարդակները՝ կարգավորումներից"],
        actions: [...bySup.entries()].map(([sup, lines]) => ({ label: `Ստեղծել գնման սևագիր՝ ${s.suppliers.find((x) => x.id === sup)?.name} (${lines.length} դիրք)`, permission: "purchasing.manage" as Permission, events: [{ type: "po.create" as const, supplierId: sup, lines }] })),
      };
    }
    case "waste": {
      const w = A.wasteIn(s, week);
      const by: Record<string, number> = {};
      for (const x of w) by[x.ingredientId] = (by[x.ingredientId] ?? 0) + x.cost;
      const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 4);
      return { title: "Կորուստ՝ վերջին 7 օր", kind: "analysis", lines: [`Ընդամենը՝ ${amd(w.reduce((a, x) => a + x.cost, 0))} (${w.length} գրանցում)`, ...top.map(([k, v]) => `${s.ingredients.find((i) => i.id === k)?.name} — ${amd(v)}`)], sources: ["Կորուստների մատյան + պատրաստելուց հետո չեղարկված/վերապատրաստված ուտեստներ", "Արժեք = քանակ × միավորի գին գրանցման պահին"] };
    }
    case "slow": {
      const live = s.tickets.filter((t) => (t.status === "queued" || t.status === "in_progress") && ticketAge(t, now) > (s.stations.find((x) => x.id === t.station)?.thresholds.red ?? 99));
      const prep = A.prepStats(s, week).sort((a, b) => b.lateRate - a.lateRate);
      return { title: "Ուշացող պատվերներ", kind: "analysis", lines: [live.length ? `Հիմա ուշանում են՝ ${live.map((t) => `${s.orders.find((o) => o.id === t.orderId)?.code} (${t.station}, ${Math.round(ticketAge(t, now))} ր)`).join(", ")}` : "Հիմա ուշացող տոմս չկա։", ...prep.slice(0, 3).map((p) => `${p.station.name}՝ ${pct(p.lateRate)} ուշացած 7 օրում (պիկին՝ ${pct(p.peakLateRate)})`)], sources: ["Ուշացած = տոմսի ժամանակը > կայանի կարմիր շեմ", "Խոհանոցի տոմսերի ժամանակներ"] };
    }
    case "waiting": {
      const rows = s.sessions.filter((x) => x.status === "open").map((x) => {
        const t = s.tables.find((y) => y.id === x.tableId)!;
        const os = s.orders.filter((o) => o.sessionId === x.id && ["accepted", "preparing"].includes(o.status));
        const oldest = os.length ? Math.min(...os.map((o) => o.acceptedAt ?? o.createdAt)) : undefined;
        return { t, st: tableState(s, t, now), wait: oldest ? (now - oldest) / 60000 : 0 };
      }).filter((x) => x.wait > 0).sort((a, b) => b.wait - a.wait).slice(0, 5);
      return { title: "Ամենաերկար սպասող սեղաններ", kind: "analysis", lines: rows.length ? rows.map((x) => `Սեղան ${x.t.label} — ${Math.round(x.wait)} րոպե խոհանոցում`) : ["Ուտեստին սպասող սեղան չկա։"], sources: ["Ժամանակ՝ պատվերի ընդունումից մինչև հիմա"] };
    }
    case "reservations": {
      const end = Date.parse(s.baseDate + "T20:00:00Z"); // end of business day (00:00 Yerevan)
      const tonight = s.reservations.filter((r) => r.at >= now - 2 * 3600000 && r.at <= end && !["cancelled", "declined"].includes(r.status));
      const req = tonight.filter((r) => r.status === "requested");
      return { title: "Ամրագրումներ այս երեկո", kind: "analysis", lines: [`${tonight.length} ամրագրում, ${tonight.reduce((a, r) => a + r.partySize, 0)} հյուր`, `Հաստատման սպասող՝ ${req.length}`, ...tonight.map((r) => `${new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour: "2-digit", minute: "2-digit" }).format(r.at)} · ${r.name} · ${r.partySize} · ${r.status}${r.allergies ? ` · ալերգիա՝ ${r.allergies}` : ""}`)], sources: ["Ամրագրումների գիրք"] };
    }
    case "inbox": {
      const un = s.inbox.filter((c) => c.status !== "resolved" && c.messages.at(-1)?.dir === "in");
      return { title: "Անպատասխան հաղորդագրություններ", kind: "analysis", lines: un.length ? un.map((c) => `${c.customer.name} (${c.channel}) · ${Math.round((now - c.messages.at(-1)!.at) / 60000)} ր · ${c.priority === "high" ? "բարձր առաջնահերթություն" : "սովորական"}`) : ["Բոլոր հաղորդագրություններին պատասխանված է։"], sources: ["Միասնական մուտքային արկղ (վերջին հաղորդագրությունը հաճախորդից)"] };
    }
    case "complaints": {
      const rv = s.reviews.filter((r) => r.at >= Date.parse(month.from));
      const cats: Record<string, number> = {};
      for (const r of rv) for (const [k, v] of Object.entries(r.categories)) if (v === -1) cats[k] = (cats[k] ?? 0) + 1;
      const names: Record<string, string> = { food: "ուտեստներ", service: "սպասարկում", price: "գներ", ambience: "մթնոլորտ", wait: "սպասման ժամանակ" };
      const avg = rv.reduce((a, r) => a + r.rating, 0) / (rv.length || 1);
      return { title: "Հյուրերի կարծիքներ՝ 28 օր", kind: "analysis", lines: [`${rv.length} կարծիք, միջին գնահատական ${avg.toFixed(2)}★`, ...Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `Բողոք՝ ${names[k]} — ${v} կարծիքում`), `Անպատասխան՝ ${rv.filter((r) => !r.reply).length}`], sources: ["Կարծիքներ (Google, Tripadvisor, TheFork՝ ցուցադրական ադապտեր)", "Թեմաները՝ բանալի բառերով դասակարգում (hy/ru/en)"] };
    }
    case "tasks": {
      const od = s.tasks.filter((t) => t.status === "open" && t.due && t.due < now);
      return { title: "Ուշացած առաջադրանքներ", kind: "analysis", lines: od.length ? od.map((t) => `${t.title} · ${t.assigneeId ? s.staff.find((x) => x.id === t.assigneeId)?.name : t.role}`) : ["Ուշացած առաջադրանք չկա։"], sources: ["Առաջադրանքներ՝ ժամկետ < հիմա և բաց"] };
    }
    case "investigate": {
      const d = A.dishes(s, month);
      const ero = A.marginErosion(s).filter((x) => x.delta < -0.01).map((x) => ({ id: x.item.id, why: `մարժան ${pct(x.gmThen)} → ${pct(x.gmNow)}` }));
      const dogs = d.rows.filter((x) => x.cls === "dog").map((x) => ({ id: x.item.id, why: `ցածր պահանջարկ (${x.qty}) և ցածր շահույթ` }));
      const plow = d.rows.filter((x) => x.cls === "plowhorse").sort((a, b) => b.qty - a.qty).map((x) => ({ id: x.item.id, why: `շատ է վաճառվում (${x.qty}), բայց շահույթը ${amd(x.now.gp)}/բաժին` }));
      const so = s.history.stockouts.filter((x) => x.day >= month.from).map((x) => ({ id: x.itemId, why: `վերջացել է (${Math.round(x.minutes / 60)} ժ)` }));
      const seen = new Set<string>(); const list: { id: string; why: string }[] = [];
      for (const x of [...ero, ...so, ...plow, ...dogs]) if (!seen.has(x.id)) { seen.add(x.id); list.push(x); }
      return { title: "5 ուտեստ՝ ղեկավարության ուշադրության համար", kind: "recommendation", lines: list.slice(0, 5).map((x, i) => `${i + 1}. ${s.items.find((it) => it.id === x.id)?.name.hy} — ${x.why}`), sources: ["Մենյուի ինժեներիա (պահանջարկ × շահույթ)", "Գների պատմություն", "«Վերջացել է» պատմություն"] };
    }
    case "problems":
    case "summary": {
      const sm = A.summary(s, id === "summary" ? today : week);
      const late = s.tickets.filter((t) => (t.status === "queued" || t.status === "in_progress") && ticketAge(t, now) > (s.stations.find((x) => x.id === t.station)?.thresholds.red ?? 99));
      const low = s.ingredients.filter((i) => onHand(s, i.id) < i.minLevel);
      const un = s.inbox.filter((c) => c.status !== "resolved" && c.messages.at(-1)?.dir === "in");
      const neg = s.reviews.filter((r) => r.rating <= 3 && !r.reply);
      const od = s.tasks.filter((t) => t.status === "open" && t.due && t.due < now);
      const reqRes = s.reservations.filter((r) => r.status === "requested");
      const occ = s.tables.filter((t) => ["seated", "ordering", "waiting_food", "eating", "bill", "payment_pending"].includes(tableState(s, t, now))).length;
      const problems = [
        late.length && { w: late.length * 3, t: `${late.length} ուշացող տոմս խոհանոցում` },
        reqRes.length && { w: reqRes.length * 2, t: `${reqRes.length} ամրագրման հարցում սպասում է հաստատման` },
        un.length && { w: un.length * 2, t: `${un.length} անպատասխան հաղորդագրություն (${un.filter((c) => c.priority === "high").length} բարձր առաջնահերթության)` },
        neg.length && { w: neg.length, t: `${neg.length} անպատասխան բացասական կարծիք` },
        low.length && { w: low.length, t: `${low.length} բաղադրիչ նվազագույնից ցածր (${low.slice(0, 3).map((i) => i.name).join(", ")})` },
        od.length && { w: od.length, t: `${od.length} ուշացած առաջադրանք` },
      ].filter(Boolean) as { w: number; t: string }[];
      return {
        title: id === "summary" ? "Այսօրվա ամփոփում" : "Շաբաթվա հիմնական խնդիրները", kind: "analysis",
        lines: [
          id === "summary" ? `Վաճառք՝ ${amd(sm.gross)} · ${sm.orders} պատվեր · միջին չեկ ${amd(sm.aov)} · համախառն մարժա ${pct(sm.gm)}` : `7 օր՝ վաճառք ${amd(sm.gross)}, ուշացած տոմսեր ${pct(sm.late.rate)}, չեղարկումներ ${sm.cancelled.orders}, վերապատրաստում ${sm.remakes.count}, կորուստ ${amd(sm.waste.cost)}`,
          `Զբաղված սեղաններ՝ ${occ} / ${s.tables.filter((t) => s.areas.find((a) => a.id === t.areaId)?.open).length}`,
          ...(problems.length ? ["Ուշադրություն պահանջող՝", ...problems.sort((a, b) => b.w - a.w).map((p) => `• ${p.t}`)] : ["Հրատապ խնդիրներ չկան։"]),
        ],
        sources: ["Կենդանի տվյալներ՝ պատվերներ, տոմսեր, սեղաններ, ամրագրումներ, մուտքային արկղ, կարծիքներ, պաշար, առաջադրանքներ", "Վաճառք/մարժա՝ նույն բանաձևերով, ինչ վահանակում"],
      };
    }
  }
  return { title: "—", kind: "analysis", lines: [], sources: [] };
}

/* ---------------- employee assistant (SOP search) ---------------- */
export function sopSearch(s: RestaurantState, text: string) {
  const q = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  return s.sops.map((x) => ({ x, score: q.reduce((a, w) => a + (x.tags.some((t) => t.toLowerCase().includes(w) || w.includes(t.toLowerCase())) ? 3 : 0) + (x.title.toLowerCase().includes(w) ? 2 : 0) + (x.steps.join(" ").toLowerCase().includes(w) ? 1 : 0), 0) })).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).map((r) => r.x);
}
