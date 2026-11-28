/*
 * Deterministic seed for Hotel OS operations: unified inbox, reviews, channel-manager sync state,
 * lost & found. Everything here is fictional demo data. Channel names describe where a message or review
 * WOULD come from once an approved integration exists; nothing is connected.
 */
import { addDays, atTime } from "./dates.ts";
import { COMMISSION_PCT } from "./channel-adapters.ts";
import type { Guest, InboxThread, LostItem, OpsState, Reservation, Review, ReviewPlatform, SyncLogEntry, Lang } from "./types.ts";

function seeded(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}

const REVIEW_TEMPLATES: { rating: number; lang: Lang; title: string; text: string }[] = [
  { rating: 5, lang: "en", title: "Perfect winter weekend", text: "Spotless room, very friendly reception staff and a great breakfast. The spa was the highlight. Close to the ropeway." },
  { rating: 5, lang: "ru", title: "Отличный отдых", text: "Очень чистый номер, вкусный завтрак, персонал внимательный. Спа и бассейн — супер. Обязательно вернёмся." },
  { rating: 4, lang: "hy", title: "Հաճելի հանգիստ", text: "Սենյակը մաքուր էր, անձնակազմը՝ բարեհամբույր։ Նախաճաշը կարող էր ավելի բազմազան լինել։" },
  { rating: 4, lang: "en", title: "Lovely location", text: "Great location and helpful staff. Wi-Fi in our room was slow in the evening." },
  { rating: 3, lang: "ru", title: "Неплохо, но шумно", text: "Номер хороший, но было шумно ночью из коридора. Завтрак нормальный." },
  { rating: 5, lang: "hy", title: "Հիանալի էր", text: "Հիանալի սպա, համեղ ընթրիք բուխարու մոտ և շատ ուշադիր անձնակազմ։" },
  { rating: 2, lang: "en", title: "Cold room and slow response", text: "Our room was cold the first night and it took two hours before someone came to fix the heating. Staff apologised, but the response was slow." },
  { rating: 4, lang: "ru", title: "Хорошее соотношение цены и качества", text: "За эти деньги — отличный вариант. Чисто, тихо, удобная кровать. Парковка бесплатная." },
  { rating: 5, lang: "en", title: "Best spa in Tsaghkadzor", text: "The massage and sauna were excellent. Clean, calm and the staff remembered our names." },
  { rating: 3, lang: "hy", title: "Միջին", text: "Գտնվելու վայրը լավն է, բայց նախաճաշը միօրինակ էր և Wi‑Fi-ը թույլ էր։" },
];

const PLATFORMS: ReviewPlatform[] = ["google", "booking", "tripadvisor", "expedia"];

