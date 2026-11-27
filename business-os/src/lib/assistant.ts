/*
 * Scripted hotel assistant (no LLM). It answers ONLY from the hotel's data:
 * knowledge base (state.kb), room types, the rate table and the live calendar.
 * Anything it cannot answer from that data is handed off to staff.
 * It never confirms a booking — it collects a request that staff must approve.
 *
 * The AssistantEngine shape (input → messages + quick replies + action) is the seam where a
 * real LLM with tool calls can be plugged in later, behind the same rules.
 */
import { addDays, nextFriday } from "./dates.ts";
import { ATTRACTIONS, OFFERS, ROOM_TYPES, roomType } from "./hotel-data.ts";
import { fitsGuests, freeRooms, fromRate, quote } from "./pricing.ts";
import type { ChatCard, HotelState, Lang, RoomTypeId } from "./types.ts";

export type QuickReply = { id: string; label: string };
export type BookingPrefill = { typeId?: RoomTypeId; checkIn?: string; checkOut?: string; adults?: number; children?: number };
export type AssistantReply = {
  messages: { text: string; intent: string; cards?: ChatCard[] }[];
  quick: QuickReply[];
  action?: { type: "handoff"; question: string } | { type: "booking"; prefill: BookingPrefill };
};

const L = (lang: Lang, t: Record<Lang, string>) => t[lang];
const amd = (n: number) => `${n.toLocaleString("en-US").replace(/,/g, " ")} ֏`;

const KW: Record<string, string[]> = {
  human: ["մարդու հետ", "օպերատոր", "աշխատակց", "կապվեք", "զանգահարեք", "оператор", "живым человеком", "с человеком", "менеджер", "позвон", "сотрудник", "human", "talk to a person", "real person", "staff", "call me", "operator", "manager"],
  thanks: ["շնորհակալ", "մերսի", "спасибо", "благодар", "thanks", "thank you"],
  cancel: ["չեղարկ", "отмен", "возврат", "cancel", "refund"],
  checkin: ["մուտք", "ելք", "մուտքագր", "check-in", "check in", "checkout", "check-out", "check out", "заезд", "выезд", "заселен", "во сколько", "early", "late"],
  breakfast: ["նախաճաշ", "завтрак", "breakfast"],
  parking: ["կայանատեղ", "ավտոկայան", "մեքենա", "парков", "машин", "parking", "park"],
  wifi: ["wifi", "wi-fi", "wi fi", "вай", "интернет", "ինտերնետ", "վայֆայ", "internet"],
  pets: ["շուն", "շան", "կատու", "կենդանի", "собак", "кошк", "животн", "питом", "pet", "dog", "cat"],
  ski: ["դահուկ", "ճոպանուղ", "лыж", "канатн", "горнолыж", "сноуборд", "ski", "ropeway", "lift", "slope", "snowboard"],
  spa: ["սպա", "սաունա", "լողավազան", "մերսում", "спа", "саун", "бассейн", "массаж", "spa", "sauna", "pool", "massage"],
  offers: ["առաջարկ", "փաթեթ", "ակցիա", "ամանոր", "предложен", "акци", "пакет", "новый год", "скидк", "offer", "package", "deal", "new year", "discount"],
  attractions: ["տեսարժան", "ինչ անել", "վանք", "սևան", "կեչառիս", "достопримеч", "что посмотреть", "севан", "монастыр", "кечарис", "attraction", "what to do", "sightseeing", "monastery", "sevan", "kecharis"],
  location: ["որտեղ", "հասնել", "ճանապարհ", "տրանսֆեր", "օդանավակայան", "հասցե", "где", "добрат", "доехать", "трансфер", "аэропорт", "адрес", "where", "get there", "transfer", "airport", "directions", "location", "address", "how far"],
  availability: ["ազատ", "ամրագր", "հանգստյան", "свобод", "брон", "выходн", "есть ли номер", "available", "availability", "book", "reserve", "weekend", "vacanc"],
  price: ["գին", "արժե", "ինչքան", "որքան", "цен", "стоим", "сколько", "price", "cost", "rate", "how much"],
  family: ["երեխա", "ընտանիք", "ընտանեկ", "дет", "семь", "семейн", "ребен", "child", "kid", "family"],
  rooms: ["սենյակ", "սյուիտ", "տնակ", "номер", "сюит", "шале", "коттедж", "room", "suite", "chalet", "cottage"],
  greet: ["բարև", "ողջույն", "привет", "здравств", "добрый", "hello", "hi", "hey", "good evening", "good morning"],
};

