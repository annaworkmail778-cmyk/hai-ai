/*
 * AI Hotel Business Assistant (management copilot) — deterministic demo implementation.
 * Every number is computed from the hotel state with a named formula and source, so it is traceable.
 * Unsupported questions are refused with the list of supported ones (no invented statistics or causes).
 * Permissions: financial/channel answers require a management position. Actions are only SUGGESTED;
 * creating a task needs explicit human approval in the UI.
 * Production: an LLM may phrase the answer, but it can only call these same typed, permission-checked tools.
 */
import { computeKpis, occupiedOn, periods } from "../analytics.ts";
import { addDays } from "../dates.ts";
import { isManager, SERVICE_META, DEPT_LABEL } from "../hospitality-data.ts";
import type { Dept, HotelState, Priority, Staff } from "../types.ts";
import { analyseReview, CATEGORY_LABEL, type Category } from "./review-ai.ts";
import { classify } from "./inbox-ai.ts";

export type Figure = { label: string; value: string; formula: string; source: string };
export type SuggestedAction = { label: string; task: { title: string; detail: string; priority: Priority; assigneeId: string | null } };
export type CopilotAnswer = { topic: string; answer: string; figures: Figure[]; items: string[]; actions: SuggestedAction[]; refused?: boolean; analysisOnly: true };

const fmt = (n: number) => Math.round(n).toLocaleString("en-US").replace(/,/g, " ");
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const SLA_MIN = 30;

export const SUGGESTED_QUESTIONS = [
  "Ամփոփիր այսօրվա օրը",
  "Քանի՞ սենյակ է զբաղված այսօր",
  "Ո՞ր սենյակներն են պատրաստ չէ",
  "Ո՞ր հարցումներն են ուշացած",
  "Ո՞ր բաժինն է ամենածանրաբեռնված",
  "Քանի՞ ամրագրում եկավ ըստ ալիքների",
  "Ինչպե՞ս է փոխվում չեղարկումների տոկոսը",
  "Ո՞ր հյուրերը պատասխան չեն ստացել",
  "Որո՞նք են ամենահաճախ բողոքները",
  "Ո՞ր ծառայություններն են բերում լրացուցիչ եկամուտ",
];

type Topic = "summary" | "occupancy" | "not_ready" | "overdue" | "workload" | "channels" | "cancellations" | "unanswered" | "complaints" | "extras";
const MATCH: [Topic, RegExp][] = [
  ["summary", /ամփոփ|այսօրվա օր|summary|today.*investigate|what should|итог|сводк|что проверить|ուշադրություն|ինչ ստուգել/i],
  ["not_ready", /պատրաստ չէ|not ready|не готов|չեն պատրաստ|dirty|грязн/i],
  ["occupancy", /զբաղված|occupan|загруж|занят/i],
  ["overdue", /ուշացած|overdue|просроч|ժամկետանց/i],
  ["workload", /ծանրաբեռն|workload|нагрузк|բաժին/i],
  ["channels", /ալիք|channel|канал|source|աղբյուր/i],
  ["cancellations", /չեղարկ|cancel|отмен/i],
  ["unanswered", /պատասխան չեն|unanswered|без ответа|not received a response|չպատասխանված/i],
  ["complaints", /բողոք|complain|жалоб|negative|բացասական/i],
  ["extras", /լրացուցիչ եկամուտ|additional revenue|extra|доп.*доход|ծառայություններ/i],
];
const FINANCIAL: Topic[] = ["channels", "cancellations", "extras"];

export function detectTopic(q: string): Topic | null {
  return MATCH.find(([, re]) => re.test(q))?.[0] ?? null;
}

