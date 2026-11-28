/*
 * Inbox AI (demo implementation, deterministic — no LLM call).
 * - detects language and intent,
 * - classifies risk; HIGH-risk topics (payments, refunds, cancellations, medical, legal, complaints,
 *   unconfirmed availability) are NEVER auto-answered and always need a person,
 * - drafts a reply ONLY from approved hotel facts (state.kb) and cites them.
 * Production swaps `draftReply` for an LLM constrained to the same facts + the same risk gate.
 */
import type { HotelState, Lang } from "../types.ts";

export type Intent =
  | "availability" | "price" | "checkin_time" | "late_checkin" | "parking" | "pets" | "wifi" | "breakfast" | "transfer" | "spa"
  | "cancellation" | "refund" | "payment" | "complaint" | "maintenance" | "medical" | "legal" | "greeting" | "other";

export const HIGH_RISK: Intent[] = ["availability", "cancellation", "refund", "payment", "complaint", "medical", "legal", "maintenance"];

const KW: [Intent, RegExp][] = [
  ["medical", /doctor|ambulance|hospital|injur|allerg(ic|y) reaction|врач|скорая|больниц|травм|բժիշկ|շտապ օգնություն/i],
  ["legal", /lawyer|legal|court|police|sue|адвокат|суд|полиц|юрист|փաստաբան|դատարան|ոստիկան/i],
  ["refund", /refund|money back|возврат|вернуть деньги|վերադարձ.*գումար|գումարի վերադարձ/i],
  ["payment", /pay|card|invoice|deposit|оплат|карт|счёт|счет|депозит|վճար|քարտ|հաշիվ/i],
  ["cancellation", /cancel|отмен|չեղարկ/i],
  ["maintenance", /not working|broken|air ?con|heating|leak|не работает|сломал|кондиционер|отоплен|протека|չի աշխատում|կոտրված|օդորակիչ|ջեռուցում/i],
  ["complaint", /dirty|rude|disappoint|terrible|cold room|noise|noisy|complain|грязн|груб|ужасн|шум|холодн|жалоб|կեղտոտ|աղմուկ|սառն|դժգոհ|բողոք/i],
  ["late_checkin", /late check-?in|arrive (late|around 2[2-3]|at 2[2-3])|поздн(ий|о) заезд|приед.* 2[2-3]|ուշ (ժամ|մուտք)/i],
  ["availability", /availab|free room|any rooms?|vacanc|свободн|есть ли (номер|места)|ազատ սենյակ|կա՞ ազատ/i],
  ["price", /price|cost|how much|rate|стоит|цена|стоимост|ինչ արժե|գին/i],
  ["checkin_time", /check-?in time|check-?out time|what time.*(check|arriv)|время заезда|расчетный час|մուտքի ժամ|ելքի ժամ/i],
  ["parking", /parking|park the car|парков|ավտոկայան/i],
  ["pets", /dog|cat|pet|собак|кошк|животн|շուն|կատու|կենդանի/i],
  ["wifi", /wi-?fi|internet|интернет|ինտերնետ/i],
  ["breakfast", /breakfast|завтрак|նախաճաշ/i],
  ["transfer", /transfer|airport|taxi|трансфер|аэропорт|տրանսֆեր|օդանավակայան/i],
  ["spa", /spa|massage|sauna|pool|спа|массаж|сауна|бассейн|սպա|մերսում|սաունա|լողավազան/i],
  ["greeting", /^(hi|hello|hey|привет|здравствуйте|բարև)[!. ]*$/i],
];

export function detectLang(text: string): Lang {
  if (/[Ա-֏]/.test(text)) return "hy";
  if (/[Ѐ-ӿ]/.test(text)) return "ru";
  return "en";
}

export function classify(text: string): { intents: Intent[]; primary: Intent; risk: "low" | "high" } {
  const intents = KW.filter(([, re]) => re.test(text)).map(([i]) => i);
  const primary = intents[0] ?? "other";
  const risk = intents.some((i) => HIGH_RISK.includes(i)) || primary === "other" ? "high" : "low";
  return { intents: intents.length ? intents : ["other"], primary, risk };
}

export type Draft = { text: string; lang: Lang; intents: Intent[]; risk: "low" | "high"; sources: string[]; autoAllowed: boolean; reason: string };

