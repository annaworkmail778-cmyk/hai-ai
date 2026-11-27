/*
 * Deterministic demo data generator. Given the session's base date it always produces the
 * same hotel history, so every device (guest phone, laptop, presenter) computes identical state.
 * All people, phone numbers (+374 00 …, +7 900 000 …) and e-mails (@example.com) are fictional.
 */
import { addDays, atTime, nextFriday, weekday } from "./dates.ts";
import { DEFAULT_KB, ROOMS, ROOM_TYPES, STAFF } from "./hotel-data.ts";
import { quote, seasonOf } from "./pricing.ts";
import { hospitalitySeed } from "./seed-hospitality.ts";
import type {
  ActivityItem, ChatMsg, Conversation, Guest, HkStatus, HkTask, HotelState, Lang, MaintRequest,
  OutboxItem, Reservation, RoomTypeId, Source, StaffTask, WorkflowId,
} from "./types.ts";

export function rng(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HY_FIRST = ["Արամ", "Աննա", "Լևոն", "Մարինե", "Տիգրան", "Նարինե", "Գևորգ", "Սոնա", "Հայկ", "Լուսինե", "Արտակ", "Քրիստինե", "Վահե", "Էլեն", "Սամվել", "Մերի", "Ռուբեն", "Զարուհի", "Կարեն", "Աստղիկ"];
const HY_LAST = ["Մանուկյան", "Գասպարյան", "Ավագյան", "Մելքոնյան", "Բաղդասարյան", "Հարությունյան", "Խաչատրյան", "Սիմոնյան", "Ներսիսյան", "Մարտիրոսյան", "Ստեփանյան", "Վարդանյան"];
const RU_NAMES = ["Алексей Морозов", "Мария Волкова", "Дмитрий Соколов", "Екатерина Лебедева", "Сергей Новиков", "Анна Козлова", "Иван Павлов", "Ольга Семёнова", "Михаил Егоров", "Наталья Орлова", "Артём Белов", "Юлия Зайцева"];
const INTL: [string, string][] = [["Emma Laurent", "Ֆրանսիա"], ["James Carter", "ԱՄՆ"], ["Sophie Müller", "Գերմանիա"], ["Daniel Haddad", "ԱՄԷ"], ["Olivia Bennett", "Մեծ Բրիտանիա"], ["Lucas Moreau", "Ֆրանսիա"], ["Nino Beridze", "Վրաստան"], ["Giorgi Kapanadze", "Վրաստան"], ["Sara Rahimi", "Իրան"], ["Michael Brooks", "ԱՄՆ"]];

const PREFS = ["Բարձր հարկ", "Հանգիստ սենյակ", "Լրացուցիչ բարձ", "Առանց գլյուտենի նախաճաշ", "Ուշ ժամանում", "Մանկական մահճակալ", "Տեսարան դեպի լեռներ", "Վեգետարյանական սնունդ"];
const TAGS = ["Կրկնվող հյուր", "VIP", "Ընտանիք", "Դահուկորդ", "Կորպորատիվ"];

export function scenarioDates(baseDate: string) {
  const checkIn = nextFriday(baseDate, 6);
  return { checkIn, checkOut: addDays(checkIn, 2) };
}

export function createSeed(baseDate: string): HotelState {
  const r = rng("pine-ridge:" + baseDate);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const between = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));

  /* ---------- guests ---------- */
  const guests: Guest[] = [];
  const digits = (n: number) => Array.from({ length: n }, () => between(0, 9)).join("");
  for (let i = 0; i < 170; i++) {
    const kind = r();
    let g: Guest;
    if (kind < 0.55) {
      const first = pick(HY_FIRST), last = pick(HY_LAST);
      g = { id: `g${i}`, firstName: first, lastName: last, phone: `+374 00 ${digits(3)} ${digits(3)}`, email: `guest${i}@example.com`, lang: "hy", country: "Հայաստան", tags: [], preferences: [], notes: [] };
    } else if (kind < 0.8) {
      const [first, last] = pick(RU_NAMES).split(" ");
      g = { id: `g${i}`, firstName: first, lastName: last, phone: `+7 900 000 ${digits(2)} ${digits(2)}`, email: `guest${i}@example.com`, lang: "ru", country: "Ռուսաստան", tags: [], preferences: [], notes: [] };
    } else {
      const [full, country] = pick(INTL);
      const [first, last] = full.split(" ");
      g = { id: `g${i}`, firstName: first, lastName: last, phone: `+000 ${digits(3)} ${digits(4)}`, email: `guest${i}@example.com`, lang: "en", country, tags: [], preferences: [], notes: [] };
    }
    if (r() < 0.35) g.preferences.push(pick(PREFS));
    if (r() < 0.15) g.preferences.push(pick(PREFS));
    guests.push(g);
  }
  const guestPick = () => guests[Math.floor(Math.pow(r(), 1.6) * guests.length)]; // some guests return more often

  /* ---------- blocked windows keep rooms free for the scripted scenarios ---------- */
  const sc = scenarioDates(baseDate);
  const blocks: Record<string, [string, string][]> = {
    "305": [[addDays(sc.checkIn, -1), addDays(sc.checkOut, 1)]],
    "306": [[addDays(sc.checkIn, -1), addDays(sc.checkOut, 1)]],
    "205": [[addDays(sc.checkIn, -1), addDays(sc.checkOut, 1)]],
    "206": [[addDays(baseDate, 8), addDays(baseDate, 12)]],
    "104": [[addDays(baseDate, 2), addDays(baseDate, 6)]],
    "303": [[addDays(baseDate, 19), addDays(baseDate, 24)]],
    "C2": [[addDays(baseDate, 0), addDays(baseDate, 3)]],
    "107": [[addDays(baseDate, 0), addDays(baseDate, 1)]],
    "203": [[addDays(baseDate, 0), addDays(baseDate, 1)]],
  };
  const blocked = (room: string, d: string) => (blocks[room] ?? []).some(([a, b]) => d >= a && d < b);

  const sourceFor = (typeId: RoomTypeId): Source => {
    const x = r();
    if (typeId === "chalet" && x < 0.25) return "airbnb";
    if (x < 0.34) return "booking";
    if (x < 0.52) return "website";
    if (x < 0.65) return "phone";
    if (x < 0.75) return "instagram";
    if (x < 0.82) return "airbnb";
    if (x < 0.96) return "assistant";
    return "walkin";
  };

  const reservations: Reservation[] = [];
  let n = 0;
  const start = addDays(baseDate, -100);
  const end = addDays(baseDate, 75);

  for (const room of ROOMS) {
    let d = start;
    while (d < end) {
      if (blocked(room.id, d)) { d = addDays(d, 1); continue; }
      const s = seasonOf(d);
      const wd = weekday(d);
      let p = s === "regular" ? 0.36 : s === "ski" ? 0.58 : 0.8;
      if (wd === 5 || wd === 6) p += 0.25;
      if (room.typeId === "chalet") p -= 0.08;
      if (d > addDays(baseDate, 30)) p -= 0.18; // fewer bookings far ahead
      if (r() < p) {
        let los = pick([1, 2, 2, 2, 3, 3, 3, 4, 5, 7]);
        let out = addDays(d, los);
        for (let k = 1; k < los; k++) if (blocked(room.id, addDays(d, k))) { out = addDays(d, k); los = k; break; }
        if (out > end) out = end;
        const g = guestPick();
        const typeId = room.typeId;
        const t = ROOM_TYPES.find((x) => x.id === typeId)!;
        const adults = Math.min(t.capacity.adults, pick([1, 2, 2, 2, 2, 3, 4]));
        const children = t.capacity.children + t.capacity.adults - adults > 0 && r() < 0.3 ? 1 : 0;
        const source = sourceFor(typeId);
        const lead = Math.floor(Math.pow(r(), 1.7) * 45) + 1;
        const createdDay = addDays(d, -lead) > addDays(baseDate, 0) ? addDays(baseDate, 0) : addDays(d, -lead);
        const hour = r() < 0.2 ? pick([22, 23, 23, 0, 1, 6, 7]) : between(8, 21);
        const createdAt = atTime(createdDay, `${String(hour).padStart(2, "0")}:${String(between(0, 59)).padStart(2, "0")}`);
        const q = quote(typeId, d, out);
        n++;
        reservations.push({
          id: `r${n}`, code: `PR-${String(24100 + n)}`, guestId: g.id, typeId, roomId: room.id, checkIn: d, checkOut: out,
          adults, children, source, status: "confirmed", total: q.total, createdAt, afterHours: hour >= 22 || hour < 8,
          requests: r() < 0.18 ? pick(["Ուշ ժամանում՝ մոտ 22:00", "Մանկական մահճակալ", "Տորթ ծննդյան օրվա համար", "Բարձր հարկ, եթե հնարավոր է", "Դահուկների պահեստ"]) : "",
          history: [],
        });
        d = out;
        if (r() < 0.35) d = addDays(d, between(1, 3));
      } else d = addDays(d, 1);
    }
  }

  /* statuses relative to "today" */
  for (const res of reservations) {
    const x = r();
    if (res.checkOut < baseDate) {
      res.status = x < 0.06 ? "cancelled" : x < 0.075 ? "no_show" : "checked_out";
    } else if (res.checkIn > baseDate) {
      res.status = x < 0.05 ? "cancelled" : "confirmed";
    } else if (res.checkOut === baseDate) {
      res.status = x < 0.45 ? "checked_out" : "checked_in"; // departures today
    } else if (res.checkIn === baseDate) {
      res.status = x < 0.3 ? "checked_in" : "confirmed"; // arrivals today
    } else res.status = "checked_in";
    res.history.push({ at: res.createdAt, text: "Ամրագրումը ստեղծվեց", by: res.source === "booking" || res.source === "airbnb" ? "Արտաքին կայք" : "Ընդունարան" });
  }
  // Two arrivals today are forced to stay "confirmed" so the presenter can check them in.
  reservations.filter((x) => x.checkIn === baseDate && x.status !== "cancelled").slice(0, 2).forEach((x) => (x.status = "confirmed"));

  /* lost requests (declined / unanswered) for inquiry→booking conversion analytics */
  const directBooked = reservations.filter((x) => ["website", "assistant", "phone", "instagram"].includes(x.source) && x.checkIn < baseDate);
  const lost = Math.round(directBooked.length * 0.55);
  for (let i = 0; i < lost; i++) {
    const base = pick(directBooked);
    n++;
    const hour = r() < 0.3 ? pick([22, 23, 0, 1, 7]) : between(8, 21);
    reservations.push({
      ...base, id: `r${n}`, code: `PR-${24100 + n}`, guestId: guestPick().id, roomId: null, status: "declined",
      createdAt: atTime(addDays(base.checkIn, -between(1, 20)), `${String(hour).padStart(2, "0")}:${String(between(0, 59)).padStart(2, "0")}`),
      afterHours: hour >= 22 || hour < 8,
      declineReason: pick(["Ազատ սենյակ չկար նշված օրերին", "Հյուրը չպատասխանեց", "Հյուրն ընտրեց այլ ամսաթվեր", "Պատասխանը ուշացավ"]),
      history: [], requests: "",
    });
  }

  /* pending inquiries waiting for staff */
  const pending: [Source, RoomTypeId, number, number, number, string, number, number][] = [
    ["website", "deluxe", 9, 11, -1, "21:14", 2, 0],
    ["phone", "classic", 3, 5, 0, "09:12", 2, 0],
    ["instagram", "junior", 20, 23, -1, "23:48", 2, 1],
  ];
  for (const [source, typeId, a, b, cd, hm, adults, children] of pending) {
    n++;
    const g = guests[between(0, 60)];
    const checkIn = addDays(baseDate, a), checkOut = addDays(baseDate, b);
    const createdAt = atTime(addDays(baseDate, cd), hm);
    reservations.push({
      id: `r${n}`, code: `PR-${24100 + n}`, guestId: g.id, typeId, roomId: null, checkIn, checkOut, adults, children, source,
      status: "inquiry", total: quote(typeId, checkIn, checkOut).total, createdAt, afterHours: hm >= "22:00" || hm < "08:00",
      requests: source === "instagram" ? "Ունե՞ք վառարանով սենյակ։ Կժամանենք ուշ երեկոյան" : "", history: [{ at: createdAt, text: "Հարցումը ստացվեց", by: "Համակարգ" }],
    });
  }

  /* repeat-guest tags */
  const stays = new Map<string, number>();
  reservations.filter((x) => x.status === "checked_out").forEach((x) => stays.set(x.guestId, (stays.get(x.guestId) ?? 0) + 1));
  for (const g of guests) {
    if ((stays.get(g.id) ?? 0) >= 2) g.tags.push("Կրկնվող հյուր");
    if (r() < 0.06) g.tags.push(pick(TAGS.slice(1)));
  }
  guests[3].notes.push({ at: atTime(addDays(baseDate, -30), "12:00"), author: "Գոհար Սարգսյան", text: "Նախընտրում է հանգիստ սենյակ, սիրում է կանաչ թեյ։" });

  /* ---------- housekeeping ---------- */
  const hk: Record<string, HkStatus> = Object.fromEntries(ROOMS.map((x) => [x.id, "inspected" as HkStatus]));
  const hkTasks: HkTask[] = [];
  const housekeepers = STAFF.filter((s) => s.role === "housekeeping").map((s) => s.id);
  let t = 0;
  const now = atTime(baseDate, "09:30");
  for (const res of reservations) {
    if (!res.roomId || res.status === "cancelled" || res.status === "declined") continue;
    if (res.checkOut === baseDate) {
      const done = res.status === "checked_out" && r() < 0.4;
      hk[res.roomId] = res.status === "checked_out" ? (done ? "clean" : "dirty") : hk[res.roomId];
      if (res.status === "checked_out") {
        hkTasks.push({ id: `hk${++t}`, roomId: res.roomId, kind: "checkout", status: done ? "done" : r() < 0.4 ? "in_progress" : "todo", priority: "high", assigneeId: housekeepers[t % 3], due: baseDate, dueTime: "13:00", reservationId: res.id, createdAt: now, auto: true });
        if (!done && hkTasks[hkTasks.length - 1].status === "in_progress") hk[res.roomId] = "cleaning";
      }
    }
    if (res.checkIn === baseDate && res.status === "confirmed") {
      hkTasks.push({ id: `hk${++t}`, roomId: res.roomId, kind: "arrival_prep", status: r() < 0.5 ? "done" : "todo", priority: "high", assigneeId: housekeepers[t % 3], due: baseDate, dueTime: "14:00", reservationId: res.id, createdAt: atTime(addDays(baseDate, -1), "09:00"), auto: true });
    }
    if (res.checkIn === addDays(baseDate, 1) && res.status === "confirmed") {
      hkTasks.push({ id: `hk${++t}`, roomId: res.roomId, kind: "arrival_prep", status: "todo", priority: "normal", assigneeId: housekeepers[t % 3], due: addDays(baseDate, 1), dueTime: "14:00", reservationId: res.id, createdAt: atTime(baseDate, "08:00"), auto: true });
    }
    if (res.status === "checked_in" && res.checkIn < baseDate && res.checkOut > baseDate && r() < 0.5) {
      hkTasks.push({ id: `hk${++t}`, roomId: res.roomId, kind: "stayover", status: r() < 0.5 ? "done" : "todo", priority: "low", assigneeId: housekeepers[t % 3], due: baseDate, dueTime: "16:00", reservationId: res.id, createdAt: atTime(baseDate, "08:00"), auto: true });
    }
  }

  /* ---------- maintenance ---------- */
  const ago = (days: number, hm: string) => atTime(addDays(baseDate, -days), hm);
  const maint: MaintRequest[] = [
    { id: "m1", roomId: "304", area: "Սենյակ", title: "Ջեռուցումը չի աշխատում", description: "Ռադիատորը սառն է, հյուրը տեղափոխվել է 302։ Անհրաժեշտ է փոխել փականը։", priority: "urgent", status: "in_progress", assigneeId: "s-armen", createdAt: ago(1, "19:40"), outOfOrder: true, log: [{ at: ago(1, "19:40"), text: "Հայտը ստեղծվեց", by: "Դավիթ Պետրոսյան" }, { at: ago(0, "09:10"), text: "Պահեստամասը պատվիրված է", by: "Արմեն Ղազարյան" }] },
    { id: "m2", roomId: "207", area: "Լոգասենյակ", title: "Ցնցուղի ջուրը դանդաղ է հոսում", description: "Մաքրել արտահոսքը։", priority: "normal", status: "open", assigneeId: null, createdAt: ago(0, "08:25"), outOfOrder: false, log: [{ at: ago(0, "08:25"), text: "Հայտը ստեղծվեց", by: "Անահիտ Գրիգորյան" }] },
    { id: "m3", roomId: "C2", area: "Սաունա", title: "Սաունայի տաքացուցիչի ստուգում", description: "Պլանային ստուգում նախքան հաջորդ հյուրերի ժամանումը։", priority: "high", status: "open", assigneeId: "s-armen", createdAt: ago(0, "10:00"), outOfOrder: false, log: [{ at: ago(0, "10:00"), text: "Հայտը ստեղծվեց", by: "Նարեկ Հովհաննիսյան" }] },
    { id: "m4", roomId: null, area: "Ընդունարան", title: "Լամպը թարթում է", description: "Մուտքի մոտ առաստաղի լամպ։", priority: "low", status: "open", assigneeId: null, createdAt: ago(2, "15:30"), outOfOrder: false, log: [{ at: ago(2, "15:30"), text: "Հայտը ստեղծվեց", by: "Գոհար Սարգսյան" }] },
    { id: "m5", roomId: "205", area: "Պատշգամբ", title: "Պատշգամբի դուռը չի փակվում", description: "Կարգավորել ծխնիները։", priority: "high", status: "resolved", assigneeId: "s-armen", createdAt: ago(3, "11:00"), resolvedAt: ago(2, "16:20"), outOfOrder: false, log: [{ at: ago(3, "11:00"), text: "Հայտը ստեղծվեց", by: "Լիլիթ Ավետիսյան" }, { at: ago(2, "16:20"), text: "Ավարտված է", by: "Արմեն Ղազարյան" }] },
    { id: "m6", roomId: "102", area: "Սենյակ", title: "Հեռուստացույցի հեռակառավարման վահանակ", description: "Փոխել մարտկոցները։", priority: "low", status: "resolved", assigneeId: "s-armen", createdAt: ago(5, "18:00"), resolvedAt: ago(5, "18:40"), outOfOrder: false, log: [{ at: ago(5, "18:00"), text: "Հայտը ստեղծվեց", by: "Դավիթ Պետրոսյան" }, { at: ago(5, "18:40"), text: "Ավարտված է", by: "Արմեն Ղազարյան" }] },
  ];

  /* ---------- staff tasks ---------- */
  const staffTasks: StaffTask[] = [
    { id: "st1", title: "Պատրաստել Ամանորի ընթրիքի մենյուն և գները", assigneeId: "s-narek", priority: "high", due: addDays(baseDate, 2), status: "in_progress", createdAt: ago(3, "10:00"), origin: "manual" },
    { id: "st2", title: "Պատվիրել վառելափայտ շալեների համար", assigneeId: "s-gohar", priority: "normal", due: addDays(baseDate, 1), status: "todo", createdAt: ago(1, "12:00"), origin: "manual" },
    { id: "st3", title: "Ստուգել ճոպանուղու տրանսֆերի ժամանակացույցը", assigneeId: "s-davit", priority: "normal", due: baseDate, status: "todo", createdAt: ago(0, "08:10"), origin: "manual" },
    { id: "st4", title: "Պատասխանել հյուրին. «Ունե՞ք էլեկտրամեքենայի լիցքավորման կետ»", detail: "Օգնականը չուներ հաստատված պատասխան և հարցը փոխանցեց անձնակազմին։", assigneeId: "s-gohar", priority: "high", due: baseDate, status: "todo", createdAt: ago(1, "23:52"), origin: "assistant", link: { kind: "conversation", id: "c2" } },
    { id: "st5", title: "Ամփոփել նոյեմբերի կարծիքները", assigneeId: "s-narek", priority: "low", due: addDays(baseDate, 4), status: "todo", createdAt: ago(2, "09:00"), origin: "manual" },
    { id: "st6", title: "Թարմացնել ձմեռային փաթեթների լուսանկարները կայքում", assigneeId: "s-narek", priority: "low", due: addDays(baseDate, -1), status: "done", createdAt: ago(6, "11:00"), origin: "manual" },
  ];

  /* ---------- assistant conversations (history) ---------- */
  const msg = (id: string, from: ChatMsg["from"], text: string, at: number, intent?: string): ChatMsg => ({ id, from, text, at, intent });
  const conversations: Conversation[] = [
    {
      id: "c1", lang: "ru", channel: "website", guestName: "Ольга", startedAt: ago(0, "01:12"), afterHours: true, status: "resolved", unanswered: [],
      messages: [
        msg("c1a", "guest", "Здравствуйте! Во сколько заезд и выезд?", ago(0, "01:12")),
        msg("c1b", "assistant", "Заезд с 14:00, выезд до 12:00. Ранний заезд — по наличию, уточняет ресепшн.", ago(0, "01:12"), "checkin"),
        msg("c1c", "guest", "А парковка есть?", ago(0, "01:13")),
        msg("c1d", "assistant", "Да, парковка для гостей бесплатная.", ago(0, "01:13"), "parking"),
      ],
    },
    {
      id: "c2", lang: "en", channel: "website", guestName: "James", startedAt: ago(1, "23:50"), afterHours: true, status: "handoff", unanswered: ["Do you have an EV charging station?"],
      messages: [
        msg("c2a", "guest", "Hi, do you have an EV charging station?", ago(1, "23:50")),
        msg("c2b", "assistant", "I don't have verified information about that, so I've passed your question to our team. Reception will reply after 08:00.", ago(1, "23:50"), "handoff"),
      ],
    },
    {
      id: "c3", lang: "hy", channel: "website", guestName: "Լուսինե", startedAt: ago(1, "14:05"), afterHours: false, status: "resolved", unanswered: [],
      messages: [
        msg("c3a", "guest", "Բարև Ձեզ, կարո՞ղ ենք շան հետ գալ։", ago(1, "14:05")),
        msg("c3b", "assistant", "Այո, փոքր կենդանիներն ընդունվում են։ Վճարը՝ 10 000 ֏ մեկ գիշերվա համար։ Խնդրում ենք նախապես նշել ամրագրման ժամանակ։", ago(1, "14:05"), "pets"),
      ],
    },
    {
      id: "c4", lang: "ru", channel: "website", guestName: "Дмитрий", startedAt: ago(2, "22:40"), afterHours: true, status: "handoff", unanswered: ["Можно ли арендовать сноуборд у вас в отеле?"],
      messages: [
        msg("c4a", "guest", "Можно ли арендовать сноуборд у вас в отеле?", ago(2, "22:40")),
        msg("c4b", "assistant", "У меня нет проверенной информации об этом. Я передал вопрос сотрудникам — ресепшн ответит после 08:00.", ago(2, "22:40"), "handoff"),
      ],
    },
    {
      id: "c5", lang: "en", channel: "website", guestName: "Emma", startedAt: ago(3, "19:20"), afterHours: false, status: "resolved", unanswered: [],
      messages: [
        msg("c5a", "guest", "How far is the ski lift?", ago(3, "19:20")),
        msg("c5b", "assistant", "The Tsaghkadzor ropeway is about 5 minutes by car, and we run a free shuttle for guests.", ago(3, "19:20"), "ski"),
      ],
    },
  ];

  /* ---------- simulated messages history ---------- */
  const outbox: OutboxItem[] = [];
  let o = 0;
  for (const res of reservations) {
    const g = guests.find((x) => x.id === res.guestId)!;
    if (res.status === "confirmed" && res.checkIn === addDays(baseDate, 1)) {
      outbox.push({ id: `o${++o}`, at: atTime(baseDate, "10:00"), channel: "whatsapp", to: `${g.firstName} ${g.lastName}`, template: "Նախաժամանման հաղորդագրություն", text: "Վաղը սպասում ենք Ձեզ։ Մուտքը՝ 14:00-ից, ավտոկայանատեղին անվճար է։", state: "simulated", workflowId: "pre_arrival", reservationId: res.id });
    }
    if (res.status === "checked_out" && res.checkOut === addDays(baseDate, -1)) {
      outbox.push({ id: `o${++o}`, at: atTime(baseDate, "11:00"), channel: "email", to: `${g.firstName} ${g.lastName}`, template: "Կարծիքի հարցում", text: "Շնորհակալություն, որ ընտրեցիք Pine Ridge-ը։ Կկիսվե՞ք Ձեր կարծիքով։", state: "simulated", workflowId: "review_request", reservationId: res.id });
    }
  }

  const activity: ActivityItem[] = [
    { id: "a1", at: atTime(baseDate, "09:12"), icon: "inquiry", text: "Նոր հարցում հեռախոսով՝ Դասական երկտեղանի", by: "Գոհար Սարգսյան" },
    { id: "a2", at: atTime(baseDate, "09:10"), icon: "maint", text: "Սենյակ 304. պահեստամասը պատվիրված է", by: "Արմեն Ղազարյան" },
    { id: "a3", at: atTime(baseDate, "08:25"), icon: "maint", text: "Նոր տեխնիկական հայտ՝ սենյակ 207", by: "Անահիտ Գրիգորյան" },
    { id: "a4", at: atTime(baseDate, "08:00"), icon: "auto", text: "Ստեղծվեցին ժամանման նախապատրաստման առաջադրանքներ վաղվա համար", by: "Ավտոմատացում", automated: true },
    { id: "a5", at: atTime(addDays(baseDate, -1), "23:52"), icon: "auto", text: "Չպատասխանված հարց → առաջադրանք ընդունարանին", by: "Ավտոմատացում", automated: true },
    { id: "a6", at: atTime(addDays(baseDate, -1), "23:48"), icon: "inquiry", text: "Նոր հարցում Instagram-ից՝ Ջունիոր սյուիտ", by: "Համակարգ" },
  ];

  const workflows: Record<WorkflowId, boolean> = {
    inquiry_alert: true, approve_calendar: true, approve_prep_task: true, pre_arrival: true, checkout_task: true, review_request: true, unanswered_followup: true,
  };

  const staff = STAFF.map((x) => ({ ...x }));
  const hosp = hospitalitySeed(baseDate, r, guests, reservations, staff);

  return {
    ...hosp,
    baseDate,
    clock: { mode: "live" },
    roomTypes: ROOM_TYPES,
    rooms: ROOMS,
    hk,
    guests,
    reservations,
    hkTasks,
    maint,
    staff,
    staffTasks,
    conversations,
    outbox,
    activity,
    notifications: [
      { id: "n1", at: atTime(addDays(baseDate, -1), "23:48"), text: "Նոր հարցում՝ Ջունիոր սյուիտ (Instagram)", href: "/admin/reservations?status=inquiry", read: false, kind: "inquiry" },
      { id: "n2", at: atTime(addDays(baseDate, -1), "23:52"), text: "Օգնականը հարց է փոխանցել անձնակազմին", href: "/admin/assistant", read: false, kind: "handoff" },
    ],
    workflows,
    kb: { ...DEFAULT_KB },
    seq: n,
  };
}

export type { Lang };