const TYPE_KW: [RoomTypeId, string[]][] = [
  ["family", ["ընտանեկ", "семейн", "family"]],
  ["chalet", ["շալե", "տնակ", "шале", "коттедж", "chalet", "cottage"]],
  ["junior", ["ջունիոր", "սյուիտ", "джуниор", "сюит", "junior", "suite"]],
  ["deluxe", ["դելյուքս", "делюкс", "deluxe", "mountain view"]],
  ["classic", ["դասական", "класс", "стандарт", "classic", "standard", "double"]],
];

export function detectIntents(text: string): string[] {
  const t = ` ${text.toLowerCase()} `;
  return Object.entries(KW).filter(([k, words]) => words.some((w) => (k === "greet" ? new RegExp(`(^|[^a-zа-яա-ֆ])${w}([^a-zа-яա-ֆ]|$)`, "i").test(t) : t.includes(w)))).map(([k]) => k);
}

export function parseRequest(text: string, today: string): BookingPrefill {
  const t = text.toLowerCase();
  const out: BookingPrefill = {};
  for (const [id, words] of TYPE_KW) if (words.some((w) => t.includes(w))) { out.typeId = id; break; }
  const people = t.match(/(\d+)\s*(հոգ|մարդ|հյուր|чел|гост|взросл|people|guests|adults|persons?|pax)/) ?? t.match(/(?:for|на|of)\s+(\d+)/);
  if (people) out.adults = Math.min(6, Number(people[1]));
  const kids = t.match(/(\d+)\s*(երեխ|дет|реб|child|kid)/);
  if (kids) { out.children = Number(kids[1]); if (out.adults) out.adults = Math.max(1, out.adults - out.children); }
  const thisWeekend = ["այս հանգստյան", "эти выходные", "на этих выходных", "this weekend"].some((w) => t.includes(w));
  const nextWeekend = ["հաջորդ հանգստյան", "следующие выходные", "на следующих выходных", "next weekend", "հանգստյան", "выходн", "weekend"].some((w) => t.includes(w));
  const tomorrow = ["վաղը", "завтра", "tomorrow", "tonight", "сегодня", "այսօր", "այս գիշեր"].some((w) => t.includes(w));
  const dm = [...t.matchAll(/(\d{1,2})[./](\d{1,2})/g)];
  if (dm.length >= 2) {
    const y = Number(today.slice(0, 4));
    const mk = (m: RegExpMatchArray) => { const d = `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; return d < today ? `${y + 1}${d.slice(4)}` : d; };
    out.checkIn = mk(dm[0]); out.checkOut = mk(dm[1]);
    if (out.checkOut <= out.checkIn) delete out.checkOut;
  } else if (thisWeekend) { out.checkIn = nextFriday(today, 0); out.checkOut = addDays(out.checkIn, 2); }
  else if (nextWeekend) { out.checkIn = nextFriday(today, 6); out.checkOut = addDays(out.checkIn, 2); }
  else if (tomorrow) { out.checkIn = t.includes("tonight") || t.includes("сегодня") || t.includes("այսօր") ? today : addDays(today, 1); out.checkOut = addDays(out.checkIn, 1); }
  return out;
}

export function startQuick(lang: Lang): QuickReply[] {
  return [
    { id: "q:availability", label: L(lang, { hy: "Ազատ սենյակներ", ru: "Свободные номера", en: "Availability" }) },
    { id: "q:price", label: L(lang, { hy: "Սենյակներ և գներ", ru: "Номера и цены", en: "Rooms & prices" }) },
    { id: "q:checkin", label: L(lang, { hy: "Մուտք / ելք", ru: "Заезд / выезд", en: "Check-in / out" }) },
    { id: "q:breakfast", label: L(lang, { hy: "Նախաճաշ", ru: "Завтрак", en: "Breakfast" }) },
    { id: "q:location", label: L(lang, { hy: "Ինչպես հասնել", ru: "Как добраться", en: "Getting here" }) },
    { id: "q:human", label: L(lang, { hy: "Կապ աշխատակցի հետ", ru: "Связаться с сотрудником", en: "Talk to staff" }) },
  ];
}

export function greeting(state: HotelState, lang: Lang): AssistantReply {
  const night = state.clock.mode === "night";
  const text = night
    ? L(lang, {
        hy: `Բարի երեկո։ Ես Pine Ridge-ի վիրտուալ օգնականն եմ։ Ընդունարանն այժմ փակ է (աշխատում է ${state.kb.receptionHours}), բայց ես կպատասխանեմ Ձեր հարցերին և կընդունեմ Ձեր հարցումը, որպեսզի առավոտյան անձնակազմը այն հաստատի։`,
        ru: `Добрый вечер! Я виртуальный ассистент Pine Ridge. Ресепшн сейчас закрыт (работает ${state.kb.receptionHours}), но я отвечу на вопросы и приму ваш запрос — утром сотрудники его подтвердят.`,
        en: `Good evening! I'm the Pine Ridge virtual assistant. Reception is closed right now (open ${state.kb.receptionHours}), but I can answer your questions and take your request so the team can confirm it in the morning.`,
      })
    : L(lang, {
        hy: "Բարև Ձեզ։ Ես Pine Ridge-ի վիրտուալ օգնականն եմ։ Կպատասխանեմ սենյակների, գների և հյուրանոցի կանոնների մասին հարցերին և կօգնեմ ուղարկել ամրագրման հարցում։",
        ru: "Здравствуйте! Я виртуальный ассистент Pine Ridge. Отвечу на вопросы о номерах, ценах и правилах отеля и помогу отправить запрос на бронирование.",
        en: "Hello! I'm the Pine Ridge virtual assistant. I can answer questions about rooms, prices and hotel policies, and help you send a booking request.",
      });
  return { messages: [{ text, intent: "greet" }], quick: startQuick(lang) };
}