type L3 = Record<Lang, string>;
const say = (lang: Lang, x: L3) => x[lang];

/** Draft a reply to the latest inbound message. Facts come only from state.kb; unknowns are routed to a person. */
export function draftReply(state: HotelState, text: string, name?: string): Draft {
  const lang = detectLang(text);
  const { intents, risk } = classify(text);
  const kb = state.kb;
  const parts: string[] = [];
  const sources: string[] = [];
  const hi = say(lang, { hy: `Բարև Ձեզ${name ? `, ${name}` : ""}։`, ru: `Здравствуйте${name ? `, ${name}` : ""}!`, en: `Hello${name ? ` ${name}` : ""},` });
  for (const i of intents) {
    if (i === "breakfast") { parts.push(say(lang, { hy: `Նախաճաշը՝ ամեն օր ${kb.breakfast}${kb.breakfastIncluded ? ", ներառված է գնի մեջ" : ""}։`, ru: `Завтрак ежедневно ${kb.breakfast}${kb.breakfastIncluded ? ", включён в стоимость" : ""}.`, en: `Breakfast is served daily ${kb.breakfast}${kb.breakfastIncluded ? " and is included in the rate" : ""}.` })); sources.push("kb.breakfast"); }
    if (i === "parking") { parts.push(say(lang, kb.parking === "free" ? { hy: "Ավտոկայանատեղին անվճար է հյուրերի համար։", ru: "Парковка для гостей бесплатная.", en: "Parking is free for guests." } : { hy: "Ավտոկայանատեղիի մանրամասները կճշտի ընդունարանը։", ru: "Детали парковки уточнит ресепшн.", en: "Reception will confirm the parking details." })); sources.push("kb.parking"); }
    if (i === "pets") { parts.push(say(lang, kb.pets === "allowed_small" ? { hy: `Փոքր կենդանիները թույլատրվում են (${kb.petFee.toLocaleString("en-US")} ֏ գիշերը)։`, ru: `Небольшие животные разрешены (${kb.petFee.toLocaleString("en-US")} ֏ за ночь).`, en: `Small pets are welcome (${kb.petFee.toLocaleString("en-US")} AMD per night).` } : { hy: "Ցավոք, կենդանիներ չեն թույլատրվում։", ru: "К сожалению, с животными нельзя.", en: "Unfortunately pets are not allowed." })); sources.push("kb.pets"); }
    if (i === "wifi" && kb.wifi) { parts.push(say(lang, { hy: "Անվճար Wi‑Fi ամբողջ հյուրանոցում։", ru: "Бесплатный Wi‑Fi по всему отелю.", en: "Free Wi‑Fi throughout the hotel." })); sources.push("kb.wifi"); }
    if (i === "checkin_time") { parts.push(say(lang, { hy: `Մուտքը՝ ${kb.checkIn}-ից, ելքը՝ մինչև ${kb.checkOut}։`, ru: `Заезд с ${kb.checkIn}, выезд до ${kb.checkOut}.`, en: `Check-in is from ${kb.checkIn}, check-out until ${kb.checkOut}.` })); sources.push("kb.checkIn", "kb.checkOut"); }
    if (i === "late_checkin") { parts.push(say(lang, { hy: `Ընդունարանն աշխատում է ${kb.receptionHours}։ Ուշ ժամանման մասին կհաստատենք Ձեզ։`, ru: `Ресепшн работает ${kb.receptionHours}. Поздний заезд подтвердим отдельно.`, en: `Reception hours are ${kb.receptionHours}. We will confirm your late arrival personally.` })); sources.push("kb.receptionHours"); }
    if (i === "transfer") { parts.push(say(lang, { hy: `Տրանսֆեր օդանավակայանից՝ ${kb.airportTransfer.toLocaleString("en-US")} ֏։`, ru: `Трансфер из аэропорта — ${kb.airportTransfer.toLocaleString("en-US")} ֏.`, en: `An airport transfer costs ${kb.airportTransfer.toLocaleString("en-US")} AMD.` })); sources.push("kb.airportTransfer"); }
    if (i === "spa") { parts.push(say(lang, { hy: `Սպան աշխատում է ${kb.spaHours}։ Ամրագրումը կհաստատի մեր թիմը։`, ru: `Спа работает ${kb.spaHours}. Запись подтвердит наша команда.`, en: `The spa is open ${kb.spaHours}. Our team will confirm the booking.` })); sources.push("kb.spaHours"); }
    if (i === "availability" || i === "price") { parts.push(say(lang, { hy: "Ազատ սենյակները և ճշգրիտ գինը կստուգենք և կհաստատենք Ձեզ։ Խնդրում ենք նշել ամսաթվերը և հյուրերի քանակը։", ru: "Мы проверим наличие и точную стоимость и подтвердим вам. Пожалуйста, укажите даты и количество гостей.", en: "We will check availability and the exact price and confirm. Please share your dates and number of guests." })); sources.push("policy: availability is confirmed by staff"); }
    if (i === "cancellation") { parts.push(say(lang, { hy: `Անվճար չեղարկումը հնարավոր է մինչև ժամանումից ${kb.cancellation} օր առաջ։ Ձեր ամրագրման մանրամասները կստուգի աշխատակիցը։`, ru: `Бесплатная отмена возможна за ${kb.cancellation} дн. до заезда. Детали вашей брони проверит сотрудник.`, en: `Free cancellation is possible up to ${kb.cancellation} days before arrival. A team member will check your booking.` })); sources.push("kb.cancellation"); }
  }
  const unknown = intents.includes("other") || parts.length === 0;
  const handoff = say(lang, { hy: "Մեր աշխատակիցը կպատասխանի Ձեզ շուտով։", ru: "Наш сотрудник скоро ответит вам.", en: "A member of our team will get back to you shortly." });
  const body = [hi, ...new Set(parts), ...(risk === "high" || unknown ? [handoff] : [])].join(" ");
  const autoAllowed = risk === "low" && !unknown && intents.every((i) => !HIGH_RISK.includes(i));
  const reason = autoAllowed ? "Ցածր ռիսկ․ պատասխանը ամբողջությամբ հաստատված տվյալներից է" : intents.some((i) => ["payment", "refund"].includes(i)) ? "Վճարում/վերադարձ․ պահանջվում է աշխատակցի հաստատում" : intents.includes("medical") ? "Բժշկական հարց․ անմիջապես մարդ" : intents.includes("legal") ? "Իրավական հարց․ միայն ղեկավարը" : intents.includes("availability") ? "Հասանելիությունը հաստատում է աշխատակիցը" : unknown ? "Հաստատված պատասխան չկա" : "Բարձր ռիսկ․ պահանջվում է հաստատում";
  return { text: body, lang, intents, risk: autoAllowed ? "low" : "high", sources: [...new Set(sources)], autoAllowed, reason };
}

