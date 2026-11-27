/* Deterministic seed for the Hospitality OS modules (accounts, loyalty, restaurant, services, staff learning, messages). */
import { addDays, atTime } from "./dates.ts";
import { LOYALTY, MENU_CATEGORIES, MENU_ITEMS, PROPERTY, REWARDS, SOPS, TABLES, TRAINING, SERVICE_META } from "./hospitality-data.ts";
import type { Account, Campaign, Channel, Enrollment, Guest, HospitalityState, LedgerEntry, Msg, Order, OrderStatus, Reservation, ServiceRequest, ServiceType, Staff, Voucher } from "./types.ts";

export const DEMO_ACCOUNTS = [
  { id: "acc-anna", guestId: "g-anna", email: "anna@example.com", first: "Աննա", last: "Մելքոնյան", lang: "hy" as const, country: "Հայաստան", stays: 4 },
  { id: "acc-james", guestId: "g-james", email: "james@example.com", first: "James", last: "Carter", lang: "en" as const, country: "ԱՄՆ", stays: 9 },
  { id: "acc-olga", guestId: "g-olga", email: "olga@example.com", first: "Ольга", last: "Семёнова", lang: "ru" as const, country: "Ռուսաստան", stays: 2 },
];

export const earnFor = (amount: number) => Math.floor(amount / 1000) * LOYALTY.earnPer1000;