export function askCopilot(state: HotelState, q: string, actor: Staff, now: number): CopilotAnswer {
  const topic = detectTopic(q);
  const base = { figures: [] as Figure[], items: [] as string[], actions: [] as SuggestedAction[], analysisOnly: true as const };
  if (!topic) return { ...base, topic: "unsupported", refused: true, answer: "Այս հարցին չեմ կարող պատասխանել հյուրանոցի թույլատրված տվյալներից և չեմ ենթադրի։ Կարող եմ պատասխանել այս թեմաներով․", items: SUGGESTED_QUESTIONS };
  if (FINANCIAL.includes(topic) && !isManager(actor.position)) return { ...base, topic, refused: true, answer: `Այս տվյալները (եկամուտ, ալիքներ) հասանելի են միայն ղեկավարներին։ Ձեր դերը՝ ${actor.position}։` };
  const today = state.baseDate;
  const gmId = state.staff.find((s) => s.position === "general_manager")?.id ?? null;

  const occ = () => { const n = occupiedOn(state, today).length; return { n, total: state.rooms.length, f: { label: "Զբաղված սենյակներ այսօր", value: `${n} / ${state.rooms.length} (${pct(n / state.rooms.length)})`, formula: "հաստատված կամ ներսում գտնվող ամրագրումներ, որոնց checkIn ≤ այսօր < checkOut, ÷ սենյակների քանակ", source: "reservations, rooms" } }; };
  const notReady = () => {
    const arrivals = new Set(state.reservations.filter((r) => r.checkIn === today && r.status === "confirmed" && r.roomId).map((r) => r.roomId!));
    return state.rooms.filter((r) => state.hk[r.id] === "dirty" || state.hk[r.id] === "cleaning").map((r) => ({ id: r.id, status: state.hk[r.id], arrival: arrivals.has(r.id) })).sort((a, b) => Number(b.arrival) - Number(a.arrival));
  };
  const overdue = () => {
    const sr = state.services.filter((s) => (s.status === "new" || s.status === "assigned" || s.status === "in_progress") && now - s.createdAt > SLA_MIN * 60000);
    const hk = state.hkTasks.filter((t) => t.status !== "done" && t.due < today);
    return { sr, hk };
  };
  const unanswered = () => state.inbox.filter((t) => t.status !== "resolved" && t.messages.filter((m) => m.dir === "in" || m.dir === "out").slice(-1)[0]?.dir === "in");
  const workload = () => {
    const m = new Map<Dept, number>();
    const add = (d: Dept) => m.set(d, (m.get(d) ?? 0) + 1);
    state.services.filter((s) => !["done", "cancelled"].includes(s.status)).forEach((s) => add(s.dept));
    state.hkTasks.filter((t) => t.status !== "done" && t.due <= today).forEach(() => add("housekeeping"));
    state.maint.filter((x) => x.status !== "resolved").forEach(() => add("maintenance"));
    state.inbox.filter((t) => t.status !== "resolved").forEach((t) => add(t.dept));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const complaints = () => {
    const since = now - 90 * 86400e3;
    const m = new Map<Category, number>();
    state.reviews.filter((r) => r.at >= since).forEach((r) => analyseReview(r).negatives.forEach((c) => m.set(c, (m.get(c) ?? 0) + 1)));
    const inboxComplaints = state.inbox.filter((t) => t.createdAt >= since && t.messages.some((x) => x.dir === "in" && classify(x.text).intents.some((i) => i === "complaint" || i === "maintenance"))).length;
    return { cats: [...m.entries()].sort((a, b) => b[1] - a[1]), inboxComplaints };
  };

  switch (topic) {
    case "occupancy": {
      const o = occ();
      const arr = state.reservations.filter((r) => r.checkIn === today && r.status === "confirmed").length;
      const dep = state.reservations.filter((r) => r.checkOut === today && r.status === "checked_in").length;
      return { ...base, topic, answer: `Այսօր զբաղված է ${o.n} սենյակ ${o.total}-ից։ Սպասվում է ${arr} ժամանում և ${dep} մեկնում։`, figures: [o.f, { label: "Ժամանումներ / մեկնումներ", value: `${arr} / ${dep}`, formula: "checkIn = այսօր (հաստատված) / checkOut = այսօր (ներսում)", source: "reservations" }] };
    }
    case "not_ready": {
      const l = notReady();
      return { ...base, topic, answer: l.length ? `${l.length} սենյակ պատրաստ չէ${l.some((x) => x.arrival) ? `, որից ${l.filter((x) => x.arrival).length}-ում այսօր ժամանում կա` : ""}։` : "Բոլոր սենյակները մաքուր են կամ ստուգված։", items: l.map((x) => `Սենյակ ${x.id} · ${x.status === "dirty" ? "կեղտոտ" : "մաքրվում է"}${x.arrival ? " · այսօր ժամանում" : ""}`), figures: [{ label: "Պատրաստ չէ", value: String(l.length), formula: "hk կարգավիճակ = dirty կամ cleaning", source: "room status board" }], actions: l.filter((x) => x.arrival).slice(0, 1).map((x) => ({ label: `Ստեղծել շտապ առաջադրանք մաքրության ղեկավարին (սենյակ ${x.id})`, task: { title: `Շտապ պատրաստել սենյակ ${x.id} այսօրվա ժամանման համար`, detail: "Ստեղծվել է AI օգնականի առաջարկով, հաստատվել է ղեկավարի կողմից", priority: "high" as Priority, assigneeId: state.staff.find((s) => s.position === "housekeeping_manager")?.id ?? null } })) };
    }
    case "overdue": {
      const o = overdue();
      return { ...base, topic, answer: `${o.sr.length} հյուրի հարցում բաց է ${SLA_MIN} րոպեից ավելի, ${o.hk.length} մաքրության առաջադրանք ժամկետանց է։`, items: [...o.sr.map((s) => `${s.code} · ${SERVICE_META[s.type].staffLabel}${s.roomId ? ` · սենյակ ${s.roomId}` : ""} · ${Math.round((now - s.createdAt) / 60000)} ր`), ...o.hk.map((t) => `Մաքրություն · սենյակ ${t.roomId} · ժամկետ ${t.due}`)].slice(0, 12), figures: [{ label: "Ուշացած հարցումներ", value: String(o.sr.length), formula: `բաց հարցումներ, որոնց տարիքը > ${SLA_MIN} րոպե (ցուցադրական SLA)`, source: "service requests" }, { label: "Ժամկետանց մաքրություն", value: String(o.hk.length), formula: "չավարտված առաջադրանքներ, due < այսօր", source: "housekeeping tasks" }], actions: o.sr.length ? [{ label: "Առաջադրանք ընդունարանի ղեկավարին՝ վերանայել ուշացածները", task: { title: `Վերանայել ${o.sr.length} ուշացած հյուրի հարցում`, detail: o.sr.map((s) => s.code).join(", "), priority: "high", assigneeId: state.staff.find((s) => s.position === "reception_manager")?.id ?? null } }] : [] };
    }
    case "workload": {
      const w = workload();
      return { ...base, topic, answer: w.length ? `Ամենածանրաբեռնվածը՝ ${DEPT_LABEL[w[0][0]]} (${w[0][1]} բաց աշխատանք)։` : "Բաց աշխատանքներ չկան։", items: w.map(([d, n]) => `${DEPT_LABEL[d]} · ${n}`), figures: [{ label: "Բաց աշխատանքներ ըստ բաժնի", value: w.map(([d, n]) => `${DEPT_LABEL[d]} ${n}`).join(", "), formula: "բաց հյուրի հարցումներ + այսօրվա/ժամկետանց մաքրություն + բաց տեխնիկական հայտեր + չլուծված զրույցներ, ըստ բաժնի", source: "services, hkTasks, maint, inbox" }] };
    }
    case "channels": {
      const from = now - 7 * 86400e3;
      const m = new Map<string, number>();
      state.reservations.filter((r) => r.createdAt >= from && !["inquiry", "declined"].includes(r.status)).forEach((r) => m.set(r.source, (m.get(r.source) ?? 0) + 1));
      const l = [...m.entries()].sort((a, b) => b[1] - a[1]);
      return { ...base, topic, answer: `Վերջին 7 օրում ստեղծվել է ${l.reduce((a, x) => a + x[1], 0)} ամրագրում։`, items: l.map(([s, n]) => `${s} · ${n}`), figures: [{ label: "Ամրագրումներ ըստ աղբյուրի (7 օր)", value: l.map(([s, n]) => `${s} ${n}`).join(", ") || "0", formula: "createdAt վերջին 7 օրում, առանց հարցումների և մերժվածների, խմբավորված ըստ source", source: "reservations" }] };
    }
    case "cancellations": {
      const p = periods(today).last30;
      const cur = computeKpis(state, p), prev = computeKpis(state, { from: addDays(p.from, -30), to: p.from, label: "" });
      const d = cur.cancellationRate - prev.cancellationRate;
      return { ...base, topic, answer: `Չեղարկման տոկոսը վերջին 30 օրում՝ ${pct(cur.cancellationRate)}, նախորդ 30 օրում՝ ${pct(prev.cancellationRate)} (${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)} տ.կ.)։ Պատճառների մասին եզրակացություն չեմ անում առանց տվյալների։`, figures: [{ label: "Չեղարկումներ (30 օր)", value: `${cur.cancelled} / ${cur.bookings} = ${pct(cur.cancellationRate)}`, formula: "չեղարկված ÷ ամրագրումներ ժամանումով ժամանակահատվածում (նույնը, ինչ «Վերլուծություն» էջում)", source: "analytics.computeKpis" }, { label: "Նախորդ 30 օր", value: `${prev.cancelled} / ${prev.bookings} = ${pct(prev.cancellationRate)}`, formula: "նույն բանաձևը", source: "analytics.computeKpis" }] };
    }
    case "unanswered": {
      const u = unanswered();
      return { ...base, topic, answer: `${u.length} զրույցում վերջին հաղորդագրությունը հյուրինն է և պատասխան դեռ չկա։`, items: u.map((t) => `${t.contact.name} · ${t.channel} · ${Math.round((now - t.lastInboundAt) / 60000)} ր առաջ${t.priority === "high" || t.priority === "urgent" ? " · բարձր առաջնահերթություն" : ""}`), figures: [{ label: "Չպատասխանված զրույցներ", value: String(u.length), formula: "չլուծված զրույցներ, որոնց վերջին (ոչ ներքին) հաղորդագրությունը մուտքային է", source: "unified inbox" }] };
    }
    case "complaints": {
      const c = complaints();
      return { ...base, topic, answer: c.cats.length ? `Վերջին 90 օրվա կարծիքներում ամենահաճախ բացասական թեման՝ «${CATEGORY_LABEL[c.cats[0][0]]}» (${c.cats[0][1]} անգամ)։` : "Վերջին 90 օրում բացասական թեմաներ չեն հայտնաբերվել։", items: c.cats.map(([k, n]) => `${CATEGORY_LABEL[k]} · ${n}`), figures: [{ label: "Բացասական թեմաներ (90 օր)", value: c.cats.map(([k, n]) => `${CATEGORY_LABEL[k]} ${n}`).join(", ") || "0", formula: "կարծիքների նախադասություններ, որտեղ թեման և բացասական արտահայտությունը համընկնում են (բանալի բառեր)", source: "reviews" }, { label: "Բողոք/տեխնիկական զրույցներ (90 օր)", value: String(c.inboxComplaints), formula: "մուտքային հաղորդագրություններ complaint/maintenance մտադրությամբ", source: "unified inbox" }] };
    }
    case "extras": {
      const from = addDays(today, -30);
      const stays = state.reservations.filter((r) => r.checkIn >= from && r.checkIn < today && ["confirmed", "checked_in", "checked_out"].includes(r.status));
      const m = new Map<string, number>();
      stays.forEach((r) => (r.extras ?? []).forEach((x) => m.set(x.id, (m.get(x.id) ?? 0) + x.price)));
      const rest = state.property.modules.includes("restaurant") ? state.orders.filter((o) => o.status === "completed" && now - o.createdAt < 30 * 86400e3).reduce((a, o) => a + o.total, 0) : 0;
      const l = [...m.entries()].sort((a, b) => b[1] - a[1]);
      return { ...base, topic, answer: `Վերջին 30 օրում լրացուցիչ ծառայություններից՝ ${fmt(l.reduce((a, x) => a + x[1], 0))} ֏${rest ? `, ռեստորանից՝ ${fmt(rest)} ֏` : ""}։`, items: l.map(([k, v]) => `${k} · ${fmt(v)} ֏`), figures: [{ label: "Լրացուցիչ ծառայություններ (30 օր)", value: `${fmt(l.reduce((a, x) => a + x[1], 0))} ֏`, formula: "ամրագրումների extras-ի գումար՝ ժամանումը վերջին 30 օրում", source: "reservations.extras" }, ...(rest ? [{ label: "Ռեստորան (30 օր)", value: `${fmt(rest)} ֏`, formula: "ավարտված պատվերների գումար զեղչից հետո", source: "orders" }] : [])] };
    }
    case "summary": {
      const o = occ(), nr = notReady(), ov = overdue(), un = unanswered(), w = workload();
      const neg = state.reviews.filter((r) => r.rating <= 3 && r.status === "new");
      const conflicts = state.reservations.filter((r) => r.external?.syncState === "conflict");
      const failed = state.syncLog.filter((l) => l.result === "failed");
      const items = [
        `Զբաղվածություն՝ ${o.f.value}`,
        nr.length ? `${nr.length} սենյակ պատրաստ չէ (${nr.filter((x) => x.arrival).length} այսօրվա ժամանումով)` : "Բոլոր սենյակները պատրաստ են",
        un.length ? `${un.length} զրույց սպասում է պատասխանի` : "Բոլոր զրույցները պատասխանված են",
        ov.sr.length ? `${ov.sr.length} հյուրի հարցում ուշանում է (> ${SLA_MIN} ր)` : "Ուշացած հյուրի հարցումներ չկան",
        neg.length ? `${neg.length} նոր բացասական կարծիք առանց պատասխանի` : "Նոր բացասական կարծիքներ չկան",
        conflicts.length || failed.length ? `Ալիքներ՝ ${conflicts.length} կոնֆլիկտ, ${failed.length} ձախողված համաժամեցում` : "Ալիքների համաժամեցումը նորմալ է",
        w.length ? `Ամենածանրաբեռնվածը՝ ${DEPT_LABEL[w[0][0]]} (${w[0][1]})` : "",
      ].filter(Boolean);
      const actions: SuggestedAction[] = [];
      if (neg.length) actions.push({ label: "Առաջադրանք՝ պատասխանել բացասական կարծիքներին", task: { title: `Պատասխանել ${neg.length} բացասական կարծիքի`, detail: "Կարծիքների կենտրոն", priority: "high", assigneeId: gmId } });
      if (un.length) actions.push({ label: "Առաջադրանք՝ փակել չպատասխանված զրույցները", task: { title: `Պատասխանել ${un.length} զրույցի միասնական մուտքում`, detail: un.map((t) => t.contact.name).join(", "), priority: "high", assigneeId: state.staff.find((s) => s.position === "reception_manager")?.id ?? null } });
      return { ...base, topic, answer: "Այսօր ուշադրություն պահանջող հարցեր (միայն փաստեր, առանց ենթադրությունների)․", items, figures: [o.f, { label: "Չպատասխանված զրույցներ", value: String(un.length), formula: "տե՛ս «Ո՞ր հյուրերը պատասխան չեն ստացել»", source: "unified inbox" }, { label: "Նոր բացասական կարծիքներ", value: String(neg.length), formula: "rating ≤ 3 և կարգավիճակ «նոր»", source: "reviews" }], actions };
    }
  }
}