/** Department routing suggestion from intent. */
export function routeDept(intents: Intent[]) {
  if (intents.includes("maintenance")) return "maintenance" as const;
  if (intents.includes("spa")) return "spa" as const;
  if (intents.some((i) => ["refund", "payment", "legal"].includes(i))) return "management" as const;
  return "reception" as const;
}

export const SAVED_REPLIES: { id: string; title: string; text: Record<Lang, string> }[] = [
  { id: "thanks", title: "Շնորհակալություն", text: { hy: "Շնորհակալություն Ձեր հաղորդագրության համար։ Սիրով կօգնենք։", ru: "Спасибо за сообщение! С радостью поможем.", en: "Thank you for your message — happy to help." } },
  { id: "dates", title: "Խնդրել ամսաթվեր", text: { hy: "Խնդրում ենք նշել ժամանման և մեկնման ամսաթվերը և հյուրերի քանակը։", ru: "Пожалуйста, укажите даты заезда и выезда и количество гостей.", en: "Could you share your arrival and departure dates and the number of guests?" } },
  { id: "checking", title: "Ստուգում ենք", text: { hy: "Ստուգում ենք և կպատասխանենք մոտ 15 րոպեում։", ru: "Проверяем и ответим примерно через 15 минут.", en: "We are checking and will reply within about 15 minutes." } },
  { id: "direct", title: "Ուղիղ ամրագրման հղում", text: { hy: "Կարող եք ամրագրել ուղիղ մեր կայքում՝ լավագույն պայմաններով։", ru: "Вы можете забронировать напрямую на нашем сайте на лучших условиях.", en: "You can book directly on our website with the best conditions." } },
];