export function hospitalitySeed(baseDate: string, r: () => number, guests: Guest[], reservations: Reservation[], staff: Staff[]): HospitalityState {
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const between = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const hm = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  /* demo guest accounts with real (seeded) stay history */
  const past = reservations.filter((x) => x.status === "checked_out" && x.checkOut < baseDate).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  let cursor = 0;
  for (const d of DEMO_ACCOUNTS) {
    guests.unshift({ id: d.guestId, firstName: d.first, lastName: d.last, phone: d.id === "acc-james" ? "+000 555 0101" : d.id === "acc-anna" ? "+374 00 555 101" : "+7 900 000 55 01", email: d.email, lang: d.lang, country: d.country, tags: d.stays >= 2 ? ["Կրկնվող հյուր"] : [], preferences: d.id === "acc-james" ? ["Բարձր հարկ", "Լրացուցիչ բարձ"] : d.id === "acc-anna" ? ["Հանգիստ սենյակ"] : [], notes: [] });
    for (let k = 0; k < d.stays && cursor < past.length; k++) { past[cursor].guestId = d.guestId; past[cursor].source = k % 2 ? "website" : "phone"; cursor += Math.max(1, Math.floor(past.length / 14)); }
  }
  guests.find((g) => g.id === "g-james")!.tags.push("VIP");

  const accounts: Account[] = DEMO_ACCOUNTS.map((d, i) => ({ id: d.id, guestId: d.guestId, email: d.email, createdAt: atTime(addDays(baseDate, -170 + i * 20), "12:00"), consent: { marketing: i !== 2, analytics: true }, favourites: i === 1 ? ["steak", "wine", "spa"] : ["cappuccino"] }));
  // a few more members from returning guests
  const repeaters = guests.filter((g) => g.tags.includes("Կրկնվող հյուր") && !g.id.startsWith("g-a") && !g.id.startsWith("g-j") && !g.id.startsWith("g-o")).slice(0, 34);
  repeaters.forEach((g, i) => accounts.push({ id: `acc-${g.id}`, guestId: g.id, email: g.email, createdAt: atTime(addDays(baseDate, -160 + (i % 120)), "10:00"), consent: { marketing: r() < 0.7, analytics: true }, favourites: [] }));
  const member = new Map(accounts.map((a) => [a.guestId, a]));

  /* loyalty ledger: welcome bonus + points on completed stays */
  const ledger: LedgerEntry[] = [];
  let l = 0;
  for (const a of accounts) ledger.push({ id: `l${++l}`, guestId: a.guestId, at: a.createdAt, points: LOYALTY.welcomeBonus, reason: "Ողջույնի բոնուս" });
  for (const res of reservations) {
    if (res.status !== "checked_out" || !member.has(res.guestId)) continue;
    const at = atTime(res.checkOut, "12:00");
    if (at < member.get(res.guestId)!.createdAt) continue;
    ledger.push({ id: `l${++l}`, guestId: res.guestId, at, points: earnFor(res.total), reason: `Կեցություն ${res.code}`, ref: res.id });
  }
  const vouchers: Voucher[] = [
    { id: "v-james-1", guestId: "g-james", rewardId: "rw-dinner", status: "used", createdAt: atTime(addDays(baseDate, -40), "19:00"), ref: "order" },
    { id: "v-anna-1", guestId: "g-anna", rewardId: "rw-dinner", status: "active", createdAt: atTime(addDays(baseDate, -12), "18:00") },
  ];
  ledger.push({ id: `l${++l}`, guestId: "g-james", at: vouchers[0].createdAt, points: -1000, reason: "Նվեր՝ 10 000 ֏ ռեստորանում", ref: vouchers[0].id });
  ledger.push({ id: `l${++l}`, guestId: "g-anna", at: vouchers[1].createdAt, points: -1000, reason: "Նվեր՝ 10 000 ֏ ռեստորանում", ref: vouchers[1].id });

  const campaigns: Campaign[] = [
    { id: "cp-winter", title: { hy: "Ձմեռային առաջարկ անդամներին", ru: "Зимнее предложение для участников", en: "Winter offer for members" }, text: { hy: "Լրացուցիչ 5% զեղչ ուղիղ ամրագրման համար Ոսկի և բարձր մակարդակի անդամներին", ru: "Дополнительные 5% на прямые брони для уровней Золото и выше", en: "An extra 5% off direct bookings for Gold members and above" }, tierIds: ["gold", "platinum", "vip"], discountPct: 5, appliesTo: "stay", active: true, createdAt: atTime(addDays(baseDate, -20), "10:00"), uses: 7 },
    { id: "cp-dinner", title: { hy: "Ընթրիք բուխարու մոտ", ru: "Ужин у камина", en: "Fireside dinner" }, text: { hy: "10% զեղչ ռեստորանում բոլոր անդամներին", ru: "Скидка 10% в ресторане для всех участников", en: "10% off at the restaurant for all members" }, tierIds: LOYALTY.tiers.map((t) => t.id), discountPct: 10, appliesTo: "order", active: true, createdAt: atTime(addDays(baseDate, -9), "10:00"), uses: 23 },
  ];

  /* reviews (guest satisfaction) */
  for (const res of reservations) if (res.status === "checked_out" && r() < 0.55) {
    const sc = r() < 0.62 ? 5 : r() < 0.8 ? 4 : r() < 0.93 ? 3 : 2;
    res.review = { score: sc, text: sc >= 4 ? pick(["Հիանալի սպասարկում", "Մաքուր և հանգիստ", "Շատ համեղ նախաճաշ", "Կվերադառնանք"]) : pick(["Սենյակը ուշ պատրաստվեց", "Wi‑Fi-ը թույլ էր"]) };
  }

  /* restaurant orders (45 days) */
  const orders: Order[] = [];
  const inHouseRooms = reservations.filter((x) => x.status === "checked_in" && x.roomId).map((x) => x.roomId!);
  let o = 0;
  for (let day = -45; day <= 0; day++) {
    const date = addDays(baseDate, day);
    const n = between(8, 15) + (day === 0 ? -6 : 0);
    for (let k = 0; k < n; k++) {
      const lunch = r() < 0.45;
      const h = lunch ? between(12, 15) : between(18, 22);
      const createdAt = atTime(date, hm(h, between(0, 59)));
      if (day === 0 && createdAt > atTime(baseDate, "11:30")) continue;
      const type = r() < 0.55 ? "dine_in" : r() < 0.7 ? "room_service" : "takeaway";
      const items = Array.from({ length: between(1, 4) }, () => { const it = pick(MENU_ITEMS); return { itemId: it.id, qty: r() < 0.8 ? 1 : 2, price: it.price, options: [] as string[] }; });
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const g = r() < 0.35 ? pick(guests) : null;
      const x = r();
      const final: OrderStatus = x < 0.04 ? "cancelled" : x < 0.07 ? "rejected" : "completed";
      const prep = Math.max(...items.map((i) => MENU_ITEMS.find((m) => m.id === i.itemId)!.prepMin));
      const t1 = createdAt + between(1, 4) * 60000, t2 = t1 + between(1, 3) * 60000, t3 = t2 + (prep + between(-3, 8)) * 60000, t4 = t3 + between(4, 14) * 60000;
      const history: Order["history"] = [{ at: createdAt, status: "submitted", by: "Հյուր" }];
      if (final === "rejected") history.push({ at: t1, status: "rejected", by: "Խոհանոց" });
      else if (final === "cancelled") history.push({ at: t1, status: "cancelled", by: "Հյուր" });
      else history.push({ at: t1, status: "accepted", by: "Խոհանոց" }, { at: t2, status: "preparing", by: "Խոհանոց" }, { at: t3, status: "ready", by: "Խոհանոց" }, ...(type === "room_service" ? [{ at: t3 + 60000, status: "out_for_delivery" as OrderStatus, by: "Մատուցող" }] : []), { at: t4, status: "completed", by: "Մատուցող" });
      orders.push({ id: `o${++o}`, code: `R-${String(3000 + o)}`, type, roomId: type === "room_service" ? (pick(inHouseRooms.length ? inHouseRooms : ["204"])) : undefined, tableId: type === "dine_in" ? pick(TABLES).id : undefined, guestId: g?.id, guestName: g ? g.firstName : "Հյուր", items, subtotal, discount: 0, total: subtotal, note: "", status: final, createdAt, history, reason: final === "rejected" ? "Բաղադրիչը վերջացել է" : undefined });
    }
  }
  // live orders this morning
  const live: [OrderStatus, "room_service" | "dine_in", string][] = [["preparing", "room_service", "08:58"], ["accepted", "dine_in", "09:12"], ["ready", "dine_in", "09:05"]];
  for (const [st, type, t] of live) {
    const createdAt = atTime(baseDate, t);
    const it = type === "room_service" ? [MENU_ITEMS[13], MENU_ITEMS[10]] : [MENU_ITEMS[0], MENU_ITEMS[13]];
    const items = it.map((m) => ({ itemId: m.id, qty: 1, price: m.price, options: [] }));
    const subtotal = items.reduce((s, i) => s + i.price, 0);
    const seq: OrderStatus[] = ["submitted", "accepted", "preparing", "ready"];
    const history = seq.slice(0, seq.indexOf(st) + 1).map((s, i) => ({ at: createdAt + i * 120000, status: s, by: i ? "Խոհանոց" : "Հյուր" }));
    orders.push({ id: `o${++o}`, code: `R-${3000 + o}`, type, roomId: type === "room_service" ? inHouseRooms[0] ?? "204" : undefined, tableId: type === "dine_in" ? `T${between(1, 8)}` : undefined, guestName: "Հյուր", items, subtotal, discount: 0, total: subtotal, note: "", status: st, createdAt, history });
  }

  /* guest service requests (20 days) */
  const services: ServiceRequest[] = [];
  const types: ServiceType[] = ["towels", "towels", "cleaning", "toiletries", "maintenance", "laundry", "wakeup", "luggage", "spa", "reception", "issue"];
  let sr = 0;
  const staffOf = (dept: string) => staff.filter((s) => s.dept === dept);
  for (let day = -20; day <= 0; day++) {
    const date = addDays(baseDate, day);
    for (let k = 0; k < between(3, 8); k++) {
      const type = pick(types);
      const meta = SERVICE_META[type];
      const createdAt = atTime(date, hm(between(7, 22), between(0, 59)));
      if (day === 0 && createdAt > atTime(baseDate, "09:00")) continue;
      const assignee = pick(staffOf(meta.dept).length ? staffOf(meta.dept) : staffOf("reception"));
      const a1 = createdAt + between(2, 15) * 60000, a2 = a1 + between(2, 10) * 60000, a3 = a2 + between(5, 40) * 60000;
      services.push({ id: `sr${++sr}`, code: `S-${1000 + sr}`, type, dept: meta.dept, roomId: pick(["101", "103", "202", "204", "206", "301", "305", "C1"]), note: "", priority: meta.priority, status: "done", assigneeId: assignee.id, createdAt,
        history: [{ at: createdAt, text: "Հարցումը ստացվեց QR-ով", by: "Հյուր" }, { at: a1, text: `Նշանակվեց՝ ${assignee.name}`, by: "Համակարգ" }, { at: a2, text: "Ընթացքում է", by: assignee.name }, { at: a3, text: "Կատարված է", by: assignee.name }] });
    }
  }
  const room0 = inHouseRooms[1] ?? "203";
  services.push({ id: `sr${++sr}`, code: `S-${1000 + sr}`, type: "toiletries", dept: "housekeeping", roomId: room0, note: "Լրացուցիչ ատամի խոզանակ", priority: "low", status: "new", assigneeId: null, createdAt: atTime(baseDate, "08:41"), history: [{ at: atTime(baseDate, "08:41"), text: "Հարցումը ստացվեց QR-ով", by: "Հյուր" }] });
  services.push({ id: `sr${++sr}`, code: `S-${1000 + sr}`, type: "maintenance", dept: "maintenance", roomId: inHouseRooms[2] ?? "105", note: "Լոգասենյակի լամպը չի վառվում", priority: "high", status: "in_progress", assigneeId: "s-armen", createdAt: atTime(baseDate, "08:15"), history: [{ at: atTime(baseDate, "08:15"), text: "Հարցումը ստացվեց QR-ով", by: "Հյուր" }, { at: atTime(baseDate, "08:20"), text: "Նշանակվեց՝ Արմեն Ղազարյան", by: "Անահիտ Գրիգորյան" }] });

  /* onboarding / training */
  const enrollments: Enrollment[] = [];
  let en = 0;
  for (const s of staff) {
    for (const m of TRAINING.filter((t) => t.positions === "all" || t.positions.includes(s.position))) {
      const isNew = s.id === "s-ani" || s.id === "s-sona";
      const done = isNew ? m.steps.slice(0, s.id === "s-ani" ? Math.min(2, m.steps.length) : m.steps.length).map((x) => x.id) : m.steps.map((x) => x.id);
      const scores = Object.fromEntries(m.steps.filter((x) => x.kind === "quiz" && done.includes(x.id)).map((x) => [x.id, 100]));
      enrollments.push({ id: `en${++en}`, employeeId: s.id, moduleId: m.id, done, scores, status: s.id === "s-ani" ? "in_progress" : s.id === "s-sona" ? "submitted" : "approved", assignedAt: atTime(s.startedAt > baseDate ? baseDate : s.startedAt, "09:00") });
    }
  }

  /* internal communication */
  const channels: Channel[] = [
    { id: "ch-notice", kind: "notice", name: "Հայտարարություններ" },
    ...(["reception", "housekeeping", "kitchen", "restaurant", "maintenance", "spa", "management"] as const).map((d) => ({ id: `ch-${d}`, kind: "department" as const, name: { reception: "Ընդունարան", housekeeping: "Մաքրություն", kitchen: "Խոհանոց", restaurant: "Ռեստորան", maintenance: "Տեխնիկական", spa: "Սպա", management: "Ղեկավարություն" }[d], dept: d })),
    { id: "dm-s-anahit-s-gohar", kind: "direct", name: "", members: ["s-gohar", "s-anahit"] },
  ];
  const ago = (d: number, t: string) => atTime(addDays(baseDate, d), t);
  const messages: Msg[] = [
    { id: "m1", channelId: "ch-notice", authorId: "s-narek", text: "Հարգելի գործընկերներ, դեկտեմբերի 30-ից սկսվում է Ամանորի սեզոնը։ Բոլոր հերթափոխերը հաստատված են, խնդրում եմ ստուգել Ձեր գրաֆիկը։", at: ago(-1, "10:00"), urgent: false },
    { id: "m2", channelId: "ch-reception", authorId: "s-davit", text: "Հերթափոխի փոխանցում. 2 ուշ ժամանում (23:00-ից հետո), սենյակ 304-ը վաճառքից հանված է ջեռուցման պատճառով։", at: ago(-1, "22:05"), handover: true },
    { id: "m3", channelId: "ch-reception", authorId: "s-gohar", text: "Ընդունված է, շնորհակալություն։ Առավոտյան կզանգեմ ուշ ժամանողներին։", at: ago(0, "08:07") },
    { id: "m4", channelId: "ch-housekeeping", authorId: "s-anahit", text: "Այսօր 4 մեկնում և 9 ժամանում կա։ Լիլիթ՝ 1-ին հարկ, Մարիամ՝ 2-րդ հարկ, ես՝ 3-րդ հարկ և շալեներ։", at: ago(0, "08:10") },
    { id: "m5", channelId: "ch-housekeeping", authorId: "s-lilit", text: "Լավ, սկսում եմ 103-ից։", at: ago(0, "08:14") },
    { id: "m6", channelId: "ch-kitchen", authorId: "s-hayk", text: "Սաղմոնը վերջանում է, երեկոյան մատակարարում կլինի։", at: ago(0, "09:02") },
    { id: "m7", channelId: "ch-maintenance", authorId: "s-armen", text: "304-ի փականը կժամանի այսօր կեսօրին։", at: ago(0, "09:11") },
    { id: "m8", channelId: "dm-s-anahit-s-gohar", authorId: "s-gohar", text: "Անահիտ, 206-ում VIP հյուր է գալիս վաղը, կարո՞ղ եք VIP պատրաստում անել։", at: ago(0, "09:20") },
    { id: "m9", channelId: "dm-s-anahit-s-gohar", authorId: "s-anahit", text: "Իհարկե, կնշանակեմ Մարիամին և կստուգեմ ինքս։", at: ago(0, "09:24") },
    { id: "m10", channelId: "ch-management", authorId: "s-tatev", text: "Նոյեմբերին սենյակային սպասարկումն աճել է. առաջարկում եմ գիշերային մենյու ավելացնել։", at: ago(-2, "17:30") },
  ];

  return {
    property: PROPERTY, accounts, loyalty: structuredClone(LOYALTY), ledger, rewards: REWARDS, vouchers, campaigns,
    menu: { categories: MENU_CATEGORIES, items: MENU_ITEMS.map((m) => ({ ...m })) }, tables: TABLES, orders, services,
    training: TRAINING.map((m) => ({ ...m })), enrollments, sops: SOPS, channels, messages,
  };
}