export function opsSeed(baseDate: string, reservations: Reservation[], guests: Guest[]): OpsState {
  const r = seeded(`ops-${baseDate}`);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];

  /* ---- channel-manager state: OTA reservations get an external reference (demo adapter, see channel-adapters.ts) ---- */
  const syncLog: SyncLogEntry[] = [];
  let n = 0;
  for (const res of reservations) {
    if (res.source !== "booking" && res.source !== "airbnb") continue;
    const channel = res.source;
    const externalId = `${channel === "booking" ? "BDC" : "ABB"}-${(4100000 + n++ * 37).toString()}`;
    res.external = { channel, externalId, version: 1, syncState: "synced", lastSyncAt: res.createdAt, commissionPct: COMMISSION_PCT[channel] };
    if (res.createdAt > atTime(addDays(baseDate, -14), "00:00")) syncLog.push({ id: `sl-${n}`, at: res.createdAt, channel, op: "import", externalId, result: "ok", text: `Ամրագրումը ներմուծվեց (${res.code})`, reservationId: res.id });
  }
  syncLog.push({ id: "sl-fail-1", at: atTime(baseDate, "07:42"), channel: "expedia", op: "import", externalId: "EXP-77120931", result: "failed", text: "Ալիքը չպատասխանեց ժամանակին (ցուցադրական սխալ)․ կարելի է կրկնել" });
  syncLog.sort((a, b) => b.at - a.at);

  /* ---- unified inbox ---- */
  const inHouse = reservations.find((x) => x.status === "checked_in" && x.roomId);
  const otaArrival = reservations.find((x) => x.source === "booking" && x.status === "confirmed" && x.checkIn >= baseDate);
  const otaGuest = otaArrival ? guests.find((g) => g.id === otaArrival.guestId) : undefined;
  const t = (hhmm: string, d = 0) => atTime(addDays(baseDate, d), hhmm);
  const th = (x: Partial<InboxThread> & Pick<InboxThread, "id" | "channel" | "contact" | "messages">): InboxThread => ({
    status: "new", priority: "normal", assigneeId: null, dept: "reception", tags: [], createdAt: x.messages[0].at, lastInboundAt: x.messages.filter((m) => m.dir === "in").slice(-1)[0]?.at ?? x.messages[0].at, audit: [{ at: x.messages[0].at, text: "Զրույցը ստացվեց", by: "Համակարգ" }], ...x,
  });
  const inbox: InboxThread[] = [
    th({ id: "it-1", channel: "whatsapp", contact: { name: "Мария К.", handle: "+7 900 000 41 22", lang: "ru" }, tags: ["ամրագրում"], messages: [{ id: "im1", dir: "in", text: "Здравствуйте! Есть ли свободный номер на следующие выходные для двоих? Сколько будет стоить?", at: t("09:12") }] }),
    th({ id: "it-2", channel: "instagram", contact: { name: "Lena", handle: "@lena.travels.demo", lang: "en" }, messages: [{ id: "im2", dir: "in", text: "Hi! Do you allow dogs? We would come with a small one in January.", at: t("08:47") }] }),
    th({ id: "it-3", channel: "messenger", contact: { name: "Արամ", handle: "Aram (Messenger)", lang: "hy" }, status: "resolved", assigneeId: "s-davit", firstResponseAt: t("18:09", -1), messages: [{ id: "im3", dir: "in", text: "Բարև, ունե՞ք անվճար ավտոկայանատեղի։", at: t("18:02", -1) }, { id: "im3b", dir: "out", text: "Բարև Ձեզ, Արամ։ Այո, հյուրանոցում ավտոկայանատեղին անվճար է։ Սպասում ենք Ձեզ։", at: t("18:09", -1), by: "s-davit", ai: true }] }),
    th({ id: "it-4", channel: "email", contact: { name: "John D.", handle: "john.d@example.com", lang: "en" }, status: "pending", priority: "high", assigneeId: "s-gohar", tags: ["վճարում"], firstResponseAt: t("16:30", -1), messages: [{ id: "im4", dir: "in", text: "Hello, I cancelled my booking last week. When will I receive my refund?", at: t("15:55", -1) }, { id: "im4n", dir: "note", text: "Ստուգել չեղարկման պայմանները և վճարման կարգավիճակը մինչ պատասխանելը։", at: t("16:20", -1), by: "s-gohar" }, { id: "im4b", dir: "out", text: "Dear John, thank you for your message. We are checking your booking and will reply with the details today.", at: t("16:30", -1), by: "s-gohar" }] }),
    th({ id: "it-5", channel: "booking", contact: { name: otaGuest ? `${otaGuest.firstName} ${otaGuest.lastName[0] ?? ""}.` : "Booking guest", handle: otaArrival?.external?.externalId ?? "BDC", lang: otaGuest?.lang ?? "en" }, guestId: otaGuest?.id, reservationId: otaArrival?.id, messages: [{ id: "im5", dir: "in", text: otaGuest?.lang === "ru" ? "Мы приедем около 23:00. Возможен ли поздний заезд?" : "We will arrive around 23:00. Is a late check-in possible?", at: t("07:58") }] }),
    th({ id: "it-6", channel: "webchat", contact: { name: "Website visitor", handle: "web-8841", lang: "en" }, status: "resolved", firstResponseAt: t("21:14", -1), tags: ["auto"], messages: [{ id: "im6", dir: "in", text: "What time is breakfast?", at: t("21:14", -1) }, { id: "im6b", dir: "out", text: "Breakfast is served daily from 07:30 to 10:30 and is included in the room rate.", at: t("21:14", -1), by: "AI", ai: true }] }),
    th({ id: "it-7", channel: "whatsapp", contact: { name: inHouse ? guests.find((g) => g.id === inHouse.guestId)?.firstName ?? "Guest" : "Guest", handle: "+374 00 555 7731", lang: "ru" }, guestId: inHouse?.guestId, reservationId: inHouse?.id, status: "open", priority: "high", dept: "maintenance", assigneeId: "s-armen", firstResponseAt: t("08:31"), tags: ["տեխնիկական"], messages: [{ id: "im7", dir: "in", text: `В номере ${inHouse?.roomId ?? ""} не работает кондиционер, очень жарко.`, at: t("08:26") }, { id: "im7b", dir: "out", text: "Извините за неудобство! Техник уже направлен к вам в номер.", at: t("08:31"), by: "s-gohar" }, { id: "im7s", dir: "system", text: "Ստեղծվեց տեխնիկական հայտ և նշանակվեց Արմենին", at: t("08:31") }] }),
    th({ id: "it-8", channel: "instagram", contact: { name: "Նարինե", handle: "@narine.demo", lang: "hy" }, status: "new", messages: [{ id: "im8", dir: "in", text: "Բարև Ձեզ, ունե՞ք սպա փաթեթ զույգերի համար այս շաբաթավերջին։", at: t("09:40") }] }),
  ];

  /* ---- reviews (fictional; platform = where it would be published) ---- */
  const reviews: Review[] = [];
  const authors = ["Anna M.", "Сергей П.", "Լուսինե Ա.", "Mark T.", "Ольга В.", "Davit H.", "Emma R.", "Арсен К.", "Sophie L.", "Գոհար Մ."];
  const stays = reservations.filter((x) => x.status === "checked_out").slice(-80);
  for (let i = 0; i < 38; i++) {
    const tpl = i === 0 ? REVIEW_TEMPLATES[6] : pick(REVIEW_TEMPLATES);
    const platform = i === 0 ? "booking" : pick(PLATFORMS);
    const daysAgo = i === 0 ? 0 : Math.floor(1 + r() * 120);
    const at = atTime(addDays(baseDate, -daysAgo), `${String(8 + Math.floor(r() * 12)).padStart(2, "0")}:${String(Math.floor(r() * 59)).padStart(2, "0")}`);
    const recent = daysAgo <= 3;
    const replied = !recent && r() < 0.85;
    const canReply = platform === "google" || platform === "booking";
    reviews.push({
      id: `rv-${i + 1}`, platform, rating: tpl.rating, lang: tpl.lang, author: pick(authors), title: tpl.title, text: tpl.text, at, reservationId: stays[i % Math.max(1, stays.length)]?.id,
      status: replied ? (canReply ? "published_demo" : "manual_required") : "new",
      reply: replied ? { text: tpl.lang === "ru" ? "Спасибо за ваш отзыв! Будем рады видеть вас снова в Pine Ridge." : tpl.lang === "hy" ? "Շնորհակալություն կարծիքի համար։ Սպասում ենք Ձեզ կրկին Pine Ridge-ում։" : "Thank you for your review! We look forward to welcoming you back to Pine Ridge.", by: "s-narek", at: at + 86400e3, approvedBy: "s-narek", approvedAt: at + 86400e3 } : undefined,
    });
  }
  reviews.sort((a, b) => b.at - a.at);

  const lostFound: LostItem[] = [
    { id: "lf-1", roomId: "204", item: "Սև շարֆ", foundAt: t("11:20", -2), foundBy: "s-lilit", status: "stored" },
    { id: "lf-2", roomId: "C1", item: "Մանկական ձեռնոցներ", foundAt: t("12:05", -6), foundBy: "s-mariam", status: "returned", note: "Վերադարձվեց հյուրին փոստով" },
    { id: "lf-3", roomId: null, item: "Լիցքավորիչ (USB‑C), լոբբի", foundAt: t("19:40", -1), foundBy: "s-davit", status: "stored" },
  ];

  return { inbox, reviews, syncLog, lostFound, autoLog: [] };
}