function availabilityReply(state: HotelState, lang: Lang, p: BookingPrefill): AssistantReply {
  const adults = p.adults ?? 2, children = p.children ?? 0;
  if (!p.checkIn || !p.checkOut) {
    return {
      messages: [{ intent: "availability", text: L(lang, {
        hy: "Սիրով կստուգեմ։ Նշեք, խնդրեմ, ամսաթվերը և հյուրերի թիվը.",
        ru: "С удовольствием проверю. Укажите, пожалуйста, даты и количество гостей:",
        en: "Happy to check. Please choose your dates and the number of guests:",
      }) }],
      quick: [
        { id: "q:this-weekend", label: L(lang, { hy: "Այս հանգստյան օրերին", ru: "Эти выходные", en: "This weekend" }) },
        { id: "q:next-weekend", label: L(lang, { hy: "Հաջորդ հանգստյան օրերին", ru: "Следующие выходные", en: "Next weekend" }) },
      ],
      action: { type: "booking", prefill: { ...p, adults, children } },
    };
  }
  const nights = quote("classic", p.checkIn, p.checkOut).nights;
  const candidates = (p.typeId ? [p.typeId] : ROOM_TYPES.map((t) => t.id)).filter((id) => fitsGuests(id, adults, children));
  const free = candidates.filter((id) => freeRooms(state, id, p.checkIn!, p.checkOut!).length > 0);
  const fallback = !free.length && p.typeId ? ROOM_TYPES.map((t) => t.id).filter((id) => id !== p.typeId && fitsGuests(id, adults, children) && freeRooms(state, id, p.checkIn!, p.checkOut!).length > 0) : [];
  const shown = free.length ? free : fallback;
  const range = `${p.checkIn.slice(8)}.${p.checkIn.slice(5, 7)} – ${p.checkOut.slice(8)}.${p.checkOut.slice(5, 7)}`;
  if (!shown.length) {
    return {
      messages: [{ intent: "availability", text: L(lang, {
        hy: `Ցավոք, ${range} ամսաթվերին ${adults + children} հյուրի համար ազատ սենյակ մեր օրացույցում չեմ տեսնում։ Կարող եմ փոխանցել Ձեր հարցումը անձնակազմին, որ առաջարկեն այլ տարբերակ։`,
        ru: `К сожалению, на ${range} для ${adults + children} гостей свободных номеров в календаре нет. Могу передать запрос сотрудникам, чтобы они предложили вариант.`,
        en: `Unfortunately I don't see a free room for ${adults + children} guests on ${range} in our calendar. I can pass your request to the team so they can suggest an alternative.`,
      }) }],
      quick: [{ id: "q:human", label: L(lang, { hy: "Փոխանցել անձնակազմին", ru: "Передать сотрудникам", en: "Pass to staff" }) }],
    };
  }
  const head = free.length
    ? L(lang, {
        hy: `${range} (${nights} գիշեր), ${adults} մեծահասակ${children ? ` և ${children} երեխա` : ""}։ Մեր օրացույցում այս պահին ազատ են.`,
        ru: `${range} (${nights} ноч.), ${adults} взрослых${children ? ` и ${children} реб.` : ""}. Сейчас в календаре свободны:`,
        en: `${range} (${nights} night${nights > 1 ? "s" : ""}), ${adults} adult${adults > 1 ? "s" : ""}${children ? ` and ${children} child${children > 1 ? "ren" : ""}` : ""}. Free in our calendar right now:`,
      })
    : L(lang, {
        hy: `«${roomType(p.typeId!).name.hy}» սենյակն այդ օրերին ազատ չէ, բայց ազատ են.`,
        ru: `«${roomType(p.typeId!).name.ru}» на эти даты занят, но свободны:`,
        en: `The ${roomType(p.typeId!).name.en} is taken on those dates, but these are free:`,
      });
  const tail = L(lang, {
    hy: "Գները ներառում են նախաճաշը։ Սա դեռ ամրագրում չէ. ուղարկեք հարցում, և ընդունարանը կհաստատի այն։",
    ru: "Цены включают завтрак. Это ещё не бронь — отправьте запрос, и ресепшн его подтвердит.",
    en: "Prices include breakfast. This is not a booking yet — send a request and reception will confirm it.",
  });
  return {
    messages: [
      { intent: "availability", text: head, cards: [{ kind: "rooms", typeIds: shown, checkIn: p.checkIn, checkOut: p.checkOut, adults, children }] },
      { intent: "availability", text: tail },
    ],
    quick: [],
    action: { type: "booking", prefill: { ...p, adults, children, typeId: shown.includes(p.typeId!) ? p.typeId : shown[0] } },
  };
}

export function respond(state: HotelState, lang: Lang, input: string): AssistantReply {
  const today = state.baseDate;
  const kb = state.kb;
  const quickMap: Record<string, string> = {
    "q:availability": "availability", "q:price": "price", "q:checkin": "checkin", "q:breakfast": "breakfast", "q:location": "location", "q:human": "human",
  };
  let intents: string[];
  let prefill: BookingPrefill = {};
  if (input === "q:this-weekend") { prefill = { checkIn: nextFriday(today, 0), checkOut: addDays(nextFriday(today, 0), 2) }; intents = ["availability"]; }
  else if (input === "q:next-weekend") { prefill = { checkIn: nextFriday(today, 6), checkOut: addDays(nextFriday(today, 6), 2) }; intents = ["availability"]; }
  else if (quickMap[input]) intents = [quickMap[input]];
  else { intents = detectIntents(input); prefill = parseRequest(input, today); }

  const has = (k: string) => intents.includes(k);
  const wantsStay = has("availability") || ((has("rooms") || has("family") || has("price")) && !!prefill.checkIn) || (!!prefill.checkIn && !!prefill.typeId);
  if (has("human") && (input === "q:human" || !wantsStay)) {
    return {
      messages: [{ intent: "handoff", text: L(lang, {
        hy: `Իհարկե։ Ես փոխանցել եմ Ձեր խնդրանքը անձնակազմին${state.clock.mode === "night" ? `. ընդունարանը կկապվի Ձեզ հետ ${kb.receptionHours.split("–")[0]}-ից հետո` : "։ Աշխատակիցը շուտով կպատասխանի այստեղ"}։`,
        ru: `Конечно. Я передал вашу просьбу сотрудникам${state.clock.mode === "night" ? ` — ресепшн свяжется с вами после ${kb.receptionHours.split("–")[0]}` : ". Сотрудник скоро ответит здесь"}.`,
        en: `Of course. I've passed your request to our team${state.clock.mode === "night" ? ` — reception will contact you after ${kb.receptionHours.split("–")[0]}` : ". A team member will reply here shortly"}.`,
      }) }],
      quick: [],
      action: { type: "handoff", question: input.startsWith("q:") ? L(lang, { hy: "Հյուրը խնդրում է կապ աշխատակցի հետ", ru: "Гость просит связаться с сотрудником", en: "Guest asked to talk to staff" }) : input },
    };
  }
  if (wantsStay) return availabilityReply(state, lang, prefill);

  const out: AssistantReply["messages"] = [];
  const add = (intent: string, t: Record<Lang, string>) => out.push({ intent, text: L(lang, t) });

  if (has("checkin")) add("checkin", {
    hy: `Մուտքը՝ ${kb.checkIn}-ից, ելքը՝ մինչև ${kb.checkOut}։ Վաղ մուտքն ու ուշ ելքը հնարավոր են ըստ ազատ սենյակների. ընդունարանը կհաստատի։`,
    ru: `Заезд с ${kb.checkIn}, выезд до ${kb.checkOut}. Ранний заезд и поздний выезд — по наличию, подтверждает ресепшн.`,
    en: `Check-in is from ${kb.checkIn}, check-out until ${kb.checkOut}. Early check-in and late check-out depend on availability and are confirmed by reception.`,
  });
  if (has("breakfast")) add("breakfast", kb.breakfastIncluded
    ? { hy: `Նախաճաշը ներառված է բոլոր սենյակների գնի մեջ, մատուցվում է ${kb.breakfast} «Կեչի» ռեստորանում։`, ru: `Завтрак включён в стоимость всех номеров, подаётся ${kb.breakfast} в ресторане «Кечи».`, en: `Breakfast is included in all room rates and served ${kb.breakfast} at Kechi Restaurant.` }
    : { hy: `Նախաճաշը մատուցվում է ${kb.breakfast}. արժեքի մասին կտեղեկացնի ընդունարանը։`, ru: `Завтрак подаётся ${kb.breakfast}; стоимость уточнит ресепшн.`, en: `Breakfast is served ${kb.breakfast}; reception will confirm the price.` });
  if (has("parking")) add("parking", kb.parking === "free"
    ? { hy: "Այո, հյուրերի համար ավտոկայանատեղին անվճար է։", ru: "Да, парковка для гостей бесплатная.", en: "Yes, parking is free for guests." }
    : { hy: "Ավտոկայանատեղիի պայմանները կճշտի ընդունարանը։", ru: "Условия парковки уточнит ресепшн.", en: "Reception will confirm the parking conditions." });
  if (has("wifi")) add("wifi", { hy: "Այո, անվճար Wi‑Fi ամբողջ հյուրանոցում և տնակներում։", ru: "Да, бесплатный Wi‑Fi по всему отелю и в коттеджах.", en: "Yes, free Wi‑Fi throughout the hotel and the cottages." });
  if (has("pets")) add("pets", kb.pets === "allowed_small"
    ? { hy: `Փոքր կենդանիներն ընդունվում են, վճարը՝ ${amd(kb.petFee)} մեկ գիշերվա համար։ Խնդրում ենք նշել հարցման մեջ։`, ru: `Небольшие питомцы разрешены, доплата ${amd(kb.petFee)} за ночь. Пожалуйста, укажите это в запросе.`, en: `Small pets are welcome for ${amd(kb.petFee)} per night. Please mention it in your request.` }
    : { hy: "Ցավոք, կենդանիներ չենք ընդունում։", ru: "К сожалению, с животными нельзя.", en: "Unfortunately, pets are not allowed." });
  if (has("location")) add("location", {
    hy: `Pine Ridge-ը գտնվում է Ծաղկաձորում (ցուցադրական հասցե)։ Երևանից՝ ${ATTRACTIONS[3].distance.hy}, «Զվարթնոց» օդանավակայանից՝ ${ATTRACTIONS[4].distance.hy}։ Տրանսֆերը օդանավակայանից՝ ${amd(kb.airportTransfer)}, նախնական պատվերով։`,
    ru: `Pine Ridge находится в Цахкадзоре (демо-адрес). От Еревана — ${ATTRACTIONS[3].distance.ru}, от аэропорта «Звартноц» — ${ATTRACTIONS[4].distance.ru}. Трансфер из аэропорта — ${amd(kb.airportTransfer)}, по предварительному заказу.`,
    en: `Pine Ridge is in Tsaghkadzor (demo address). From Yerevan it's ${ATTRACTIONS[3].distance.en}; from Zvartnots Airport ${ATTRACTIONS[4].distance.en}. Airport transfer is ${amd(kb.airportTransfer)}, booked in advance.`,
  });
  if (has("attractions")) add("attractions", {
    hy: `Մոտակայքում. ${ATTRACTIONS.slice(0, 3).map((a) => `${a.name.hy} (${a.distance.hy})`).join(", ")}։`,
    ru: `Рядом: ${ATTRACTIONS.slice(0, 3).map((a) => `${a.name.ru} (${a.distance.ru})`).join(", ")}.`,
    en: `Nearby: ${ATTRACTIONS.slice(0, 3).map((a) => `${a.name.en} (${a.distance.en})`).join(", ")}.`,
  });
  if (has("ski")) add("ski", kb.skiShuttle
    ? { hy: `Ճոպանուղին՝ ${ATTRACTIONS[0].distance.hy}։ Հյուրերի համար կա անվճար տրանսֆեր, դահուկների պահեստ և կոշիկների չորանոց։`, ru: `Канатная дорога — ${ATTRACTIONS[0].distance.ru}. Для гостей бесплатный трансфер, лыжехранилище и сушилка для ботинок.`, en: `The ropeway is ${ATTRACTIONS[0].distance.en}. Guests get a free shuttle, ski storage and boot dryers.` }
    : { hy: `Ճոպանուղին՝ ${ATTRACTIONS[0].distance.hy}։`, ru: `Канатная дорога — ${ATTRACTIONS[0].distance.ru}.`, en: `The ropeway is ${ATTRACTIONS[0].distance.en}.` });
  if (has("spa")) add("spa", { hy: `Սպան աշխատում է ${kb.spaHours}. փակ լողավազան և սաունա, մերսումներ՝ նախնական գրանցմամբ։`, ru: `Спа работает ${kb.spaHours}: крытый бассейн и сауна, массаж по записи.`, en: `The spa is open ${kb.spaHours}: indoor pool and sauna, massages by appointment.` });
  if (has("cancel")) add("cancel", {
    hy: `Անվճար չեղարկում՝ ժամանումից մինչև ${kb.cancellation} օր առաջ։ Ավելի ուշ չեղարկման պայմանները կճշտի ընդունարանը։`,
    ru: `Бесплатная отмена — не позднее чем за ${kb.cancellation} дня до заезда. Условия более поздней отмены уточнит ресепшн.`,
    en: `Free cancellation up to ${kb.cancellation} days before arrival. Reception will confirm the terms for later cancellations.`,
  });
  if (has("offers")) add("offers", {
    hy: OFFERS.map((o) => `• ${o.title.hy}՝ ${amd(o.priceFrom)}-ից ${o.unit.hy}`).join("\n"),
    ru: OFFERS.map((o) => `• ${o.title.ru} — от ${amd(o.priceFrom)} ${o.unit.ru}`).join("\n"),
    en: OFFERS.map((o) => `• ${o.title.en} — from ${amd(o.priceFrom)} ${o.unit.en}`).join("\n"),
  });
  if ((has("price") || has("rooms") || has("family")) && !out.length) {
    const types = has("family") ? ROOM_TYPES.filter((t) => t.capacity.adults + t.capacity.children >= 4) : prefill.typeId ? [roomType(prefill.typeId)] : ROOM_TYPES;
    add("price", {
      hy: `Գները մեկ գիշերվա համար՝ նախաճաշով (հանգստյան օրերին և բարձր սեզոնին՝ ավելի բարձր).\n${types.map((t) => `• ${t.name.hy}՝ ${amd(fromRate(t.id, today))}-ից, մինչև ${t.capacity.adults + t.capacity.children} հյուր`).join("\n")}\nՃշգրիտ գինը կտեսնեք ամսաթվերը նշելուց հետո։`,
      ru: `Цены за ночь с завтраком (в выходные и высокий сезон — выше):\n${types.map((t) => `• ${t.name.ru} — от ${amd(fromRate(t.id, today))}, до ${t.capacity.adults + t.capacity.children} гостей`).join("\n")}\nТочную цену покажу, когда вы укажете даты.`,
      en: `Nightly rates with breakfast (higher on weekends and in peak season):\n${types.map((t) => `• ${t.name.en} — from ${amd(fromRate(t.id, today))}, up to ${t.capacity.adults + t.capacity.children} guests`).join("\n")}\nI'll show the exact price once you choose dates.`,
    });
    return { messages: out, quick: [{ id: "q:availability", label: L(lang, { hy: "Ստուգել ամսաթվերը", ru: "Проверить даты", en: "Check dates" }) }] };
  }
  if (has("thanks") && !out.length) add("thanks", { hy: "Խնդրեմ։ Եթե այլ հարցեր ունեք, գրեք։", ru: "Пожалуйста! Если будут вопросы — пишите.", en: "You're welcome! Let me know if there's anything else." });
  if (has("greet") && !out.length) return greeting(state, lang);

  if (!out.length) {
    return {
      messages: [{ intent: "handoff", text: L(lang, {
        hy: `Այս հարցի վերաբերյալ հաստատված տեղեկություն չունեմ, ուստի չեմ ուզում սխալ պատասխանել։ Փոխանցել եմ այն անձնակազմին${state.clock.mode === "night" ? `. ընդունարանը կպատասխանի ${kb.receptionHours.split("–")[0]}-ից հետո` : ""}։`,
        ru: `У меня нет проверенной информации по этому вопросу, и я не хочу ошибиться. Я передал его сотрудникам${state.clock.mode === "night" ? ` — ресепшн ответит после ${kb.receptionHours.split("–")[0]}` : ""}.`,
        en: `I don't have verified information about that, and I don't want to guess. I've passed your question to our team${state.clock.mode === "night" ? ` — reception will reply after ${kb.receptionHours.split("–")[0]}` : ""}.`,
      }) }],
      quick: startQuick(lang).slice(0, 3),
      action: { type: "handoff", question: input },
    };
  }
  return { messages: out, quick: [{ id: "q:availability", label: L(lang, { hy: "Ստուգել ազատ սենյակները", ru: "Проверить свободные номера", en: "Check availability" }) }] };
}
